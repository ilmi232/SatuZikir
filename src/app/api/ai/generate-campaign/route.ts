import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import type { CampaignCategory, GeneratedCampaign } from '@/types';
import { generateFallbackCampaign } from '@/lib/zikirKnowledge';
import { requireAdmin } from '@/lib/serverAuth';

const MAX_PROMPT_LENGTH = 1000;
// ~4 MB gambar asli setelah di-encode base64
const MAX_IMAGE_DATA_URL_LENGTH = 5_600_000;
const CATEGORIES: CampaignCategory[] = ['syifa', 'ramadan', 'tolak-bala', 'harian'];

const SYSTEM_INSTRUCTION =
  'Anda adalah asisten majelis zikir Islam SatuZikir. Tugas Anda adalah mengubah prompt admin menjadi detail kampanye zikir lengkap dan sahih dalam format JSON murni tanpa markdown wrapping.\n\nATURAN PENTING:\n1. Teks Arab berharakat, transliterasi Latin, dan terjemahan HARUS LENGKAP tanpa dipotong (terutama untuk shalawat/doa panjang seperti Shalawat Nariyah, Munjiyat, dll).\n2. Format angka Indonesia: tanda titik (.) adalah pemisah ribuan. Contoh "4.444" berarti 4444 (empat ribu empat ratus empat puluh empat). Pastikan target_count berupa angka bulat tanpa titik/koma.\n\nFormat output WAJIB JSON: {"title": string, "target_count": number, "category": "syifa"|"ramadan"|"tolak-bala"|"harian", "arabic_text": string, "latin_text": string, "translation_text": string, "description": string}';

/** Parse JSON keluaran model dan normalkan field-nya; null jika tidak lengkap. */
function parseModelOutput(rawText: string): GeneratedCampaign | null {
  const cleanJson = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
  const parsed = JSON.parse(cleanJson) as Partial<GeneratedCampaign>;
  if (!parsed.title || !parsed.target_count || !parsed.arabic_text) return null;

  return {
    title: String(parsed.title),
    target_count: Math.max(1, Math.round(Number(parsed.target_count))) || 10000,
    category: CATEGORIES.includes(parsed.category as CampaignCategory)
      ? (parsed.category as CampaignCategory)
      : 'syifa',
    arabic_text: String(parsed.arabic_text),
    latin_text: String(parsed.latin_text ?? ''),
    translation_text: String(parsed.translation_text ?? ''),
    description: String(parsed.description ?? ''),
  };
}

async function callNvidiaNim(
  prompt: string,
  image: string | undefined,
  apiKey: string,
  modelName: string
): Promise<{ campaign: GeneratedCampaign; modelUsed: string } | null> {
  const promptText = `Prompt Admin: "${prompt}"\n\nSusun ke dalam format JSON yang diminta.`;
  const userContent = image
    ? [
        { type: 'text', text: promptText },
        { type: 'image_url', image_url: { url: image } },
      ]
    : promptText;

  // Model utama dari env, lalu kimi-k3 sebagai cadangan
  const modelsToTry = [...new Set([modelName, 'moonshotai/kimi-k3'])];

  for (const model of modelsToTry) {
    try {
      const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: SYSTEM_INSTRUCTION },
            { role: 'user', content: userContent },
          ],
          temperature: 0.3,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        console.warn(`NVIDIA NIM (${model}) HTTP ${response.status}:`, await response.text());
        continue;
      }

      const data = await response.json();
      const campaign = parseModelOutput(data?.choices?.[0]?.message?.content || '');
      if (campaign) return { campaign, modelUsed: model };
    } catch (err) {
      console.warn(`Error calling NVIDIA NIM (${model}):`, err);
    }
  }

  return null;
}

async function callGemini(
  prompt: string,
  image: string | undefined,
  apiKey: string
): Promise<GeneratedCampaign | null> {
  const parts: ({ text: string } | { inlineData: { mimeType: string; data: string } })[] = [
    {
      text: `${SYSTEM_INSTRUCTION}\n\nPrompt Admin: "${prompt}"\n\n[Jika ada gambar, ekstrak teks Arab/Latin dari gambar, lengkapi yang kurang, dan hitung target yang diminta.]\n\nJSON Output:`,
    },
  ];

  if (image) {
    const match = image.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      parts.push({ inlineData: { mimeType: match[1], data: match[2] } });
    }
  }

  const ai = new GoogleGenAI({ apiKey });
  const models = ['gemini-3.5-flash', 'gemini-3.6-flash'];

  for (const model of models) {
    try {
      const response = await ai.models.generateContent({ model, contents: parts });
      const campaign = parseModelOutput(response.text || '');
      if (campaign) return campaign;
    } catch (err) {
      console.warn(`Gemini (${model}) attempt failed:`, err);
    }
  }

  return null;
}

export async function POST(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const body = await req.json();
    const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : '';
    const image = typeof body.image === 'string' ? body.image : undefined;

    if (!prompt && !image) {
      return NextResponse.json(
        { error: 'Prompt atau gambar kampanye tidak boleh kosong.' },
        { status: 400 }
      );
    }
    if (prompt.length > MAX_PROMPT_LENGTH) {
      return NextResponse.json(
        { error: `Prompt terlalu panjang (maksimal ${MAX_PROMPT_LENGTH} karakter).` },
        { status: 400 }
      );
    }
    if (image && (!/^data:image\/(png|jpe?g|webp|gif);base64,/.test(image) || image.length > MAX_IMAGE_DATA_URL_LENGTH)) {
      return NextResponse.json(
        { error: 'Gambar harus PNG/JPG/WEBP/GIF dengan ukuran maksimal 4 MB.' },
        { status: 400 }
      );
    }

    // 1. Google Gemini
    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    if (geminiKey) {
      const geminiResult = await callGemini(prompt, image, geminiKey);
      if (geminiResult) {
        return NextResponse.json({
          success: true,
          source: 'gemini-ai',
          campaign: geminiResult,
          note: 'Dihasilkan oleh Google Gemini AI',
        });
      }
    }

    // 2. NVIDIA NIM (GLM-5.3 / Kimi K3)
    const nvidiaKey = process.env.NVIDIA_API_KEY || process.env.KIMI_API_KEY || '';
    if (nvidiaKey) {
      const nimResult = await callNvidiaNim(
        prompt,
        image,
        nvidiaKey,
        process.env.NVIDIA_MODEL || 'z-ai/glm-5.3'
      );
      if (nimResult) {
        return NextResponse.json({
          success: true,
          source: 'nvidia-nim',
          modelName: nimResult.modelUsed,
          campaign: nimResult.campaign,
          note: `Dihasilkan oleh ${nimResult.modelUsed} via NVIDIA NIM`,
        });
      }
    }

    // 3. Fallback ke SatuZikir Verified Knowledge Engine
    return NextResponse.json({
      success: true,
      source: 'knowledge-engine',
      campaign: generateFallbackCampaign(prompt),
      note: 'Dihasilkan dari database zikir & fiqih SatuZikir.',
    });
  } catch (error) {
    console.error('Error generating campaign:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat memproses prompt AI.' },
      { status: 500 }
    );
  }
}

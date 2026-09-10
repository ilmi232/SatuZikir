import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export interface GeneratedCampaign {
  title: string;
  target_count: number;
  category: 'syifa' | 'ramadan' | 'tolak-bala';
  arabic_text: string;
  latin_text: string;
  translation_text: string;
  description: string;
}

function generateFallbackCampaign(prompt: string): GeneratedCampaign {
  const p = prompt.toLowerCase();
  const numberMatch = prompt.match(/\b\d+([.,]\d+)*\b/);
  let parsedTarget = 10000;
  if (numberMatch) {
    const rawNum = numberMatch[0].replace(/[.,]/g, '');
    const n = parseInt(rawNum, 10);
    if (!isNaN(n) && n > 0) parsedTarget = n;
  }

  if (p.includes('nariyah') || p.includes('nariyyah')) {
    return {
      title: `Shalawat Nariyah ${parsedTarget.toLocaleString('id-ID')}x untuk Kelapangan Hajat & Kesembuhan`,
      target_count: parsedTarget || 4444,
      category: 'syifa',
      arabic_text: 'اللَّهُمَّ صَلِّ صَلاَةً كَامِلَةً وَسَلِّمْ سَلاَمًا تَامًّا عَلَى سَيِّدِنَا مُحَمَّدٍ الَّذِي تَنْحَلُّ بِهِ الْعُقَدُ وَتَنْفَرِجُ بِهِ الْكُرَبُ وَتُقْضَى بِهِ الْحَوَائِجُ',
      latin_text: 'Allahumma shalli shalatan kamilatan wa sallim salaman tamman ‘ala sayyidina Muhammadinilladzi tanhallu bihil ‘uqadu wa tanfariju bihil kurabu wa tuqdha bihil hawa-iju',
      translation_text: 'Ya Allah, limpahkanlah shalawat yang sempurna dan keselamatan yang utuh kepada junjungan kami Nabi Muhammad, yang dengannya terurai segala ikatan kesusahan dan terpenuhi segala hajat.',
      description: 'Menghimpun ribuan butir Shalawat Nariyah bersama jamaah se-Nusantara. Niatkan semata memohon ridha Allah SWT, kelapangan urusan, dan kesembuhan bagi saudara-saudara kita yang sedang diuji sakit.'
    };
  }

  if (p.includes('hasbunallah') || p.includes('bala') || p.includes('bencana') || p.includes('lindung')) {
    return {
      title: `Hasbunallah Wa Ni'mal Wakil ${parsedTarget.toLocaleString('id-ID')}x Tolak Bala & Keselamatan Umat`,
      target_count: parsedTarget || 10000,
      category: 'tolak-bala',
      arabic_text: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ نِعْمَ الْمَوْلَىٰ وَنِعْمَ النَّصِيرُ',
      latin_text: 'Hasbunallah wa ni’mal wakiil, ni’mal mawla wa ni’man nashiir',
      translation_text: 'Cukuplah Allah menjadi penolong kami dan Allah adalah sebaik-baik pelindung, sebaik-baik pemimpin, dan sebaik-baik penolong.',
      description: 'Munajat akbar tolak bala dan musibah. Bersama memperteguh tawakkal kepada Allah Sang Maha Kuasa agar senantiasa menjaga negeri dan keluarga kita dari marabahaya.'
    };
  }

  if (p.includes('istighfar') || p.includes('taubat') || p.includes('ampun')) {
    return {
      title: `Istighfar Akbar ${parsedTarget.toLocaleString('id-ID')}x Pelebur Dosa & Pembuka Pintu Berkah`,
      target_count: parsedTarget || 100000,
      category: 'ramadan',
      arabic_text: 'أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْحَيَّ الْقَيُّومَ وَأَتُوبُ إِلَيْهِ',
      latin_text: 'Astaghfirullahal ‘adziim alladzii laa ilaaha illaa huwal hayyul qayyuumu wa atuubu ilaih',
      translation_text: 'Aku memohon ampun kepada Allah Yang Maha Agung, tiada Tuhan selain Dia yang Maha Hidup lagi terus-menerus mengurus makhluk-Nya, dan aku bertaubat kepada-Nya.',
      description: 'Membersihkan batin dan memohon ampunan Allah SWT bersama ribuan jamaah. Istighfar adalah kunci diturunkannya hujan rahmat, keturunan yang saleh, dan kelapangan rezeki yang tak disangka-sangka.'
    };
  }

  if (p.includes('tibbil') || p.includes('thibbil') || p.includes('hati') || p.includes('sembuh')) {
    return {
      title: `Shalawat Tibbil Qulub ${parsedTarget.toLocaleString('id-ID')}x Penawar Jiwa & Kesembuhan Raga`,
      target_count: parsedTarget || 1000,
      category: 'syifa',
      arabic_text: 'اللَّهُمَّ صَلِّ عَلَى سَيِّدِنَا مُحَمَّدٍ طِبِّ الْقُلُوبِ وَدَوَائِهَا، وَعَافِيَةِ الأَبْدَانِ وَشِفَائِهَا، وَنُورِ الأَبْصَارِ وَضِيَائِهَا، وَعَلَى آلِهِ وَصَحْبِهِ وَسَلِّمْ',
      latin_text: 'Allahumma shalli ‘ala sayyidina Muhammadin thibbil quluubi wa dawa-ihaa, wa ‘aafiyatil abdaani wa syifaa-ihaa, wa nuuril abshaari wa dhiyaa-ihaa, wa ‘ala aalihi wa shahbihi wa sallim',
      translation_text: 'Ya Allah, curahkanlah rahmat kepada junjungan kami Nabi Muhammad sebagai obat hati dan penawarnya, penyehat badan dan kesembuhannya, serta cahaya penglihatan dan sinarnya.',
      description: 'Majelis zikir syifa mengetuk pintu kesembuhan jasmani dan ketenangan rohani. Dipersembahkan bagi jamaah dan keluarga yang merindukan penawar dari segala penyakit.'
    };
  }

  if (p.includes('hawqalah') || p.includes('lahawla') || p.includes('laa hawla') || p.includes('kekuatan')) {
    return {
      title: `Hauqalah ${parsedTarget.toLocaleString('id-ID')}x Perbendaharaan Surga Peneguh Jiwa`,
      target_count: parsedTarget || 10000,
      category: 'syifa',
      arabic_text: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ الْعَلِيِّ الْعَظِيمِ',
      latin_text: 'Laa hawla wa laa quwwata illaa billaahil ‘aliyyil ‘adziim',
      translation_text: 'Tiada daya dan tiada kekuatan melainkan semata-mata dengan pertolongan Allah Yang Maha Tinggi lagi Maha Agung.',
      description: 'Melepaskan rasa putus asa dan kepasrahan semu kepada kekuatan manusia. Satukan ribuan ketukan tasbih mengaku kelemahan diri di hadapan Sang Pemilik Kehendak.'
    };
  }

  return {
    title: `Majelis Zikir Umat ${parsedTarget.toLocaleString('id-ID')}x: ${prompt.slice(0, 45)}`,
    target_count: parsedTarget || 10000,
    category: p.includes('bala') ? 'tolak-bala' : p.includes('hajat') ? 'syifa' : 'ramadan',
    arabic_text: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ سُبْحَانَ اللَّهِ الْعَظِيمِ',
    latin_text: 'Subhaanallaahi wa bihamdihii subhaanallaahil ‘adziim',
    translation_text: 'Maha Suci Allah dengan memuji-Nya, Maha Suci Allah Yang Maha Agung.',
    description: `Ikhtiar bersama jamaah se-Nusantara: "${prompt}". Mari himpun butir-butir tasbih penuh kekhusyukan hingga target tuntas diraih bersama.`
  };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const prompt = body.prompt;

    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json(
        { error: 'Prompt kampanye tidak boleh kosong.' },
        { status: 400 }
      );
    }

    const apiKey =
      body.apiKey ||
      process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_API_KEY ||
      '';

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemInstruction = 'Anda adalah asisten majelis zikir Islam SatuZikir. Tugas Anda adalah mengubah prompt admin menjadi detail kampanye zikir lengkap dan sahih dalam format JSON murni tanpa markdown wrapping. Format: {"title": string, "target_count": number, "category": "syifa"|"ramadan"|"tolak-bala", "arabic_text": string, "latin_text": string, "translation_text": string, "description": string}';

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `${systemInstruction}\n\nPrompt Admin: "${prompt}"\n\nJSON Output:`
        });

        const rawText = response.text || '';
        const cleanJson = rawText
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim();

        const parsed = JSON.parse(cleanJson) as GeneratedCampaign;

        if (parsed.title && parsed.target_count && parsed.arabic_text) {
          return NextResponse.json({
            success: true,
            source: 'gemini-ai',
            campaign: {
              ...parsed,
              target_count: Number(parsed.target_count) || 10000,
              category: ['syifa', 'ramadan', 'tolak-bala'].includes(parsed.category)
                ? parsed.category
                : 'syifa'
            }
          });
        }
      } catch (geminiError) {
        console.warn('Gemini API call failed, using verified Islamic knowledge fallback:', geminiError);
      }
    }

    const fallback = generateFallbackCampaign(prompt);
    return NextResponse.json({
      success: true,
      source: 'knowledge-engine',
      campaign: fallback,
      note: 'Dihasilkan dari database zikir & fiqih SatuZikir.'
    });
  } catch (error) {
    console.error('Error generating campaign:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat memproses prompt AI.' },
      { status: 500 }
    );
  }
}

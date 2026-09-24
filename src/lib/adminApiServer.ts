import 'server-only';
import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { requireAdmin } from './serverAuth';
import { getSupabaseAdmin } from './supabaseAdmin';

const CATEGORIES = ['syifa', 'ramadan', 'tolak-bala', 'harian'];
const STATUSES = ['active', 'completed', 'draft'];

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

/**
 * Bungkus handler route admin: cek sesi, siapkan client service role,
 * dan ubah error menjadi JSON { error }.
 */
export async function withAdmin(
  req: Request,
  handler: (db: SupabaseClient) => Promise<unknown>
): Promise<NextResponse> {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  try {
    const db = getSupabaseAdmin();
    if (!db) throw new HttpError(400, 'Supabase belum dikonfigurasi.');
    return NextResponse.json((await handler(db)) ?? { ok: true });
  } catch (err) {
    if (err instanceof HttpError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    console.error('Admin API error:', err);
    return NextResponse.json({ error: (err as Error).message || 'Kesalahan server.' }, { status: 500 });
  }
}

/** Lempar HttpError yang ramah dari error PostgREST. */
export function throwDbError(error: { code?: string; message: string }): never {
  if (error.code === '23505') throw new HttpError(409, 'Slug campaign sudah dipakai. Ubah judulnya sedikit.');
  throw new HttpError(500, error.message);
}

function text(value: unknown, field: string, max: number, required: boolean): string | undefined {
  if (value === undefined || value === null) {
    if (required) throw new HttpError(400, `${field} wajib diisi.`);
    return undefined;
  }
  if (typeof value !== 'string') throw new HttpError(400, `${field} tidak valid.`);
  const trimmed = value.trim();
  if (required && !trimmed) throw new HttpError(400, `${field} wajib diisi.`);
  if (trimmed.length > max) throw new HttpError(400, `${field} maksimal ${max} karakter.`);
  return trimmed;
}

function int(value: unknown, field: string, min: number, max: number): number | undefined {
  if (value === undefined || value === null) return undefined;
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) throw new HttpError(400, `${field} tidak valid.`);
  return n;
}

function oneOf(value: unknown, field: string, allowed: string[]): string | undefined {
  if (value === undefined || value === null) return undefined;
  if (typeof value !== 'string' || !allowed.includes(value)) throw new HttpError(400, `${field} tidak valid.`);
  return value;
}

/**
 * Validasi & whitelist field campaign dari body request.
 * partial=true untuk update (field yang tidak dikirim diabaikan).
 */
export function parseCampaignFields(body: Record<string, unknown>, partial: boolean) {
  const required = !partial;
  const slug = text(body.slug, 'Slug', 255, required);
  if (slug !== undefined && !/^[a-z0-9-]+$/.test(slug)) throw new HttpError(400, 'Slug hanya boleh huruf kecil, angka, dan tanda -.');

  const fields = {
    title: text(body.title, 'Judul', 255, required),
    slug,
    category: oneOf(body.category, 'Kategori', CATEGORIES),
    description: text(body.description, 'Deskripsi', 5000, false),
    arabic_text: text(body.arabic_text, 'Teks Arab', 20000, required),
    latin_text: text(body.latin_text, 'Transliterasi', 20000, false),
    translation_text: text(body.translation_text, 'Terjemahan', 20000, false),
    target_count: int(body.target_count, 'Target', 1, 1_000_000_000),
    current_count: int(body.current_count, 'Hitungan', 0, 1_000_000_000_000),
    status: oneOf(body.status, 'Status', STATUSES),
    image_url: text(body.image_url, 'URL gambar', 2000, false),
  };
  if (required && fields.target_count === undefined) throw new HttpError(400, 'Target wajib diisi.');

  // Buang field undefined agar update parsial tidak menimpa kolom lain
  return Object.fromEntries(Object.entries(fields).filter(([, v]) => v !== undefined));
}

export const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

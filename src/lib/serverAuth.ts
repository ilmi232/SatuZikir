import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from './supabaseAdmin';

export const ADMIN_COOKIE = 'sz_admin';
export const ADMIN_SESSION_SECONDS = 12 * 60 * 60;

// Aturan jeda login: 5 salah per IP -> jeda 15 menit;
// 20 salah dari semua IP dalam 1 jam -> login dikunci total 1 jam.
const IP_MAX_FAILURES = 5;
const IP_WINDOW_MS = 15 * 60 * 1000;
const GLOBAL_MAX_FAILURES = 20;
const GLOBAL_WINDOW_MS = 60 * 60 * 1000;

function sessionSecret(): string {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error('ADMIN_SESSION_SECRET belum diset (minimal 32 karakter).');
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac('sha256', sessionSecret()).update(payload).digest('base64url');
}

function safeEqual(a: string, b: string): boolean {
  // Bandingkan HMAC kedua nilai agar panjangnya sama dan waktunya konstan
  const key = sessionSecret();
  const ha = createHmac('sha256', key).update(a).digest();
  const hb = createHmac('sha256', key).update(b).digest();
  return timingSafeEqual(ha, hb);
}

/** Token sesi: "<kedaluwarsa-ms>.<hmac>". */
export function createSessionToken(): string {
  const exp = String(Date.now() + ADMIN_SESSION_SECONDS * 1000);
  return `${exp}.${sign(exp)}`;
}

function isValidSessionToken(token: string | undefined): boolean {
  if (!token) return false;
  const [exp, sig] = token.split('.');
  if (!exp || !sig || !/^\d+$/.test(exp)) return false;
  if (Number(exp) < Date.now()) return false;
  return safeEqual(sig, sign(exp));
}

function readCookie(req: Request, name: string): string | undefined {
  const header = req.headers.get('cookie') ?? '';
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=');
    if (k === name) return decodeURIComponent(v.join('='));
  }
  return undefined;
}

export function isAdminRequest(req: Request): boolean {
  try {
    return isValidSessionToken(readCookie(req, ADMIN_COOKIE));
  } catch {
    return false;
  }
}

/** Response 401 jika bukan admin, null jika lolos. */
export async function requireAdmin(req: Request): Promise<NextResponse | null> {
  if (isAdminRequest(req)) return null;
  return NextResponse.json({ error: 'Sesi admin berakhir. Silakan login ulang.' }, { status: 401 });
}

export function clientIp(req: Request): string {
  return (
    req.headers.get('x-real-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    'unknown'
  );
}

export function isPinCorrect(pin: string): boolean {
  const expected = process.env.ADMIN_PIN?.trim();
  if (!expected || !/^\d{6}$/.test(expected)) {
    throw new Error('ADMIN_PIN belum diset (harus 6 digit angka).');
  }
  return /^\d{6}$/.test(pin) && safeEqual(pin, expected);
}

// ---- Penyimpanan percobaan gagal ----
// Supabase (production) atau memori proses (mode demo lokal tanpa Supabase).

const memoryFailures: { ip: string; at: number }[] = [];

async function listRecentFailures(since: number): Promise<{ ip: string; at: number }[]> {
  const db = getSupabaseAdmin();
  if (!db) return memoryFailures.filter((f) => f.at >= since);

  const { data, error } = await db
    .from('admin_login_failures')
    .select('ip, created_at')
    .gte('created_at', new Date(since).toISOString())
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({ ip: r.ip as string, at: new Date(r.created_at as string).getTime() }));
}

export async function recordLoginFailure(ip: string): Promise<void> {
  const db = getSupabaseAdmin();
  if (!db) {
    memoryFailures.push({ ip, at: Date.now() });
    return;
  }
  const { error } = await db.from('admin_login_failures').insert({ ip });
  if (error) throw new Error(error.message);
  // Bersihkan catatan lama agar tabel tetap kecil
  await db
    .from('admin_login_failures')
    .delete()
    .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
}

export async function clearLoginFailures(ip: string): Promise<void> {
  const db = getSupabaseAdmin();
  if (!db) {
    for (let i = memoryFailures.length - 1; i >= 0; i--) {
      if (memoryFailures[i].ip === ip) memoryFailures.splice(i, 1);
    }
    return;
  }
  await db.from('admin_login_failures').delete().eq('ip', ip);
}

/** Waktu (ms epoch) sampai login dibuka lagi, atau null jika tidak terkunci. */
export async function getLockedUntil(ip: string): Promise<number | null> {
  const now = Date.now();
  const recent = await listRecentFailures(now - GLOBAL_WINDOW_MS);

  // recent terurut terbaru dulu; kunci berlaku sejak kegagalan terakhir
  if (recent.length >= GLOBAL_MAX_FAILURES) {
    return recent[0].at + GLOBAL_WINDOW_MS;
  }

  const ipRecent = recent.filter((f) => f.ip === ip && f.at >= now - IP_WINDOW_MS);
  if (ipRecent.length >= IP_MAX_FAILURES) {
    return ipRecent[0].at + IP_WINDOW_MS;
  }

  return null;
}

export const LOGIN_LIMITS = { IP_MAX_FAILURES };

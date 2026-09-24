import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from './supabaseConfig';

/**
 * Pastikan request berasal dari admin yang login via Supabase Auth.
 * Mengembalikan response error jika ditolak, atau null jika lolos.
 *
 * Tanpa Supabase (mode demo lokal) endpoint hanya dibuka saat development,
 * supaya deployment production tanpa Supabase tidak membuka kuota AI ke publik.
 */
export async function requireAdmin(req: Request): Promise<NextResponse | null> {
  if (!isSupabaseConfigured) {
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: 'Supabase belum dikonfigurasi. Fitur admin dinonaktifkan di production.' },
        { status: 503 }
      );
    }
    return null;
  }

  const token = req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return NextResponse.json({ error: 'Silakan login sebagai admin.' }, { status: 401 });
  }

  const client = createClient(
    supabaseUrl,
    supabaseAnonKey,
    {
      auth: { persistSession: false, autoRefreshToken: false },
      global: { headers: { Authorization: `Bearer ${token}` } },
    }
  );

  const { data: userData, error: userError } = await client.auth.getUser(token);
  if (userError || !userData.user) {
    return NextResponse.json({ error: 'Sesi admin tidak valid. Silakan login ulang.' }, { status: 401 });
  }

  const { data: isAdmin, error: adminError } = await client.rpc('is_admin');
  if (adminError || isAdmin !== true) {
    return NextResponse.json({ error: 'Akun ini bukan admin SatuZikir.' }, { status: 403 });
  }

  return null;
}

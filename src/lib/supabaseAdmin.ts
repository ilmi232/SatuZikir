import 'server-only';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabaseUrl } from './supabaseConfig';

let client: SupabaseClient | null = null;

/**
 * Client Supabase dengan service role (melewati RLS). HANYA untuk route server
 * yang sudah memverifikasi sesi admin. Null jika Supabase belum dikonfigurasi.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!serviceKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY belum diset di environment server.');
  }
  client ??= createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

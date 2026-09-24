import { adminFetch } from './adminAuth';

/** Ambil isi supabase_schema.sql (satu sumber kebenaran skema) dari server. */
export async function loadSupabaseSchemaSql(): Promise<string> {
  const res = await adminFetch('/api/admin/schema');
  if (!res.ok) throw new Error(`Gagal memuat skema SQL (HTTP ${res.status})`);
  return res.text();
}

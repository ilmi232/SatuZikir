import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { requireAdmin } from '@/lib/serverAuth';

// Satu sumber kebenaran skema: supabase_schema.sql di root repo,
// disajikan ke panduan "Setup SQL" di /admin.
export async function GET(req: Request) {
  const denied = await requireAdmin(req);
  if (denied) return denied;

  const sql = await readFile(path.join(process.cwd(), 'supabase_schema.sql'), 'utf8');
  return new Response(sql, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

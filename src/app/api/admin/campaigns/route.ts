import { HttpError, parseCampaignFields, throwDbError, withAdmin } from '@/lib/adminApiServer';

// Semua campaign termasuk draft (untuk halaman admin)
export async function GET(req: Request) {
  return withAdmin(req, async (db) => {
    const { data, error } = await db.from('campaigns').select('*').order('created_at', { ascending: false });
    if (error) throwDbError(error);
    return { campaigns: data };
  });
}

// Buat campaign baru
export async function POST(req: Request) {
  return withAdmin(req, async (db) => {
    const body = await req.json().catch(() => {
      throw new HttpError(400, 'Body JSON tidak valid.');
    });
    const fields = parseCampaignFields(body, false);
    const { data, error } = await db
      .from('campaigns')
      .insert({ current_count: 0, status: 'active', category: 'syifa', ...fields })
      .select()
      .single();
    if (error) throwDbError(error);
    return { campaign: data };
  });
}

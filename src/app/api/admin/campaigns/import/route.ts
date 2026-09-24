import { HttpError, parseCampaignFields, withAdmin } from '@/lib/adminApiServer';

// Upload campaign dari mode demo (localStorage) ke Supabase, upsert berdasarkan slug
export async function POST(req: Request) {
  return withAdmin(req, async (db) => {
    const body = await req.json().catch(() => {
      throw new HttpError(400, 'Body JSON tidak valid.');
    });
    const list = Array.isArray(body.campaigns) ? body.campaigns.slice(0, 200) : [];

    let migrated = 0;
    const errors: string[] = [];
    for (const item of list) {
      try {
        const fields = parseCampaignFields(item, false);
        const { error } = await db.from('campaigns').upsert(fields, { onConflict: 'slug' });
        if (error) errors.push(`${fields.slug}: ${error.message}`);
        else migrated++;
      } catch (err) {
        errors.push((err as Error).message);
      }
    }
    return { migrated, errors };
  });
}

import { HttpError, UUID_RE, parseCampaignFields, throwDbError, withAdmin } from '@/lib/adminApiServer';

type Ctx = { params: Promise<{ id: string }> };

async function campaignId(ctx: Ctx): Promise<string> {
  const { id } = await ctx.params;
  if (!UUID_RE.test(id)) throw new HttpError(400, 'ID campaign tidak valid.');
  return id;
}

// Update sebagian field (termasuk koreksi current_count)
export async function PATCH(req: Request, ctx: Ctx) {
  return withAdmin(req, async (db) => {
    const id = await campaignId(ctx);
    const body = await req.json().catch(() => {
      throw new HttpError(400, 'Body JSON tidak valid.');
    });
    const fields = parseCampaignFields(body, true);
    if (Object.keys(fields).length === 0) throw new HttpError(400, 'Tidak ada perubahan.');

    const { data, error } = await db
      .from('campaigns')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .maybeSingle();
    if (error) throwDbError(error);
    if (!data) throw new HttpError(404, 'Campaign tidak ditemukan.');
    return { campaign: data };
  });
}

export async function DELETE(req: Request, ctx: Ctx) {
  return withAdmin(req, async (db) => {
    const id = await campaignId(ctx);
    const { error, count } = await db.from('campaigns').delete({ count: 'exact' }).eq('id', id);
    if (error) throwDbError(error);
    if (count === 0) throw new HttpError(404, 'Campaign tidak ditemukan.');
    return { ok: true };
  });
}

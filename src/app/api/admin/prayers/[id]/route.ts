import { HttpError, UUID_RE, throwDbError, withAdmin } from '@/lib/adminApiServer';

// Moderasi: hapus doa yang tidak pantas
export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  return withAdmin(req, async (db) => {
    const { id } = await ctx.params;
    if (!UUID_RE.test(id)) throw new HttpError(400, 'ID doa tidak valid.');
    const { error, count } = await db.from('prayers').delete({ count: 'exact' }).eq('id', id);
    if (error) throwDbError(error);
    if (count === 0) throw new HttpError(404, 'Doa tidak ditemukan.');
    return { ok: true };
  });
}

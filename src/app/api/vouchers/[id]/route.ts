import { apiFetchAuthed, Res } from "@/app/api/orchestra";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const { ok, status, data, error } = await apiFetchAuthed(`/vouchers/${id}`);
  if (!ok) return Res.upstream(error!, status);
  return Res.ok(data);
}

export async function PUT(req: Request, { params }: Params) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return Res.badRequest();
  const { ok, status, data, error } = await apiFetchAuthed(`/vouchers/${id}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
  if (!ok) return Res.upstream(error!, status);
  return Res.ok(data);
}

export async function DELETE(_req: Request, { params }: Params) {
  const { id } = await params;
  const { ok, status, error } = await apiFetchAuthed(`/vouchers/${id}`, {
    method: "DELETE",
  });
  if (!ok) return Res.upstream(error!, status);
  return Res.ok({ ok: true });
}

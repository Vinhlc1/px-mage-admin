import { apiFetchAuthed, Res } from "@/app/api/orchestra";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const { ok, status, data, error } = await apiFetchAuthed(`/orders/${id}`);
  if (!ok) return Res.upstream(error!, status);
  return Res.ok(data);
}

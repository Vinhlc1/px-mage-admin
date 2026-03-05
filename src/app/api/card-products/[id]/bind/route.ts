import { apiFetchAuthed, Res } from "@/app/api/orchestra";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body) return Res.badRequest();
  const { ok, status, data, error } = await apiFetchAuthed(`/card-products/${id}/bind`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  if (!ok) return Res.upstream(error!, status);
  return Res.ok(data);
}

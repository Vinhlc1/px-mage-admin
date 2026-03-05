import { apiFetchAuthed, Res } from "@/app/api/orchestra";

export async function GET() {
  const { ok, status, data, error } = await apiFetchAuthed("/card-products");
  if (!ok) return Res.upstream(error!, status);
  return Res.ok(data);
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return Res.badRequest();
  const { ok, status, data, error } = await apiFetchAuthed("/card-products", {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!ok) return Res.upstream(error!, status);
  return Res.ok(data, 201);
}

import { apiFetchAuthed, Res } from "@/app/api/orchestra";

export async function GET() {
  const { ok, status, data, error } = await apiFetchAuthed("/orders");
  if (!ok) return Res.upstream(error!, status);
  return Res.ok(data);
}

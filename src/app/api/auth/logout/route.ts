import { cookies } from "next/headers";
import { TOKEN_COOKIE, USER_COOKIE } from "@/lib/auth-utils";
import { Res } from "@/app/api/orchestra";

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
  cookieStore.delete(USER_COOKIE);
  return Res.ok({ ok: true });
}

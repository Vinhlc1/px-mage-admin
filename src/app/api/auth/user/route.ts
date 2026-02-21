import { cookies } from "next/headers";
import {
  isTokenExpired,
  parseUserCookieValue,
  TOKEN_COOKIE,
  USER_COOKIE,
} from "@/lib/auth-utils";
import { Res } from "@/app/api/orchestra";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;
  const user = parseUserCookieValue(cookieStore.get(USER_COOKIE)?.value);

  if (!token || isTokenExpired(token) || !user) return Res.unauthorized();

  return Res.ok({ user });
}

import { cookies } from "next/headers";
import {
  isTokenExpired,
  parseUserCookieValue,
  TOKEN_COOKIE,
  USER_COOKIE,
} from "./auth-utils";

export async function getServerAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;
  const user = parseUserCookieValue(cookieStore.get(USER_COOKIE)?.value);
  const isAuthenticated = Boolean(token) && !isTokenExpired(token);

  return { token: token ?? null, user, isAuthenticated };
}

import { decodeJwt } from "jose";
import { z } from "zod";

export const TOKEN_COOKIE = "token";
export const USER_COOKIE = "user";
export const TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24;

const authUserSchema = z.object({
  accountId: z.number(),
  email: z.string().email(),
  name: z.string(),
  roleId: z.number(),
});

export type AuthUser = z.infer<typeof authUserSchema>;

export function parseUserCookieValue(value?: string): AuthUser | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(decodeURIComponent(value));
    const result = authUserSchema.safeParse(parsed);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
}

export function serializeUserCookieValue(user: AuthUser): string {
  return encodeURIComponent(JSON.stringify(user));
}

export function decodeTokenExp(token?: string): number | null {
  if (!token) {
    return null;
  }

  try {
    const payload = decodeJwt(token);
    return typeof payload.exp === "number" ? payload.exp : null;
  } catch {
    return null;
  }
}

export function getTokenMaxAgeSeconds(token?: string): number {
  const exp = decodeTokenExp(token);
  if (!exp) {
    return TOKEN_MAX_AGE_SECONDS;
  }

  const now = Math.floor(Date.now() / 1000);
  return Math.max(exp - now, 0);
}

export function isTokenExpired(token?: string): boolean {
  if (!token) {
    return true;
  }

  const exp = decodeTokenExp(token);
  if (!exp) {
    return false;
  }

  const now = Math.floor(Date.now() / 1000);
  return exp <= now;
}

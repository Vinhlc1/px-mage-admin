import { cookies } from "next/headers";
import { z } from "zod";
import {
  getTokenMaxAgeSeconds,
  serializeUserCookieValue,
  TOKEN_COOKIE,
  USER_COOKIE,
} from "@/lib/auth-utils";
import { apiFetch, cookieOptions, Res } from "@/app/api/orchestra";

const loginRequestSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const loginResponseSchema = z.object({
  token: z.string(),
  account: z.object({
    customerId: z.number(),
    email: z.string().email(),
    name: z.string(),
    role: z.object({ roleId: z.number() }).optional(),
  }),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = loginRequestSchema.safeParse(body);
  if (!parsed.success) return Res.badRequest("Invalid credentials.");

  const { ok, status, data, error } = await apiFetch("/accounts/login", {
    method: "POST",
    body: JSON.stringify(parsed.data),
  });

  if (!ok) return Res.upstream(error ?? "Login failed.", status);

  const parsedData = loginResponseSchema.safeParse(data);
  if (!parsedData.success) return Res.upstream("Unexpected login response.", 502);

  const { token, account } = parsedData.data;
  const maxAge = getTokenMaxAgeSeconds(token);
  const opts = cookieOptions(maxAge);
  const cookieStore = await cookies();

  cookieStore.set(TOKEN_COOKIE, token, opts);
  cookieStore.set(
    USER_COOKIE,
    serializeUserCookieValue({
      accountId: account.customerId,
      email: account.email,
      name: account.name,
      roleId: account.role?.roleId ?? 0,
    }),
    opts
  );

  return Res.ok({ ok: true });
}

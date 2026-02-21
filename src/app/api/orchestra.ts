/**
 * api/orchestra.ts
 *
 * Central API layer — all shared config, the base fetch wrapper, and
 * response helpers live here. Every route file imports from this module
 * instead of duplicating boilerplate.
 *
 * Usage in route files:
 *   import { apiFetch, apiFetchAuthed, cookieOptions, Res } from "@/app/api/orchestra";
 */

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { TOKEN_COOKIE } from "@/lib/auth-utils";

// ── Config ────────────────────────────────────────────────────────────────────

export const API_BASE_URL =
  process.env.API_BASE_URL ?? "http://localhost:8386/api";

/** Base cookie attributes applied to every auth cookie. */
export const COOKIE_BASE = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
};

/** Returns a full cookie options object with a given maxAge. */
export function cookieOptions(maxAge: number) {
  return { ...COOKIE_BASE, maxAge };
}

// ── Fetch wrapper ─────────────────────────────────────────────────────────────

export type ApiFetchResult<T> = {
  ok: boolean;
  status: number;
  data: T | null;
  error: string | null;
};

/**
 * Thin wrapper around fetch targeting the backend API.
 * - Prepends API_BASE_URL automatically.
 * - Defaults to cache: "no-store" and Content-Type: application/json.
 * - Normalises varied payload shapes (data / result / root).
 * - Never throws — network failures are returned as { ok: false }.
 */
export async function apiFetch<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<ApiFetchResult<T>> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
      },
    });

    const payload = await res.json().catch(() => null);
    const raw: T = payload?.data ?? payload?.result ?? payload;

    if (!res.ok) {
      const error = payload?.message ?? payload?.error ?? "Request failed.";
      return { ok: false, status: res.status, data: null, error };
    }

    return { ok: true, status: res.status, data: raw, error: null };
  } catch {
    return { ok: false, status: 500, data: null, error: "Network error." };
  }
}

/**
 * Like apiFetch but reads the JWT from the server-side httpOnly cookie
 * and forwards it as a Bearer token to the backend.
 * Use this in all authenticated admin API proxy routes.
 */
export async function apiFetchAuthed<T = unknown>(
  path: string,
  options?: RequestInit
): Promise<ApiFetchResult<T>> {
  const cookieStore = await cookies();
  const token = cookieStore.get(TOKEN_COOKIE)?.value;

  if (!token) {
    return { ok: false, status: 401, data: null, error: "Unauthorized." };
  }

  return apiFetch<T>(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options?.headers ?? {}),
    },
  });
}

// ── Response helpers ──────────────────────────────────────────────────────────

/**
 * Standardised NextResponse factories.
 *
 * Res.ok({ user })           → 200
 * Res.badRequest()           → 400
 * Res.unauthorized()         → 401
 * Res.upstream(msg, status)  → upstream error (4xx / 5xx from backend)
 * Res.serverError()          → 500
 */
export const Res = {
  ok: <T>(data: T, status = 200) =>
    NextResponse.json(data, { status }),

  badRequest: (message = "Invalid request.") =>
    NextResponse.json({ error: message }, { status: 400 }),

  unauthorized: (message = "Unauthorized.") =>
    NextResponse.json({ error: message }, { status: 401 }),

  upstream: (message: string, status: number) =>
    NextResponse.json({ error: message }, { status }),

  serverError: (message = "Internal server error.") =>
    NextResponse.json({ error: message }, { status: 500 }),
};

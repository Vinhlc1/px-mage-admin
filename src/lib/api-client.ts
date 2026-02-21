/**
 * lib/api-client.ts
 * Client-side fetch helpers that call our Next.js API proxy routes.
 * Authentication is handled server-side via httpOnly cookies.
 */

type Result<T> = { data: T; error: null } | { data: null; error: string };

async function request<T>(path: string, options?: RequestInit): Promise<Result<T>> {
  try {
    const res = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers ?? {}),
      },
    });
    const json = await res.json().catch(() => null);
    if (!res.ok) return { data: null, error: json?.error ?? "Request failed." };
    return { data: json as T, error: null };
  } catch {
    return { data: null, error: "Network error." };
  }
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  del: (path: string) => request<unknown>(path, { method: "DELETE" }),
};

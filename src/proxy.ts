import { NextResponse, type NextRequest } from "next/server";
import { isTokenExpired, TOKEN_COOKIE, USER_COOKIE } from "@/lib/auth-utils";

const PUBLIC_PATH_PREFIXES = ["/api/auth", "/_next", "/favicon.ico", "/robots.txt", "/sitemap.xml"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATH_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(TOKEN_COOKIE)?.value;
  const tokenValid = Boolean(token) && !isTokenExpired(token);

  if (pathname === "/login") {
    if (tokenValid) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (!tokenValid) {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(TOKEN_COOKIE);
    response.cookies.delete(USER_COOKIE);
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};

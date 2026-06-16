import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth-session";
import { canAccessPath, FALLBACK_PATH } from "@/lib/access";
import type { Permissions } from "@/lib/types";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await verifySessionToken(token) : null;

  if (pathname === "/login") {
    if (user) {
      return NextResponse.redirect(new URL("/admin", req.url));
    }
    return NextResponse.next();
  }

  if (!user) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
    }
    const url = new URL("/login", req.url);
    url.searchParams.set("from", pathname);
    return NextResponse.redirect(url);
  }

  // Autorizacao por permissao (perms vem dos custom claims; owner raiz = undefined = tudo).
  const perms = user.perms as Permissions | undefined;
  if (!canAccessPath(perms, pathname)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Sem permissão." }, { status: 403 });
    }
    return NextResponse.redirect(new URL(FALLBACK_PATH, req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/login"],
};

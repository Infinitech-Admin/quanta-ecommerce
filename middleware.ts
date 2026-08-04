import { NextRequest, NextResponse } from "next/server";

const isDev = process.env.NODE_ENV !== "production";

function log(...args: unknown[]) {
  if (isDev) console.log("[middleware]", ...args);
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const pathname = request.nextUrl.pathname;

  log("path:", pathname, "| token present:", !!token);

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", pathname);
  const homeUrl = new URL("/", request.url);

  if (!token) {
    log("no token -> /login");
    return NextResponse.redirect(loginUrl);
  }

  if (!apiUrl) {
    log("no apiUrl configured -> /login");
    return NextResponse.redirect(loginUrl);
  }

  try {
    const res = await fetch(`${apiUrl}/me`, {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    log("/me status:", res.status, "| role:", data?.user?.role);

    if (!res.ok) {
      log("/me not ok -> /login");
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete("auth_token"); // stale/invalid token, clear it here too
      return response;
    }

    const role = data?.user?.role;

    if (role !== "admin") {
      log("role check failed -> /");
      return NextResponse.redirect(homeUrl);
    }
  } catch (err) {
    log("fetch threw:", err);
    return NextResponse.redirect(loginUrl);
  }

  log("passed -> continuing to admin");
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

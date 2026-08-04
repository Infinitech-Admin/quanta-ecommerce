import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  console.log("[middleware] path:", request.nextUrl.pathname);
  console.log("[middleware] token present:", !!token);

  const loginUrl = new URL("/login", request.url);
  const homeUrl = new URL("/", request.url);

  if (!token) {
    console.log("[middleware] no token -> /login");
    return NextResponse.redirect(loginUrl);
  }

  if (!apiUrl) {
    console.log("[middleware] no apiUrl -> /login");
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
    console.log("[middleware] /me status:", res.status);
    console.log("[middleware] /me role:", JSON.stringify(data?.user?.role));

    if (!res.ok) {
      console.log("[middleware] /me not ok -> /login");
      return NextResponse.redirect(loginUrl);
    }

    const role = data?.user?.role;

    if (role !== "admin") {
      console.log("[middleware] role check failed -> /");
      return NextResponse.redirect(homeUrl);
    }
  } catch (err) {
    console.log("[middleware] fetch threw:", err);
    return NextResponse.redirect(loginUrl);
  }

  console.log("[middleware] passed -> continuing to admin");
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

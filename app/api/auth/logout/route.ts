import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const token = request.cookies.get("auth_token")?.value;

  if (apiUrl && token) {
    try {
      await fetch(`${apiUrl}/logout`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });
    } catch {
      // Even if the Laravel call fails (e.g. token already expired),
      // still clear the local cookie below so the user is logged out client-side.
    }
  }

  const response = NextResponse.json({ message: "Logged out successfully." });
  response.cookies.delete("auth_token");

  return response;
}

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const qs = searchParams.toString();

  try {
    const res = await fetch(`${API_URL}/products${qs ? `?${qs}` : ""}`, {
      headers: { Accept: "application/json" },
      cache: "no-store",
    });

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      console.error("Laravel did not return JSON:", text.slice(0, 500));
      return NextResponse.json(
        {
          error: "Upstream returned invalid response",
          raw: text.slice(0, 500),
        },
        { status: 502 },
      );
    }

    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("Fetch to Laravel failed:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

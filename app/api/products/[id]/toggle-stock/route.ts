import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// POST /api/products/:id/toggle-stock
export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const token = request.cookies.get("auth_token")?.value;
  if (!token) {
    return NextResponse.json(
      { message: "Not authenticated." },
      { status: 401 },
    );
  }

  const res = await fetch(`${API_URL}/products/${params.id}/toggle-stock`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    console.error("Laravel did not return JSON:", text.slice(0, 500));
    return NextResponse.json(
      { error: "Upstream returned invalid response", raw: text.slice(0, 500) },
      { status: 502 },
    );
  }

  return NextResponse.json(data, { status: res.status });
}

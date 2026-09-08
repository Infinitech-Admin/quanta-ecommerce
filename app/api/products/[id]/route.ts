// 📁 app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function getToken(request: NextRequest) {
  return request.cookies.get("auth_token")?.value;
}

async function parseUpstream(res: Response) {
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    console.error("Laravel did not return JSON:", text.slice(0, 500));
    return {
      error: "Upstream returned invalid response",
      raw: text.slice(0, 500),
    };
  }
}

// GET /api/products/:id — public, no token needed
export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const res = await fetch(`${API_URL}/products/${params.id}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const data = await parseUpstream(res);
  return NextResponse.json(data, { status: res.status });
}

// POST /api/products/:id (FormData; must include `_method=PUT` so Laravel
// treats it as an update — required since native PUT can't carry files)
export async function POST(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const token = getToken(request);
  if (!token) {
    return NextResponse.json(
      { message: "Not authenticated." },
      { status: 401 },
    );
  }

  const formData = await request.formData();
  if (!formData.has("_method")) {
    formData.append("_method", "PUT");
  }

  const res = await fetch(`${API_URL}/products/${params.id}`, {
    method: "POST",
    body: formData,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await parseUpstream(res);
  return NextResponse.json(data, { status: res.status });
}

// DELETE /api/products/:id
export async function DELETE(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const token = getToken(request);
  if (!token) {
    return NextResponse.json(
      { message: "Not authenticated." },
      { status: 401 },
    );
  }

  const res = await fetch(`${API_URL}/products/${params.id}`, {
    method: "DELETE",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 204) return new NextResponse(null, { status: 204 });
  const data = await parseUpstream(res);
  return NextResponse.json(data, { status: res.status });
}

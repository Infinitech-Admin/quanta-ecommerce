// 📁 PUT THIS FILE AT: app/api/products/[id]/route.ts
// (the folder name is literally "[id]", square brackets included —
// that's how Next.js marks a dynamic route segment)

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GET /api/products/:id
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const res = await fetch(`${API_URL}/products/${params.id}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// POST /api/products/:id (FormData; must include `_method=PUT` so Laravel
// treats it as an update — required since native PUT can't carry files)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const formData = await request.formData();
  if (!formData.has("_method")) {
    formData.append("_method", "PUT");
  }

  const res = await fetch(`${API_URL}/products/${params.id}`, {
    method: "POST",
    body: formData,
    headers: { Accept: "application/json" },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

// DELETE /api/products/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const res = await fetch(`${API_URL}/products/${params.id}`, {
    method: "DELETE",
    headers: { Accept: "application/json" },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

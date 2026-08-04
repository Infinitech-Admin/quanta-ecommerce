// 📁 PUT THIS FILE AT: app/api/categories/[id]/route.ts

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL; // e.g. http://localhost:8000/api

// GET /api/categories/[id] -> proxies Laravel, plain passthrough.
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const res = await fetch(`${API_URL}/categories/${params.id}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: res.status },
    );
  }

  const category = await res.json();

  return NextResponse.json(category);
}

// POST /api/categories/[id] -> forwards a multipart upload to Laravel to
// UPDATE an existing category. Laravel's update route uses POST rather
// than PUT/PATCH because PHP won't parse multipart bodies on those verbs
// — the image field is optional, so omitting it just updates the text
// fields and keeps the existing file.
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const formData = await req.formData();

  const res = await fetch(`${API_URL}/categories/${params.id}`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}

// DELETE /api/categories/[id] -> forwards deletion to Laravel.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const res = await fetch(`${API_URL}/categories/${params.id}`, {
    method: "DELETE",
  });

  if (res.status === 204) {
    return new NextResponse(null, { status: 204 });
  }

  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}

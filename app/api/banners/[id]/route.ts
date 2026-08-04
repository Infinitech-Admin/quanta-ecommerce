// 📁 PUT THIS FILE AT: app/api/banners/[id]/route.ts (new file)
//
// This didn't exist before. The admin page calls:
//   - POST /api/banners/{id} with _method=PUT (multipart, to edit a banner)
//   - DELETE /api/banners/{id} (to delete a banner)
// Without this file, both of those 404 — there was no route matching a
// path segment after /api/banners, only the collection route.

import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL; // e.g. http://localhost:8000/api

// POST /api/banners/[id]  (client sends _method=PUT in the form body)
// -> forwards the multipart update straight to Laravel's update() for
// this specific banner. Laravel/Next both understand the _method=PUT
// spoof, which is why this is POST rather than a native PUT — PHP can't
// parse multipart bodies on native PUT requests.
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const formData = await req.formData();

  const res = await fetch(`${API_URL}/banners/${params.id}`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}

// DELETE /api/banners/[id] -> forwards straight to Laravel's destroy(),
// which also deletes the underlying file from public/banners.
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const res = await fetch(`${API_URL}/banners/${params.id}`, {
    method: "DELETE",
  });

  const data = await res.json();

  return NextResponse.json(data, { status: res.status });
}

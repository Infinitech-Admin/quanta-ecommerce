import { NextRequest, NextResponse } from "next/server";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// POST /api/products/:id/toggle-stock
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  const res = await fetch(`${API_URL}/products/${params.id}/toggle-stock`, {
    method: "POST",
    headers: { Accept: "application/json" },
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

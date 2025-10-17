import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getVAMDetail } from "@/lib/vam";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    const data = await getVAMDetail(id);
    return NextResponse.json(data);
  } catch (err) {
    console.error("VAM detail proxy error", err);
    return NextResponse.json({ error: "VAM detail failed" }, { status: 500 });
  }
}

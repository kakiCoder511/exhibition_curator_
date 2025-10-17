import { NextResponse } from "next/server";
import { searchVAM } from "@/lib/vam";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q") ?? "";
  if (!q.trim()) return NextResponse.json([]);
  try {
    const results = await searchVAM(q);
    return NextResponse.json(results);
  } catch (err) {
    console.error("VAM search proxy error", err);
    return NextResponse.json({ error: "VAM search failed" }, { status: 500 });
  }
}


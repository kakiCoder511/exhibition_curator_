import { NextRequest, NextResponse } from "next/server";
import { getVAMDetail } from "@/lib/vam";

type RouteContext = { params: Promise<{ id: string }> };

export const GET = async (_req: NextRequest, context: RouteContext) => {
  const { id } = await context.params;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  try {
    const data = await getVAMDetail(id);
    return NextResponse.json(data);
  } catch (err) {
    console.error("VAM detail proxy error", err);
    return NextResponse.json({ error: "VAM detail failed" }, { status: 500 });
  }
};

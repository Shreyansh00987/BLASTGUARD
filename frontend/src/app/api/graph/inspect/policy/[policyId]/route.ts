import { NextRequest, NextResponse } from "next/server";
import globalEngine from "@/lib/graphEngine";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ policyId: string }> }
) {
  const { policyId } = await params;
  const decoded = decodeURIComponent(policyId);
  const data = globalEngine.inspectPolicy(decoded);
  if (!data) {
    return NextResponse.json({ error: `Policy ${decoded} not found` }, { status: 404 });
  }
  return NextResponse.json(data);
}

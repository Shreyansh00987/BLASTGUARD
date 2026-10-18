import { NextRequest, NextResponse } from "next/server";
import globalEngine from "@/lib/graphEngine";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ nodeId: string }> }
) {
  const { nodeId } = await params;
  const decoded = decodeURIComponent(nodeId);
  const data = globalEngine.inspectNode(decoded);
  if (!data) {
    return NextResponse.json({ error: `Node ${decoded} not found` }, { status: 404 });
  }
  return NextResponse.json(data);
}

import { NextRequest, NextResponse } from "next/server";
import globalEngine from "@/lib/graphEngine";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ alertId: string }> }
) {
  const { alertId } = await params;
  const alert = globalEngine.getAlert(alertId);
  if (!alert) {
    return NextResponse.json({ error: `Alert ${alertId} not found` }, { status: 404 });
  }
  return NextResponse.json(alert);
}

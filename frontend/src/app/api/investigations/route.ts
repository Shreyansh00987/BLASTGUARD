import { NextRequest, NextResponse } from "next/server";
import globalEngine from "@/lib/graphEngine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { alert_id, workload_id } = body;
    if (!alert_id) {
      return NextResponse.json({ error: "alert_id is required" }, { status: 400 });
    }
    const result = globalEngine.investigateAlert(alert_id, workload_id);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Investigation failed" }, { status: 500 });
  }
}

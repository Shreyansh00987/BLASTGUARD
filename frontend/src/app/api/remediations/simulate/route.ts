import { NextRequest, NextResponse } from "next/server";
import globalEngine from "@/lib/graphEngine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { alert_id, investigation_id, action_type, source_id, target_id } = body;
    if (!alert_id || !action_type || !source_id || !target_id) {
      return NextResponse.json(
        { error: "alert_id, action_type, source_id, and target_id are required" },
        { status: 400 }
      );
    }

    const result = globalEngine.simulateRemediation({
      alert_id,
      investigation_id: investigation_id || "inv-default",
      action_type,
      source_id,
      target_id,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Remediation simulation failed" }, { status: 500 });
  }
}

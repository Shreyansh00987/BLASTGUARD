import { NextResponse } from "next/server";
import globalEngine from "@/lib/graphEngine";

export async function GET() {
  const alerts = globalEngine.getAlerts();
  return NextResponse.json(alerts);
}

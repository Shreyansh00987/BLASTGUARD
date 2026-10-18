import { NextResponse } from "next/server";
import globalEngine from "@/lib/graphEngine";

export async function GET() {
  const history = globalEngine.getAuditHistory();
  return NextResponse.json(history);
}

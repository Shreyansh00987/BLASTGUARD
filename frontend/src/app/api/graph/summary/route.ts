import { NextResponse } from "next/server";
import globalEngine from "@/lib/graphEngine";

export async function GET() {
  const summary = globalEngine.getSummary();
  return NextResponse.json(summary);
}

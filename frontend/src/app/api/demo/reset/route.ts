import { NextResponse } from "next/server";
import globalEngine from "@/lib/graphEngine";

export async function POST() {
  globalEngine.seed();
  return NextResponse.json({
    status: "success",
    message: "Graph restored to pristine synthetic scenario",
    ...globalEngine.getSummary(),
  });
}

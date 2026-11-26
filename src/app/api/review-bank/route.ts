import { NextResponse } from "next/server";
import { reviewBank } from "@/lib/learning-data";

// Données issues du dépôt (Tanzil, QAC, leçons Kalima) : générées une fois au build.
export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json(await reviewBank());
}

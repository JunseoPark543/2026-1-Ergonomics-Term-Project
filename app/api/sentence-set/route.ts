import { NextResponse } from "next/server";
import { getSentenceSet } from "@/lib/sentence-sets";
import type { Phase } from "@/lib/schemas";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const paperSet = searchParams.get("paperSet") as "vision" | "timeseries" | "optical" | null;
  const phase = searchParams.get("phase") as Phase | null;

  if (!paperSet || !phase) {
    return NextResponse.json({ error: "paperSet and phase required" }, { status: 400 });
  }

  try {
    const set = getSentenceSet(paperSet, phase);
    return NextResponse.json(set);
  } catch {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
}

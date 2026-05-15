import { NextResponse } from "next/server";
import { analyzePaperText } from "@/lib/openai-analysis";

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { text?: string } | null;
  const result = await analyzePaperText(body?.text ?? "");

  return NextResponse.json(result);
}

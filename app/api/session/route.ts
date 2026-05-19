import { NextResponse } from "next/server";
import { getSession, updateSessionStep, getAllSessions } from "@/lib/db";
import type { Session } from "@/lib/schemas";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const id = request.headers.get("x-auth-id");
  if (!id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const session = await getSession(id);
  if (!session) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(session);
}

export async function PATCH(request: NextRequest) {
  const authId = request.headers.get("x-auth-id");
  if (!authId) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null) as { step?: Session["currentStep"] } | null;
  if (!body?.step) return NextResponse.json({ error: "step required" }, { status: 400 });

  const stepOrder: Session["currentStep"][] = [
    "pre-test", "filtering", "post-test", "survey", "done"
  ];
  if (!stepOrder.includes(body.step)) {
    return NextResponse.json({ error: "invalid step" }, { status: 400 });
  }

  await updateSessionStep(authId, body.step);
  return NextResponse.json({ ok: true });
}

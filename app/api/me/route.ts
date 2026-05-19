import { NextResponse } from "next/server";
import { getSession } from "@/lib/db";
import type { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const role = request.headers.get("x-auth-role");
  const id = request.headers.get("x-auth-id");

  if (!role || !id) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (role === "researcher") return NextResponse.json({ role, username: id });

  const session = await getSession(id);
  if (!session) return NextResponse.json({ error: "session not found" }, { status: 404 });

  return NextResponse.json({
    role: "participant",
    participantId: session.participantId,
    currentStep: session.currentStep,
    paperSet: session.paperSet,
    groupNum: session.groupNum
  });
}

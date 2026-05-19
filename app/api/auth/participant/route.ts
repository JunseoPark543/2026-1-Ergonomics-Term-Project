import { NextResponse } from "next/server";
import { signToken } from "@/lib/auth";
import { getSession, createSession } from "@/lib/db";
import { sessionSchema, type Session } from "@/lib/schemas";

const PARTICIPANT_COOKIE = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 7
};

function assignGroup(participantId: string): Pick<Session, "groupNum" | "paperSet"> {
  const num = parseInt(participantId, 10);
  return {
    groupNum: (num % 2 === 1 ? 1 : 2) as 1 | 2,
    paperSet: num <= 2 ? "vision" : num <= 4 ? "timeseries" : "optical"
  };
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { participantId?: string } | null;
  const participantId = body?.participantId?.trim().padStart(2, "0") ?? "";

  if (!/^0[1-6]$/.test(participantId)) {
    return NextResponse.json({ error: "참가자 번호는 01~06이어야 합니다." }, { status: 400 });
  }

  let session = await getSession(participantId);
  if (!session) {
    session = sessionSchema.parse({
      ...assignGroup(participantId),
      participantId,
      currentStep: "reading",
      createdAt: new Date().toISOString()
    });
    await createSession(session);
  }

  const token = await signToken({ role: "participant", participantId });
  const res = NextResponse.json({ redirectTo: `/experiment/${session.currentStep}` });
  res.cookies.set("participant_token", token, PARTICIPANT_COOKIE);
  return res;
}

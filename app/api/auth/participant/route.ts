import { NextResponse } from "next/server";
import { generateToken } from "@/lib/auth";
import { getSession, createSession, createAuthSession } from "@/lib/db";
import { sessionSchema, type Session } from "@/lib/schemas";

const COOKIE = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 7
};

const PARTICIPANTS: Record<string, Pick<Session, "groupNum" | "paperSet">> = {
  "추승준": { groupNum: 1, paperSet: "vision" },
  "유선호": { groupNum: 2, paperSet: "timeseries" },
  "홍성민": { groupNum: 1, paperSet: "optical" },
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { participantId?: string } | null;
  const participantId = body?.participantId?.trim() ?? "";

  const assignment = PARTICIPANTS[participantId];
  if (!assignment) {
    return NextResponse.json({ error: "등록된 참가자 이름이 아닙니다." }, { status: 400 });
  }

  let session = await getSession(participantId);
  if (!session) {
    session = sessionSchema.parse({
      ...assignment,
      participantId,
      currentStep: "guide",
      createdAt: new Date().toISOString()
    });
    await createSession(session);
  }

  const token = generateToken();
  await createAuthSession(token, "participant", participantId, 7 * 24);

  const res = NextResponse.json({ redirectTo: `/experiment/${session.currentStep}` });
  res.cookies.set("participant_token", token, COOKIE);
  return res;
}

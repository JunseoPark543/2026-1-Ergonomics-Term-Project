import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { generateToken } from "@/lib/auth";
import { getSession, createSession, createAuthSession, getAuthSession } from "@/lib/db";
import { sessionSchema, type Session } from "@/lib/schemas";

const COOKIE = {
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
    paperSet: "lp"
  };
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as { participantId?: string } | null;
  const raw = body?.participantId?.trim() ?? "";
  const participantId = raw.padStart(2, "0");

  if (!/^(0[1-9]|[12][0-9]|30)$/.test(participantId)) {
    return NextResponse.json({ error: "참가자 번호는 01~30이어야 합니다." }, { status: 400 });
  }

  let session = await getSession(participantId);
  if (session) {
    // 기존 쿠키로 본인임을 확인한 경우에만 재로그인 허용
    const existingToken = request.cookies.get("participant_token")?.value;
    const authSession = existingToken ? await getAuthSession(existingToken) : null;
    const isSelf = authSession?.role === "participant" && authSession?.identity === participantId;
    if (!isSelf) {
      return NextResponse.json({ error: "이미 사용 중인 번호입니다. 다른 번호를 입력해주세요." }, { status: 409 });
    }
  } else {
    session = sessionSchema.parse({
      ...assignGroup(participantId),
      participantId,
      currentStep: "guide",
      createdAt: new Date().toISOString()
    });
    await createSession(session);
  }

  const token = generateToken();
  await createAuthSession(token, "participant", participantId, 7 * 24);

  const VALID_STEPS: Session["currentStep"][] = [
    "guide", "reading", "pre-test", "filtering", "post-test", "survey", "done"
  ];
  const step = VALID_STEPS.includes(session.currentStep as Session["currentStep"])
    ? session.currentStep
    : "guide";

  const res = NextResponse.json({ redirectTo: `/experiment/${step}` });
  res.cookies.set("participant_token", token, COOKIE);
  return res;
}

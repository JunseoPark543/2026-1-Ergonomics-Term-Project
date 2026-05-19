import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { signToken, setResearcherCookie } from "@/lib/auth";

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a), bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null) as { username?: string; password?: string } | null;
  const { username = "", password = "" } = body ?? {};

  const validUsername = process.env.RESEARCHER_USERNAME ?? "";
  const validPassword = process.env.RESEARCHER_PASSWORD ?? "";

  if (!validUsername || !validPassword) {
    return NextResponse.json({ error: "서버에 연구자 계정이 설정되지 않았습니다." }, { status: 500 });
  }

  if (!safeEqual(username, validUsername) || !safeEqual(password, validPassword)) {
    return NextResponse.json({ error: "아이디 또는 비밀번호가 틀렸습니다." }, { status: 401 });
  }

  const token = await signToken({ role: "researcher", username });
  await setResearcherCookie(token);

  return NextResponse.json({ redirectTo: "/admin" });
}

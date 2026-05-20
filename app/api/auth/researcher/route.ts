import { NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { generateToken } from "@/lib/auth";
import { createAuthSession } from "@/lib/db";

const COOKIE = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 8
};

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

  const token = generateToken();
  await createAuthSession(token, "researcher", username, 8);

  const res = NextResponse.json({ redirectTo: "/admin" });
  res.cookies.set("researcher_token", token, COOKIE);
  return res;
}

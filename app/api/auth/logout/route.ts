import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ redirectTo: "/" });
  res.cookies.delete("participant_token");
  res.cookies.delete("researcher_token");
  return res;
}

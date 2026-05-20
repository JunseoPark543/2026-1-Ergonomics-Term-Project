import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { deleteAuthSession } from "@/lib/db";

export async function POST(request: NextRequest) {
  const participantToken = request.cookies.get("participant_token")?.value;
  const researcherToken = request.cookies.get("researcher_token")?.value;

  if (participantToken) await deleteAuthSession(participantToken).catch(() => {});
  if (researcherToken) await deleteAuthSession(researcherToken).catch(() => {});

  const res = NextResponse.json({ redirectTo: "/" });
  res.cookies.delete("participant_token");
  res.cookies.delete("researcher_token");
  return res;
}

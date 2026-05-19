import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth";

const RESEARCHER_PATHS = ["/admin", "/api/export", "/api/session-list", "/api/admin"];
const PARTICIPANT_PATHS = ["/experiment", "/api/responses", "/api/session", "/api/sentence-set", "/api/me"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 공개 경로
  if (pathname.startsWith("/api/auth") || pathname === "/" || pathname === "/admin/login") {
    return NextResponse.next();
  }

  const researcherToken = request.cookies.get("researcher_token")?.value ?? "";
  const participantToken = request.cookies.get("participant_token")?.value ?? "";

  const researcherPayload = researcherToken ? await verifyToken(researcherToken) : null;
  const isResearcher = researcherPayload?.role === "researcher";

  // 연구자 전용 경로
  if (RESEARCHER_PATHS.some((p) => pathname.startsWith(p))) {
    if (!isResearcher) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return addAuthHeaders(request, "researcher", (researcherPayload as { username: string }).username);
  }

  // 참가자 경로 (연구자도 접근 가능)
  if (PARTICIPANT_PATHS.some((p) => pathname.startsWith(p))) {
    if (isResearcher) return NextResponse.next();

    const participantPayload = participantToken ? await verifyToken(participantToken) : null;
    if (!participantPayload || participantPayload.role !== "participant") {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      }
      return NextResponse.redirect(new URL("/", request.url));
    }
    return addAuthHeaders(request, "participant", participantPayload.participantId);
  }

  return NextResponse.next();
}

function addAuthHeaders(request: NextRequest, role: string, id: string) {
  const headers = new Headers(request.headers);
  headers.set("x-auth-role", role);
  headers.set("x-auth-id", id);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/experiment/:path*", "/admin/:path*", "/api/:path*"]
};

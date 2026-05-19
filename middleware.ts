import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Edge Runtime에서 JWT 검증 없이 쿠키 존재 여부만 확인한다.
// 실제 JWT 검증은 각 API Route Handler(Node.js Runtime)가 담당한다.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 공개 경로는 통과
  if (pathname === "/" || pathname === "/admin/login") return NextResponse.next();

  // 실험 페이지: 쿠키 없으면 로그인 페이지로
  if (pathname.startsWith("/experiment")) {
    const hasToken =
      request.cookies.has("participant_token") || request.cookies.has("researcher_token");
    if (!hasToken) return NextResponse.redirect(new URL("/", request.url));
    return NextResponse.next();
  }

  // 관리자 페이지: 연구자 쿠키 없으면 로그인 페이지로
  if (pathname.startsWith("/admin")) {
    if (!request.cookies.has("researcher_token")) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/experiment/:path*", "/admin/:path*"]
};

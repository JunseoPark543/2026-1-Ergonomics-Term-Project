// JWT 없이 랜덤 UUID 토큰만 생성한다.
// 검증은 Supabase auth_sessions 테이블 조회로 처리한다.
export function generateToken(): string {
  return crypto.randomUUID();
}

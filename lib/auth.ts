import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type JWTPayload =
  | { role: "participant"; participantId: string }
  | { role: "researcher"; username: string };

function secret() {
  const key = process.env.JWT_SECRET;
  if (!key) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(key);
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret());
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

const COOKIE_BASE = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production"
};

export async function setParticipantCookie(token: string) {
  (await cookies()).set("participant_token", token, { ...COOKIE_BASE, maxAge: 60 * 60 * 24 * 7 });
}

export async function setResearcherCookie(token: string) {
  (await cookies()).set("researcher_token", token, { ...COOKIE_BASE, maxAge: 60 * 60 * 8 });
}

export async function clearAuthCookies() {
  const jar = await cookies();
  jar.delete("participant_token");
  jar.delete("researcher_token");
}

export async function getParticipantPayload(): Promise<{ participantId: string } | null> {
  const token = (await cookies()).get("participant_token")?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "participant") return null;
  return { participantId: payload.participantId };
}

export async function getResearcherPayload(): Promise<{ username: string } | null> {
  const token = (await cookies()).get("researcher_token")?.value;
  if (!token) return null;
  const payload = await verifyToken(token);
  if (!payload || payload.role !== "researcher") return null;
  return { username: payload.username };
}

import { SignJWT, jwtVerify } from "jose";

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

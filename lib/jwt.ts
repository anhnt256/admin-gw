// utils/jwt.ts
import * as jose from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "gateway2025",
);

export async function signJWT(payload: any) {
  const alg = "HS256";

  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg })
    .setExpirationTime("24h")
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload;
  } catch (error) {
    return null;
  }
}

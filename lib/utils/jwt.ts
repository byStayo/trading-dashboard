import { SignJWT, jwtVerify } from 'jose';
import { nanoid } from 'nanoid';

export interface UserJWTPayload {
  jti: string;
  iat: number;
  userId: string;
  email: string;
  role: 'user' | 'admin';
}

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function signToken(payload: Omit<UserJWTPayload, 'jti' | 'iat'>) {
  const iat = Math.floor(Date.now() / 1000);
  const jti = nanoid();

  return new SignJWT({ ...payload, jti, iat })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt(iat)
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<UserJWTPayload> {
  const { payload } = await jwtVerify(token, JWT_SECRET);
  return payload as UserJWTPayload;
} 
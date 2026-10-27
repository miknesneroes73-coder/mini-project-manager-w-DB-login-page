import { createHmac, timingSafeEqual } from 'node:crypto';
import { InvalidTokenError } from '../../application/auth/errors/auth.errors.js';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  tenantId: string;
  exp: number;
}

function base64Url(value: string): string {
  return Buffer.from(value).toString('base64url');
}

function sign(input: string, secret: string): string {
  return createHmac('sha256', secret).update(input).digest('base64url');
}

export function createAccessToken(payload: AccessTokenPayload, secret: string): string {
  const header = base64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64Url(JSON.stringify(payload));
  const signature = sign(`${header}.${body}`, secret);
  return `${header}.${body}.${signature}`;
}

export function verifyAccessToken(token: string, secret: string): AccessTokenPayload {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) throw new Error('invalid format');

    const [header, body, signature] = parts;
    const expected = sign(`${header}.${body}`, secret);
    const actualBuffer = Buffer.from(signature, 'base64url');
    const expectedBuffer = Buffer.from(expected, 'base64url');

    if (actualBuffer.length !== expectedBuffer.length || !timingSafeEqual(actualBuffer, expectedBuffer)) {
      throw new Error('invalid signature');
    }

    const parsed = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as AccessTokenPayload;
    if (!parsed.sub || !parsed.email || !parsed.tenantId || !Number.isInteger(parsed.exp) || parsed.exp <= Math.floor(Date.now() / 1000)) {
      throw new Error('expired token');
    }

    return parsed;
  } catch {
    throw new InvalidTokenError();
  }
}

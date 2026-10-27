import { Request } from 'express';
import { verifyAccessToken } from './auth/jwt.js';
import { TenantRequiredError } from '../application/project/errors/project.errors.js';

const UUID_V4_OR_UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function tenantIdFromRequest(req: Request): string {
  const authorization = req.header('authorization');
  if (authorization) {
    const match = authorization.match(/^Bearer\s+(.+)$/i);
    if (!match) throw new TenantRequiredError();
    const secret = process.env.AUTH_JWT_SECRET ?? 'development-only-secret-change-me';
    const payload = verifyAccessToken(match[1], secret);
    return payload.tenantId;
  }

  const raw = req.header('x-tenant-id');
  if (!raw || !UUID_V4_OR_UUID_PATTERN.test(raw)) throw new TenantRequiredError();
  return raw;
}

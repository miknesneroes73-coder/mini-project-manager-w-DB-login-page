import { Inject, Injectable } from '@nestjs/common';
import { randomBytes, randomUUID, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { USER_REPOSITORY } from '../../../domain/auth/user.repository.js';
import type { UserRepository, UserRecord } from '../../../domain/auth/user.repository.js';
import { EmailAlreadyExistsError, InvalidCredentialsError } from '../errors/auth.errors.js';
import { LoginInput, RegisterInput } from '../inputTypes/auth.inputs.js';
import { createAccessToken } from '../../../infrastructure/auth/jwt.js';

const scrypt = promisify(scryptCallback);
const TOKEN_TTL_SECONDS = 60 * 60;

@Injectable()
export class AuthService {
  private readonly secret: string;

  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepository) {
    this.secret = process.env.AUTH_JWT_SECRET ?? 'development-only-secret-change-me';
  }

  async register(input: RegisterInput): Promise<{ accessToken: string; user: UserRecord }> {
    const email = input.email.trim().toLowerCase();
    const existing = await this.users.findByEmail(email);
    if (existing) throw new EmailAlreadyExistsError();

    const passwordHash = await this.hashPassword(input.password);
    const user = await this.users.create({
      id: randomUUID(),
      email,
      tenantId: input.tenantId,
      passwordHash,
    });

    return { accessToken: this.tokenFor(user), user };
  }

  async login(input: LoginInput): Promise<{ accessToken: string; user: UserRecord }> {
    const email = input.email.trim().toLowerCase();
    const user = await this.users.findByEmail(email);
    if (!user || !(await this.verifyPassword(input.password, user.passwordHash))) {
      throw new InvalidCredentialsError();
    }

    return { accessToken: this.tokenFor(user), user };
  }

  private tokenFor(user: UserRecord): string {
    return createAccessToken({
      sub: user.id,
      email: user.email,
      tenantId: user.tenantId,
      exp: Math.floor(Date.now() / 1000) + TOKEN_TTL_SECONDS,
    }, this.secret);
  }

  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString('hex');
    const derived = (await scrypt(password, salt, 64)) as Buffer;
    return `scrypt$${salt}$${derived.toString('hex')}`;
  }

  private async verifyPassword(password: string, stored: string): Promise<boolean> {
    const [algorithm, salt, hash] = stored.split('$');
    if (algorithm !== 'scrypt' || !salt || !hash) return false;
    const derived = (await scrypt(password, salt, 64)) as Buffer;
    const storedBuffer = Buffer.from(hash, 'hex');
    return storedBuffer.length === derived.length && timingSafeEqual(storedBuffer, derived);
  }
}

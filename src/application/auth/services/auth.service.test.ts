import { jest } from '@jest/globals';
import { AuthService } from './auth.service.js';
import type { UserRecord, UserRepository } from '../../../domain/auth/user.repository.js';

const tenantId = '11111111-1111-4111-8111-111111111111';

describe('AuthService', () => {
  let repository: UserRepository;
  let service: AuthService;

  beforeEach(() => {
    repository = {
      create: jest.fn(async (data) => data as UserRecord),
      findByEmail: jest.fn(async () => null),
    };

    process.env.AUTH_JWT_SECRET = 'test-secret';

    service = new AuthService(repository);
  });

  it('registers a user and returns a token without storing the password in plain text', async () => {
    const result = await service.register({
      email: 'TEST@example.com',
      password: 'password123',
      tenantId,
    });

    expect(result.user.email).toBe('test@example.com');
    expect(result.user.passwordHash).not.toBe('password123');
    expect(result.accessToken.split('.')).toHaveLength(3);
  });

  it('logs in with the correct password', async () => {
    const registered = await service.register({
      email: 'test@example.com',
      password: 'password123',
      tenantId,
    });

    repository.findByEmail = jest.fn(async () => registered.user);

    const login = await service.login({
      email: 'test@example.com',
      password: 'password123',
    });

    expect(login.user.id).toBe(registered.user.id);
    expect(login.accessToken.split('.')).toHaveLength(3);
  });

  it('rejects an incorrect password', async () => {
    const registered = await service.register({
      email: 'test@example.com',
      password: 'password123',
      tenantId,
    });

    repository.findByEmail = jest.fn(async () => registered.user);

    await expect(
      service.login({
        email: 'test@example.com',
        password: 'wrong-password',
      }),
    ).rejects.toMatchObject({
      code: 'INVALID_CREDENTIALS',
    });
  });
});

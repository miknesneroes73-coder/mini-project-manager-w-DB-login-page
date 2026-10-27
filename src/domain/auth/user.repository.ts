export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface UserRecord {
  id: string;
  email: string;
  tenantId: string;
  passwordHash: string;
}

export interface UserCreateData {
  id: string;
  email: string;
  tenantId: string;
  passwordHash: string;
}

export interface UserRepository {
  create(data: UserCreateData): Promise<UserRecord>;
  findByEmail(email: string): Promise<UserRecord | null>;
}

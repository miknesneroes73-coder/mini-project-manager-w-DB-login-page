import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import type { UserCreateData, UserRecord, UserRepository } from '../../../domain/auth/user.repository.js';
import { UserEntity } from '../entities/user.entity.js';

@Injectable()
export class TypeOrmUserRepository implements UserRepository {
  private readonly repository: Repository<UserEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(UserEntity);
  }

  async create(data: UserCreateData): Promise<UserRecord> {
    const entity = this.repository.create(data);
    const saved = await this.repository.save(entity);
    return this.toRecord(saved);
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const entity = await this.repository.findOne({ where: { email } });
    return entity ? this.toRecord(entity) : null;
  }

  private toRecord(entity: UserEntity): UserRecord {
    return {
      id: entity.id,
      email: entity.email,
      tenantId: entity.tenantId,
      passwordHash: entity.passwordHash,
    };
  }
}

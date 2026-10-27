import { Injectable } from '@nestjs/common';
import { DataSource, IsNull, Repository } from 'typeorm';
import type { PhaseCreateData, PhaseListFilters, PhaseRecord, PhaseRepository, PhaseUpdateData } from '../../../domain/phase/phase.repository.js';
import { PhaseEntity } from '../entities/phase.entity.js';

@Injectable()
export class TypeOrmPhaseRepository implements PhaseRepository {
  private readonly repository: Repository<PhaseEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(PhaseEntity);
  }

  async create(data: PhaseCreateData): Promise<string> {
    await this.repository.insert(data);
    return data.id;
  }

  async update(data: PhaseUpdateData): Promise<string> {
    const { id, tenantId, ...changes } = data;
    await this.repository.update({ id, tenantId, deletedAt: IsNull() }, changes);
    return id;
  }

  async archive(tenantId: string, id: string): Promise<void> {
    await this.repository.update({ id, tenantId, deletedAt: IsNull() }, { deletedAt: new Date() });
  }

  async findVisibleById(tenantId: string, id: string): Promise<PhaseRecord | null> {
    const entity = await this.repository.findOne({ where: { id, tenantId, deletedAt: IsNull() } });
    return entity ? this.toRecord(entity) : null;
  }

  async findAllByProject(tenantId: string, projectId: string): Promise<PhaseRecord[]> {
    const rows = await this.repository.createQueryBuilder('phase')
      .where('phase.tenantId = :tenantId', { tenantId })
      .andWhere('phase.projectId = :projectId', { projectId })
      .andWhere('phase.deletedAt IS NULL')
      .orderBy('phase.order', 'ASC')
      .addOrderBy('phase.createdAt', 'ASC')
      .getMany();

    return rows.map((row) => this.toRecord(row));
  }

  async findMany(filters: PhaseListFilters): Promise<{ data: PhaseRecord[]; count: number }> {
    const query = this.repository.createQueryBuilder('phase')
      .where('phase.tenantId = :tenantId', { tenantId: filters.tenantId })
      .andWhere('phase.deletedAt IS NULL');

    if (filters.projectId) query.andWhere('phase.projectId = :projectId', { projectId: filters.projectId });
    if (filters.status) query.andWhere('phase.status = :status', { status: filters.status });

    const [rows, count] = await query
      .orderBy('phase.order', 'ASC')
      .addOrderBy('phase.createdAt', 'ASC')
      .skip(filters.skip)
      .take(filters.limit)
      .getManyAndCount();

    return { data: rows.map((row) => this.toRecord(row)), count };
  }

  private toRecord(entity: PhaseEntity): PhaseRecord {
    return {
      id: entity.id,
      tenantId: entity.tenantId,
      projectId: entity.projectId,
      title: entity.title,
      order: entity.order,
      status: entity.status,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

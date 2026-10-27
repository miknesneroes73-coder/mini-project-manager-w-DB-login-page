import { Injectable } from '@nestjs/common';
import { DataSource, IsNull, Repository } from 'typeorm';
import type { ProjectRepository, ProjectCreateData, ProjectListFilters, ProjectRecord, ProjectUpdateData } from '../../../domain/project/project.repository.js';
import { ProjectEntity } from '../entities/project.entity.js';

@Injectable()
export class TypeOrmProjectRepository implements ProjectRepository {
  private readonly repository: Repository<ProjectEntity>;

  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(ProjectEntity);
  }

  async create(data: ProjectCreateData): Promise<string> {
    await this.repository.insert(data);
    return data.id;
  }

  async update(data: ProjectUpdateData): Promise<string> {
    const { id, tenantId, ...changes } = data;
    await this.repository.update({ id, tenantId, deletedAt: IsNull() }, changes);
    return id;
  }

  async findVisibleById(tenantId: string, id: string): Promise<ProjectRecord | null> {
    const entity = await this.repository.findOne({ where: { id, tenantId, deletedAt: IsNull() } });
    return entity ? this.toRecord(entity) : null;
  }

  async findMany(filters: ProjectListFilters): Promise<{ data: ProjectRecord[]; count: number }> {
    const query = this.repository.createQueryBuilder('project')
      .where('project.tenantId = :tenantId', { tenantId: filters.tenantId })
      .andWhere('project.deletedAt IS NULL');

    if (filters.status) query.andWhere('project.status = :status', { status: filters.status });
    if (filters.priority) query.andWhere('project.priority = :priority', { priority: filters.priority });
    if (filters.search !== undefined && filters.search !== '') {
      query.andWhere('project.title ILIKE :search', { search: `%${filters.search}%` });
    }

    const [rows, count] = await query
      .orderBy('project.createdAt', 'DESC')
      .skip(filters.skip)
      .take(filters.limit)
      .getManyAndCount();

    return { data: rows.map((row) => this.toRecord(row)), count };
  }

  private toRecord(entity: ProjectEntity): ProjectRecord {
    return {
      id: entity.id,
      tenantId: entity.tenantId,
      title: entity.title,
      description: entity.description,
      status: entity.status,
      priority: entity.priority,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    };
  }
}

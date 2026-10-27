import { Injectable } from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';
import type { ProjectArchiveUnitOfWork } from '../../../domain/project/project-archive.unit-of-work.js';
import { ProjectEntity } from '../entities/project.entity.js';
import { PhaseEntity } from '../../phase/entities/phase.entity.js';

@Injectable()
export class TypeOrmProjectArchiveUnitOfWork implements ProjectArchiveUnitOfWork {
  constructor(private readonly dataSource: DataSource) {}

  async run(tenantId: string, projectId: string): Promise<void> {
    await this.dataSource.transaction(async (manager) => {
      const deletedAt = new Date();
      await manager.update(ProjectEntity, { id: projectId, tenantId, deletedAt: IsNull() }, { deletedAt });
      await manager.update(PhaseEntity, { projectId, tenantId, deletedAt: IsNull() }, { deletedAt });
    });
  }
}

import { Inject, Injectable } from '@nestjs/common';
import { PROJECT_REPOSITORY } from '../../../domain/project/project.repository.js';
import type { ProjectRepository, ProjectRecord } from '../../../domain/project/project.repository.js';
import { ProjectPriority, ProjectStatus } from '../../../domain/project/project.enums.js';

@Injectable()
export class ProjectFinderService {
  constructor(@Inject(PROJECT_REPOSITORY) private readonly projects: ProjectRepository) {}

  run(tenantId: string, filters: { status?: ProjectStatus; priority?: ProjectPriority; search?: string; limit: number; skip: number }): Promise<{ data: ProjectRecord[]; count: number }> {
    return this.projects.findMany({ tenantId, ...filters });
  }

  findOne(tenantId: string, id: string): Promise<ProjectRecord | null> {
    return this.projects.findVisibleById(tenantId, id);
  }
}

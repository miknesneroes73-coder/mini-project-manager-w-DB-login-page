import { Inject, Injectable } from '@nestjs/common';
import { PROJECT_ARCHIVE_UNIT_OF_WORK } from '../../../domain/project/project-archive.unit-of-work.js';
import type { ProjectArchiveUnitOfWork } from '../../../domain/project/project-archive.unit-of-work.js';
import { PROJECT_REPOSITORY } from '../../../domain/project/project.repository.js';
import type { ProjectRepository } from '../../../domain/project/project.repository.js';
import { ProjectNotFoundError } from '../errors/project.errors.js';

@Injectable()
export class ProjectDeleterService {
  constructor(
    @Inject(PROJECT_REPOSITORY) private readonly projects: ProjectRepository,
    @Inject(PROJECT_ARCHIVE_UNIT_OF_WORK) private readonly archiveUnitOfWork: ProjectArchiveUnitOfWork,
  ) {}

  async run(tenantId: string, id: string): Promise<string> {
    const project = await this.projects.findVisibleById(tenantId, id);
    if (!project) throw new ProjectNotFoundError();

    await this.archiveUnitOfWork.run(tenantId, id);
    return id;
  }
}

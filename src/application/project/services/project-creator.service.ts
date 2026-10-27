import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ProjectPriority, ProjectStatus } from '../../../domain/project/project.enums.js';
import { PROJECT_REPOSITORY } from '../../../domain/project/project.repository.js';
import type { ProjectRepository } from '../../../domain/project/project.repository.js';
import { CreateProjectInput } from '../inputTypes/project.inputs.js';
import { ValidationDomainError } from '../errors/project.errors.js';

@Injectable()
export class ProjectCreatorService {
  constructor(@Inject(PROJECT_REPOSITORY) private readonly projects: ProjectRepository) {}

  async run(tenantId: string, input: CreateProjectInput): Promise<string> {
    const id = randomUUID();
    const title = input.title.trim();
    if (!title) throw new ValidationDomainError('title must not be blank');

    return this.projects.create({
      id,
      tenantId,
      title,
      description: input.description ?? null,
      status: input.status ?? ProjectStatus.PLANNED,
      priority: input.priority ?? ProjectPriority.MEDIUM,
    });
  }
}

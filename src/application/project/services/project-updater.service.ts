import { Inject, Injectable } from '@nestjs/common';
import { PROJECT_REPOSITORY } from '../../../domain/project/project.repository.js';
import type { ProjectRepository } from '../../../domain/project/project.repository.js';
import { UpdateProjectInput } from '../inputTypes/project.inputs.js';
import { ProjectNotFoundError, ValidationDomainError } from '../errors/project.errors.js';

@Injectable()
export class ProjectUpdaterService {
  constructor(
    @Inject(PROJECT_REPOSITORY)
    private readonly projects: ProjectRepository,
  ) {}

  async run(
    tenantId: string,
    input: UpdateProjectInput,
  ): Promise<string> {
    const id = input.id.trim().replace(/^"|"$/g, '');

    if (
      input.title === undefined &&
      input.description === undefined &&
      input.status === undefined &&
      input.priority === undefined
    ) {
      throw new ValidationDomainError(
        'At least one project field must be provided besides id.',
      );
    }

    if (input.title !== undefined && !input.title.trim()) {
      throw new ValidationDomainError('title must not be blank');
    }

    const existing = await this.projects.findVisibleById(
      tenantId,
      id,
    );

    if (!existing) {
      throw new ProjectNotFoundError();
    }

    return this.projects.update({
      id,
      tenantId,
      ...(input.title !== undefined
        ? { title: input.title.trim() }
        : {}),
      ...(input.description !== undefined
        ? { description: input.description }
        : {}),
      ...(input.status !== undefined
        ? { status: input.status }
        : {}),
      ...(input.priority !== undefined
        ? { priority: input.priority }
        : {}),
    });
  }
}

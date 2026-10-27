import { Inject, Injectable } from '@nestjs/common';
import { PHASE_REPOSITORY } from '../../../domain/phase/phase.repository.js';
import type { PhaseRepository } from '../../../domain/phase/phase.repository.js';
import { PROJECT_REPOSITORY } from '../../../domain/project/project.repository.js';
import type { ProjectRepository } from '../../../domain/project/project.repository.js';
import { UpdatePhaseInput } from '../inputTypes/phase.inputs.js';
import { PhaseNotFoundError } from '../errors/phase.errors.js';
import { ProjectNotAvailableError, ValidationDomainError } from '../../project/errors/project.errors.js';

@Injectable()
export class PhaseUpdaterService {
  constructor(
    @Inject(PHASE_REPOSITORY) private readonly phases: PhaseRepository,
    @Inject(PROJECT_REPOSITORY) private readonly projects: ProjectRepository,
  ) {}

  async run(tenantId: string, input: UpdatePhaseInput): Promise<string> {
    if (input.title === undefined && input.order === undefined && input.status === undefined && input.projectId === undefined) {
      throw new ValidationDomainError('At least one phase field must be provided besides id.');
    }
    if (input.title !== undefined && !input.title.trim()) throw new ValidationDomainError('title must not be blank');

    const existing = await this.phases.findVisibleById(tenantId, input.id);
    if (!existing) throw new PhaseNotFoundError();

    if (input.projectId !== undefined) {
      const target = await this.projects.findVisibleById(tenantId, input.projectId);
      if (!target) throw new ProjectNotAvailableError();
    }

    return this.phases.update({
      id: input.id,
      tenantId,
      ...(input.title !== undefined ? { title: input.title.trim() } : {}),
      ...(input.order !== undefined ? { order: input.order } : {}),
      ...(input.status !== undefined ? { status: input.status } : {}),
      ...(input.projectId !== undefined ? { projectId: input.projectId } : {}),
    });
  }
}

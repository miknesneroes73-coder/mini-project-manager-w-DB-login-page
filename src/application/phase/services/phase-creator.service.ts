import { Inject, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PhaseStatus } from '../../../domain/phase/phase.enums.js';
import { PHASE_REPOSITORY } from '../../../domain/phase/phase.repository.js';
import type { PhaseRepository } from '../../../domain/phase/phase.repository.js';
import { PROJECT_REPOSITORY } from '../../../domain/project/project.repository.js';
import type { ProjectRepository } from '../../../domain/project/project.repository.js';
import { CreatePhaseInput } from '../inputTypes/phase.inputs.js';
import { ProjectNotAvailableError, ValidationDomainError } from '../../project/errors/project.errors.js';

@Injectable()
export class PhaseCreatorService {
  constructor(
    @Inject(PHASE_REPOSITORY) private readonly phases: PhaseRepository,
    @Inject(PROJECT_REPOSITORY) private readonly projects: ProjectRepository,
  ) {}

  async run(tenantId: string, input: CreatePhaseInput): Promise<string> {
    const project = await this.projects.findVisibleById(tenantId, input.projectId);
    if (!project) throw new ProjectNotAvailableError();
    const title = input.title.trim();
    if (!title) throw new ValidationDomainError('title must not be blank');

    return this.phases.create({
      id: randomUUID(),
      tenantId,
      projectId: input.projectId,
      title,
      order: input.order,
      status: input.status ?? PhaseStatus.PENDING,
    });
  }
}

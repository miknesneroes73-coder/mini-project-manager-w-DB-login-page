import { Inject, Injectable } from '@nestjs/common';
import { PHASE_REPOSITORY } from '../../../domain/phase/phase.repository.js';
import type { PhaseRepository, PhaseRecord } from '../../../domain/phase/phase.repository.js';
import { PhaseStatus } from '../../../domain/phase/phase.enums.js';

@Injectable()
export class PhaseFinderService {
  constructor(@Inject(PHASE_REPOSITORY) private readonly phases: PhaseRepository) {}

  run(tenantId: string, filters: { projectId?: string; status?: PhaseStatus; limit: number; skip: number }): Promise<{ data: PhaseRecord[]; count: number }> {
    return this.phases.findMany({ tenantId, ...filters });
  }

  findOne(tenantId: string, id: string): Promise<PhaseRecord | null> {
    return this.phases.findVisibleById(tenantId, id);
  }

  findAllByProject(tenantId: string, projectId: string): Promise<PhaseRecord[]> {
    return this.phases.findAllByProject(tenantId, projectId);
  }
}

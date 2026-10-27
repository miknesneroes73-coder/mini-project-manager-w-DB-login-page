import { Inject, Injectable } from '@nestjs/common';
import { PHASE_REPOSITORY } from '../../../domain/phase/phase.repository.js';
import type { PhaseRepository } from '../../../domain/phase/phase.repository.js';
import { PhaseNotFoundError } from '../errors/phase.errors.js';

@Injectable()
export class PhaseDeleterService {
  constructor(@Inject(PHASE_REPOSITORY) private readonly phases: PhaseRepository) {}

  async run(tenantId: string, id: string): Promise<string> {
    const phase = await this.phases.findVisibleById(tenantId, id);
    if (!phase) throw new PhaseNotFoundError();

    await this.phases.archive(tenantId, id);
    return id;
  }
}

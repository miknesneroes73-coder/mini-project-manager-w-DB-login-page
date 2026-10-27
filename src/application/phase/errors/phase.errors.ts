import { DomainError } from '../../project/errors/project.errors.js';

export class PhaseNotFoundError extends DomainError {
  constructor() {
    super('PHASE_NOT_FOUND', 'Phase not found.');
  }
}

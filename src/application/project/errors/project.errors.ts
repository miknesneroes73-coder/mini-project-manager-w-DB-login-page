export class DomainError extends Error {
  constructor(public readonly code: string, message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class TenantRequiredError extends DomainError {
  constructor() {
    super('TENANT_REQUIRED', 'A valid x-tenant-id UUID header is required.');
  }
}

export class ProjectNotFoundError extends DomainError {
  constructor() {
    super('PROJECT_NOT_FOUND', 'Project not found.');
  }
}

export class ProjectNotAvailableError extends DomainError {
  constructor() {
    super('PROJECT_NOT_AVAILABLE', 'The project does not exist, belongs to another tenant, or is archived.');
  }
}

export class ValidationDomainError extends DomainError {
  constructor(message: string) {
    super('VALIDATION_ERROR', message);
  }
}

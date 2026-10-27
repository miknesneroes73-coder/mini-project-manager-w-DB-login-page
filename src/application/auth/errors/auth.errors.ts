import { DomainError } from '../../project/errors/project.errors.js';

export class InvalidCredentialsError extends DomainError {
  constructor() {
    super('INVALID_CREDENTIALS', 'Invalid email or password.');
  }
}

export class EmailAlreadyExistsError extends DomainError {
  constructor() {
    super('EMAIL_ALREADY_EXISTS', 'A user with this email already exists.');
  }
}

export class AuthenticationRequiredError extends DomainError {
  constructor() {
    super('AUTHENTICATION_REQUIRED', 'A valid Bearer token is required.');
  }
}

export class InvalidTokenError extends DomainError {
  constructor() {
    super('INVALID_TOKEN', 'The authentication token is invalid or expired.');
  }
}

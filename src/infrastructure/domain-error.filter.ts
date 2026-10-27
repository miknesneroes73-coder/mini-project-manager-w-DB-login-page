import { ArgumentsHost, Catch } from '@nestjs/common';
import { GqlExceptionFilter } from '@nestjs/graphql';
import { GraphQLError } from 'graphql';
import { DomainError } from '../application/project/errors/project.errors.js';

@Catch(DomainError)
export class DomainErrorFilter implements GqlExceptionFilter {
  catch(exception: DomainError, _host: ArgumentsHost): GraphQLError {
    return new GraphQLError(exception.message, {
      extensions: {
        code: exception.code,
      },
    });
  }
}

import { Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { ConfigModule } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { join } from 'node:path';
import { DatabaseModule } from './infrastructure/database/database.module.js';
import { ProjectResolver } from './infrastructure/project/resolvers/project.resolver.js';
import { PhaseResolver } from './infrastructure/phase/resolvers/phase.resolver.js';
import { TypeOrmProjectRepository } from './infrastructure/project/repositories/project.repository.js';
import { TypeOrmPhaseRepository } from './infrastructure/phase/repositories/phase.repository.js';
import { TypeOrmProjectArchiveUnitOfWork } from './infrastructure/project/repositories/project-archive.unit-of-work.js';
import { PROJECT_REPOSITORY } from './domain/project/project.repository.js';
import { PHASE_REPOSITORY } from './domain/phase/phase.repository.js';
import { PROJECT_ARCHIVE_UNIT_OF_WORK } from './domain/project/project-archive.unit-of-work.js';
import { ProjectCreatorService } from './application/project/services/project-creator.service.js';
import { ProjectUpdaterService } from './application/project/services/project-updater.service.js';
import { ProjectDeleterService } from './application/project/services/project-deleter.service.js';
import { ProjectFinderService } from './application/project/services/project-finder.service.js';
import { PhaseCreatorService } from './application/phase/services/phase-creator.service.js';
import { PhaseUpdaterService } from './application/phase/services/phase-updater.service.js';
import { PhaseDeleterService } from './application/phase/services/phase-deleter.service.js';
import { PhaseFinderService } from './application/phase/services/phase-finder.service.js';
import { DomainErrorFilter } from './infrastructure/domain-error.filter.js';
import { AuthResolver } from './infrastructure/auth/resolvers/auth.resolver.js';
import { AuthService } from './application/auth/services/auth.service.js';
import { TypeOrmUserRepository } from './infrastructure/auth/repositories/user.repository.js';
import { USER_REPOSITORY } from './domain/auth/user.repository.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DatabaseModule,
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
      sortSchema: true,
      context: ({ req }: { req: import('express').Request }) => ({ req }),
    }),
  ],
  providers: [
    ProjectResolver,
    PhaseResolver,
    AuthResolver,
    ProjectCreatorService,
    ProjectUpdaterService,
    ProjectDeleterService,
    ProjectFinderService,
    PhaseCreatorService,
    PhaseUpdaterService,
    PhaseDeleterService,
    PhaseFinderService,
    AuthService,
    { provide: PROJECT_REPOSITORY, useClass: TypeOrmProjectRepository },
    { provide: USER_REPOSITORY, useClass: TypeOrmUserRepository },
    { provide: PHASE_REPOSITORY, useClass: TypeOrmPhaseRepository },
    { provide: PROJECT_ARCHIVE_UNIT_OF_WORK, useClass: TypeOrmProjectArchiveUnitOfWork },
    { provide: APP_PIPE, useFactory: () => new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: true }) },
    { provide: APP_FILTER, useClass: DomainErrorFilter },
  ],
})
export class AppModule {}

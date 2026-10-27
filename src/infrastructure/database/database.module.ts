import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProjectEntity } from '../project/entities/project.entity.js';
import { PhaseEntity } from '../phase/entities/phase.entity.js';
import { UserEntity } from '../auth/entities/user.entity.js';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_NAME', 'mini_project_manager'),
        entities: [ProjectEntity, PhaseEntity, UserEntity],
        synchronize: true,
      }),
    }),
  ],
})
export class DatabaseModule {}

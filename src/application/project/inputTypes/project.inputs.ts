import { Field, ID, InputType, Int } from '@nestjs/graphql';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Matches,
  Min,
} from 'class-validator';
import {
  ProjectPriority,
  ProjectStatus,
} from '../../../domain/project/project.enums.js';

const TITLE_REGEX = /\S/;

@InputType()
export class CreateProjectInput {
  @Field(() => String)
  @IsString()
  @Length(1, 120)
  @Matches(TITLE_REGEX, { message: 'title must not be blank' })
  title!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string | null;

  @Field(() => ProjectStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @Field(() => ProjectPriority, { nullable: true })
  @IsOptional()
  @IsEnum(ProjectPriority)
  priority?: ProjectPriority;
}

@InputType()
export class UpdateProjectInput {
  @Field(() => ID)
  @IsString()
  id!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  @Matches(TITLE_REGEX, { message: 'title must not be blank' })
  title?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(0, 1000)
  description?: string | null;

  @Field(() => ProjectStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @Field(() => ProjectPriority, { nullable: true })
  @IsOptional()
  @IsEnum(ProjectPriority)
  priority?: ProjectPriority;
}

@InputType()
export class ProjectListInput {
  @Field(() => ProjectStatus, { nullable: true })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;

  @Field(() => ProjectPriority, { nullable: true })
  @IsOptional()
  @IsEnum(ProjectPriority)
  priority?: ProjectPriority;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  search?: string;

  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit: number = 10;

  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  skip: number = 0;
}

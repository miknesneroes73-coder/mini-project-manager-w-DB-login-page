import { Field, ID, InputType, Int } from '@nestjs/graphql';
import { IsEnum, IsInt, IsOptional, IsString, Length, Matches, Min } from 'class-validator';
import { PhaseStatus } from '../../../domain/phase/phase.enums.js';

@InputType()
export class CreatePhaseInput {
  @Field(() => ID)
  @IsString()
  projectId!: string;

  @Field(() => String)
  @IsString()
  @Length(1, 120)
  @Matches(/\S/, { message: 'title must not be blank' })
  title!: string;

  @Field(() => Int)
  @IsInt()
  @Min(0)
  order!: number;

  @Field(() => PhaseStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PhaseStatus)
  status?: PhaseStatus;
}

@InputType()
export class UpdatePhaseInput {
  @Field(() => ID)
  @IsString()
  id!: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  @Length(1, 120)
  @Matches(/\S/, { message: 'title must not be blank' })
  title?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;

  @Field(() => PhaseStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PhaseStatus)
  status?: PhaseStatus;

  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  projectId?: string;

}

@InputType()
export class PhaseListInput {
  @Field(() => ID, { nullable: true })
  @IsOptional()
  @IsString()
  projectId?: string;

  @Field(() => PhaseStatus, { nullable: true })
  @IsOptional()
  @IsEnum(PhaseStatus)
  status?: PhaseStatus;

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

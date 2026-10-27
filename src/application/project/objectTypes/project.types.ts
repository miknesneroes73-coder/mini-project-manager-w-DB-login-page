import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { ProjectPriority, ProjectStatus } from '../../../domain/project/project.enums.js';
import { PhaseStatus } from '../../../domain/phase/phase.enums.js';

registerEnumType(ProjectStatus, { name: 'ProjectStatus' });
registerEnumType(ProjectPriority, { name: 'ProjectPriority' });

@ObjectType()
export class ProjectType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  tenantId!: string;

  @Field(() => String)
  title!: string;

  @Field(() => String, { nullable: true })
  description!: string | null;

  @Field(() => ProjectStatus)
  status!: ProjectStatus;

  @Field(() => ProjectPriority)
  priority!: ProjectPriority;

  @Field(() => String)
  createdAt!: string;

  @Field(() => String)
  updatedAt!: string;

  @Field(() => [PhaseSummaryType])
  phases!: PhaseSummaryType[];
}

@ObjectType()
export class PhaseSummaryType {
  @Field(() => ID)
  id!: string;

  @Field(() => ID)
  tenantId!: string;

  @Field(() => ID)
  projectId!: string;

  @Field(() => String)
  title!: string;

  @Field(() => Int)
  order!: number;

  @Field(() => PhaseStatus)
  status!: PhaseStatus;

  @Field(() => String)
  createdAt!: string;

  @Field(() => String)
  updatedAt!: string;
}

@ObjectType()
export class ProjectPageType {
  @Field(() => [ProjectType])
  data!: ProjectType[];

  @Field(() => Int)
  count!: number;
}

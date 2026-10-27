import { Field, ID, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { PhaseStatus } from '../../../domain/phase/phase.enums.js';

registerEnumType(PhaseStatus, { name: 'PhaseStatus' });

@ObjectType()
export class PhaseType {
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
export class PhasePageType {
  @Field(() => [PhaseType])
  data!: PhaseType[];

  @Field(() => Int)
  count!: number;
}

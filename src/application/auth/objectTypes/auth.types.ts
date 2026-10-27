import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class UserType {
  @Field()
  id!: string;

  @Field()
  email!: string;

  @Field()
  tenantId!: string;
}

@ObjectType()
export class AuthPayloadType {
  @Field()
  accessToken!: string;

  @Field(() => UserType)
  user!: UserType;
}

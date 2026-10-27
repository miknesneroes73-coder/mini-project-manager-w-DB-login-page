import { Field, InputType } from '@nestjs/graphql';
import { IsEmail, IsString, IsUUID, Length, MinLength } from 'class-validator';

@InputType()
export class RegisterInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsString()
  @MinLength(8)
  @Length(8, 100)
  password!: string;

  @Field()
  @IsUUID()
  tenantId!: string;
}

@InputType()
export class LoginInput {
  @Field()
  @IsEmail()
  email!: string;

  @Field()
  @IsString()
  @MinLength(1)
  password!: string;
}

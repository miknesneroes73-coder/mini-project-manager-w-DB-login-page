import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { AuthService } from '../../../application/auth/services/auth.service.js';
import { LoginInput, RegisterInput } from '../../../application/auth/inputTypes/auth.inputs.js';
import { AuthPayloadType } from '../../../application/auth/objectTypes/auth.types.js';

@Resolver()
export class AuthResolver {
  constructor(private readonly auth: AuthService) {}

  @Mutation(() => AuthPayloadType)
  register(@Args('input') input: RegisterInput): Promise<AuthPayloadType> {
    return this.auth.register(input);
  }

  @Mutation(() => AuthPayloadType)
  login(@Args('input') input: LoginInput): Promise<AuthPayloadType> {
    return this.auth.login(input);
  }
}

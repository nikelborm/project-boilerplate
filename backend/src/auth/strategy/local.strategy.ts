import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { messages } from 'src/config';
import { DI_UserRepo } from 'src/infrastructure';
import type { AccessTokenUserInfoDTO } from 'src/types';
import { DI_AuthTokenPairUseCase } from '../di';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    private readonly authTokenPairUseCase: DI_AuthTokenPairUseCase,
    private readonly userRepo: DI_UserRepo,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
      session: false,
    });
  }

  async validate(
    email: string,
    password: string,
  ): Promise<AccessTokenUserInfoDTO> {
    const userModel =
      await this.userRepo.findOneByEmailWithAccessScopesAndPasswordHash(email);

    if (!userModel)
      throw new UnauthorizedException(messages.auth.incorrectUser);

    this.authTokenPairUseCase.validateLoginAttempt(userModel, password);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, salt, ...authInfo } = userModel;
    return authInfo;
  }
}

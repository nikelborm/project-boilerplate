import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { messages } from 'src/config';
import { repo } from 'src/modules/infrastructure';
import { UserAuthInfo } from 'src/types';
import { AuthUseCase } from '../services';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authUseCase: AuthUseCase,
    private readonly userRepo: repo.UserRepo,
  ) {
    super({
      usernameField: 'email',
      passwordField: 'password',
      session: false,
    });
  }

  async validate(email: string, password: string): Promise<UserAuthInfo> {
    const userModel =
      await this.userRepo.findOneByEmailWithAccessScopesAndPasswordHash(email);

    if (!userModel)
      throw new UnauthorizedException(messages.auth.incorrectUser);

    await this.authUseCase.validateLoginAttempt(userModel, password);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { passwordHash, salt, ...authInfo } = userModel;
    return authInfo;
  }
}

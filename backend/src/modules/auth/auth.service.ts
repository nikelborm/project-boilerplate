import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { model, repo } from '../infrastructure';
import { UserAuthInfo, UserAuthTokenPayload } from './';
import { createHash, timingSafeEqual } from 'crypto';
import { ConfigService } from '@nestjs/config';
import { messages } from 'src/config';
import { ConfigKeys, IAppConfigMap } from 'src/types';

@Injectable()
export class AuthService {
  private JWT_SECRET: string;
  private USER_PASSWORD_HASH_SALT: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly userRepo: repo.UserRepo,
    private readonly configService: ConfigService<IAppConfigMap, true>,
  ) {
    this.JWT_SECRET = this.configService.get(ConfigKeys.JWT_SECRET);

    this.USER_PASSWORD_HASH_SALT = this.configService.get(
      ConfigKeys.USER_PASSWORD_HASH_SALT,
    );
  }

  async validateUser(
    userModel: model.User | null,
    password: string,
  ): Promise<UserWithoutSensitiveData> {
    if (!userModel)
      throw new UnauthorizedException(messages.auth.incorrectUser);

    const { passwordHash, salt, ...user } = userModel;

    const isPasswordCorrect = timingSafeEqual(
      Buffer.from(passwordHash, 'hex'),
      createHash('sha256')
        .update(salt)
        .update(password)
        .update(this.USER_PASSWORD_HASH_SALT)
        .digest(),
    );

    if (!isPasswordCorrect)
      throw new UnauthorizedException(messages.auth.incorrectPassword);

    if (!userModel.accessScopes.length)
      throw new UnauthorizedException(messages.auth.userHasNoAccessScopes);

    return user;
  }

  getUserAuthTokenPayload(user: UserWithoutSensitiveData) {
    const payload: UserAuthTokenPayload = {
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
    return payload;
  }

  async getAccessToken(user: UserWithoutSensitiveData) {
    const userFromDatabase = await this.userRepo.getOneByIdWithAccessScopes(
      user.id,
    );
    return this.jwtService.sign(this.getUserAuthTokenPayload(userFromDatabase));
  }

  async verify(authHeader: string | undefined) {
    if (!authHeader)
      throw new UnauthorizedException(messages.auth.missingAuthHeader);

    const [type, token] = authHeader.split(' ');
    if (type !== 'Bearer')
      throw new UnauthorizedException(messages.auth.incorrectTokenType);
    if (!token) throw new UnauthorizedException(messages.auth.missingToken);

    try {
      this.jwtService.verify(token, {
        secret: this.JWT_SECRET,
        ignoreExpiration: false,
      });
    } catch (error) {
      throw new UnauthorizedException(messages.auth.invalidToken);
    }
    const { user } = this.jwtService.decode(token) as UserAuthTokenPayload;
    const userModel: UserAuthInfo =
      await this.userRepo.getOneByIdWithAccessScopes(user.id);

    return userModel;
  }
}

export type UserWithoutSensitiveData = Omit<
  model.User,
  'passwordHash' | 'salt'
>;

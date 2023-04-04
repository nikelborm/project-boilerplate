import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import type { VerifyCallback } from 'passport-google-oauth20';
import { Strategy } from 'passport-google-oauth20';
import type { ISecretConfigMap } from 'src/config';
import { ConfigKeys, DI_TypedConfigService } from 'src/config';
import { DI_UserRepo } from 'src/infrastructure';
import { DI_AuthTokenPairUseCase } from '../di';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private readonly authTokenPairUseCase: DI_AuthTokenPairUseCase,
    private readonly userRepo: DI_UserRepo,
    configService: DI_TypedConfigService<ISecretConfigMap>,
  ) {
    const { web: OAuth } = configService.get(
      ConfigKeys.GOOGLE_OAUTH_TOKEN_SECRET,
    );
    super({
      clientID: OAuth.client_id,
      clientSecret: OAuth.client_secret,
      callbackURL: OAuth.redirect_uris[0],
      scope: ['email', 'profile', 'openid'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    { name, emails, photos, id }: GoogleProfile,
    done: VerifyCallback,
  ): Promise<void> {
    console.log('authTokenPairUseCase: ', this.authTokenPairUseCase);
    const email = emails[0]?.value;
    const wasEmailVerified = emails[0]?.verified;
    if (!email)
      throw new InternalServerErrorException("Google didn't provide email ");

    if (!wasEmailVerified)
      throw new InternalServerErrorException(
        'Google email account was not verified',
      );

    const userFromDB = await this.userRepo.getOneByEmailWithAccessScopes(email);
    console.log('userFromDB: ', userFromDB);

    done(null, {
      id,
      email: emails[0]?.value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0]?.value,
      accessToken,
    });
  }
}

interface GoogleProfile {
  id: string;
  displayName: string | undefined;
  name: { familyName: string | undefined; givenName: string | undefined };
  emails: { value: string; verified: boolean }[];
  photos: {
    value: string;
  }[];
  provider: 'google';
}

import { Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { type CookieOptions, Request, Response } from 'express';

import type { IAppInitConfigMap } from 'src/config';
import { ConfigKeys, DI_TypedConfigService } from 'src/config';
import { ApiController, GoodRefreshTokenOnly, ValidatedBody } from 'src/tools';
import {
  AuthorizedRequest,
  CreateUserRequestDTO,
  LoginUserRequestDTO,
  RefreshTokenPairRequestDTO,
  RequestWithValidRefreshToken,
} from 'src/types';
import type { AuthTokenPairDTO, EmptyResponseDTO } from 'src/types';

import { DI_AuthTokenPairUseCase } from './di';
import { LocalAuthGuard } from './guards';

@ApiController('auth')
export class AuthController {
  tokenCookieConfig: CookieOptions;

  public constructor(
    private readonly authTokenPairUseCase: DI_AuthTokenPairUseCase,
    configService: DI_TypedConfigService<IAppInitConfigMap>,
  ) {
    this.tokenCookieConfig = configService.get(
      ConfigKeys.TOKEN_PAIR_COOKIE_CONFIG,
    );
  }

  @Post('local/login')
  @UseGuards(LocalAuthGuard)
  public async login(
    // this argument was left here for documentation generation
    // the real processing of this handled by passport local strategy
    @ValidatedBody()
    loginUserRequestDTO: LoginUserRequestDTO,
    @Req() req: AuthorizedRequest,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokenPairDTO> {
    const tokenPair = await this.authTokenPairUseCase.login(req.user);

    this.#setAuthCookies(res, tokenPair);

    return tokenPair;
  }

  @Post('local/register')
  public async register(
    @ValidatedBody()
    createUserDTO: CreateUserRequestDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokenPairDTO> {
    const tokenPair = await this.authTokenPairUseCase.registerNewUserAndLogin(
      createUserDTO,
    );

    this.#setAuthCookies(res, tokenPair);

    return tokenPair;
  }

  @Get('google/login')
  @UseGuards(AuthGuard('google'))
  public async googleAuth(@Req() req: Request): Promise<void> {
    console.log('req.user:', req.user);
    await Promise.resolve();
  }

  @Get('google/loginCallback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: AuthorizedRequest,
    @Res() res: Response,
  ): Promise<void> {
    console.log('req.user:', req.user);
    await Promise.resolve();

    res
      .set('Content-Type', 'text/html')
      .status(200)
      .send(
        Buffer.from(
          '<!DOCTYPE html><html lang="en"><head></head><body> <script> document.addEventListener("DOMContentLoaded", () => { self.close(); }) </script></body></html>',
        ),
      );
  }

  @Post('logout')
  @GoodRefreshTokenOnly()
  async logout(
    @Req() { user, sessionUUID }: RequestWithValidRefreshToken,
    @Res({ passthrough: true }) res: Response,
  ): Promise<EmptyResponseDTO> {
    await this.authTokenPairUseCase.finishSessionOfAnyUser(
      user.id,
      sessionUUID,
    );

    this.#clearAuthCookies(res);

    return {};
  }

  @Post('logoutAllSessions')
  @GoodRefreshTokenOnly()
  public async logoutAllSessions(
    @Req() { user }: RequestWithValidRefreshToken,
    @Res({ passthrough: true }) res: Response,
  ): Promise<EmptyResponseDTO> {
    await this.authTokenPairUseCase.finishAllSessionsOfAnyUser(user.id);

    this.#clearAuthCookies(res);

    return {};
  }

  @Post('refreshTokenPairFromHttpBody')
  public async refreshTokenPairTakenFromHttpBody(
    @ValidatedBody()
    { refreshToken }: RefreshTokenPairRequestDTO,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthTokenPairDTO> {
    const tokenPair =
      await this.authTokenPairUseCase.useRefreshTokenAndGetNewTokenPair(
        refreshToken,
      );

    this.#setAuthCookies(res, tokenPair);

    return tokenPair;
  }

  @Post('refreshTokenPairFromCookies')
  @GoodRefreshTokenOnly()
  public async refreshTokenPairTakenFromCookies(
    @Req()
    { user, sessionUUID }: RequestWithValidRefreshToken,
    @Res({
      passthrough: true,
    })
    res: Response,
  ): Promise<AuthTokenPairDTO> {
    const tokenPair =
      await this.authTokenPairUseCase.useRefreshTokenPayloadAndGetNewTokenPair({
        user,
        sessionUUID,
      });

    this.#setAuthCookies(res, tokenPair);

    return tokenPair;
  }

  #setAuthCookies(res: Response, tokenPair: AuthTokenPairDTO): void {
    res.cookie('accessToken', tokenPair.accessToken, this.tokenCookieConfig);
    res.cookie('refreshToken', tokenPair.refreshToken, this.tokenCookieConfig);
  }

  #clearAuthCookies(res: Response): void {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
  }
}

import { Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiController, AuthorizedOnly, ValidatedBody } from 'src/tools';
import {
  AuthedRequest,
  CreateUserDTO,
  EmptyResponseDTO,
  RefreshTokenDTO,
  UserAuthInfo,
  TokenPairDTO,
} from 'src/types';
import { AuthUseCase } from './services';
import { LocalAuthGuard } from './guards';

@ApiController('auth')
export class AuthController {
  constructor(private readonly authUseCase: AuthUseCase) {}

  @Post('local/login')
  @UseGuards(LocalAuthGuard)
  async login(
    // leave here for documentation generation
    @Query('email') email: string,
    @Query('password') password: string,
    @Request() req: { user: UserAuthInfo },
  ): Promise<TokenPairDTO> {
    return await this.authUseCase.login(req.user);
  }

  @Post('local/register')
  async register(
    @ValidatedBody
    createUserDTO: CreateUserDTO,
  ): Promise<TokenPairDTO> {
    return await this.authUseCase.registerNewUserAndLogin(createUserDTO);
  }

  @Post('logout')
  @AuthorizedOnly()
  async logout(
    @Request() { user, sessionUUID }: AuthedRequest,
  ): Promise<EmptyResponseDTO> {
    await this.authUseCase.logoutSessionOf(user.id, sessionUUID);
    return {};
  }

  @Post('logoutAllSessions')
  @AuthorizedOnly()
  async logoutAllSessions(
    @Request() { user }: AuthedRequest,
  ): Promise<EmptyResponseDTO> {
    await this.authUseCase.logoutAllSessions(user.id);
    return {};
  }

  @Post('refresh')
  async refreshTokens(
    @ValidatedBody
    { refreshToken }: RefreshTokenDTO,
  ): Promise<TokenPairDTO> {
    return await this.authUseCase.useRefreshTokenAndGetNewTokenPair(
      refreshToken,
    );
  }
}

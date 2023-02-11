import { Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiController, AuthorizedOnly, ValidatedBody } from 'src/tools';
import {
  AuthedRequest,
  AuthTokenPairDTO,
  CreateUserDTO,
  EmptyResponseDTO,
  RefreshTokenDTO,
  RegisterUserResponseDTO,
  UserAuthInfo,
} from 'src/types';
import { LocalAuthGuard } from './guards';
import { AuthUseCase } from './services';

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
  ): Promise<AuthTokenPairDTO> {
    return await this.authUseCase.login(req.user);
  }

  @Post('local/register')
  async register(
    @ValidatedBody
    createUserDTO: CreateUserDTO,
  ): Promise<RegisterUserResponseDTO> {
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
  ): Promise<AuthTokenPairDTO> {
    return await this.authUseCase.useRefreshTokenAndGetNewTokenPair(
      refreshToken,
    );
  }
}

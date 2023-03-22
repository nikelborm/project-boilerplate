import { Post, Request, UseGuards } from '@nestjs/common';
import { ApiController, AuthorizedOnly, ValidatedBody } from 'src/tools';
import {
  AuthedRequest,
  AuthTokenPairDTO,
  CreateUserRequestDTO,
  EmptyResponseDTO,
  LoginUserRequestDTO,
  RefreshTokenDTO,
  RegisterUserResponseDTO,
  UserAuthInfo,
} from 'src/types';
import { DI_AuthUseCase } from './di';
import { LocalAuthGuard } from './guards';

@ApiController('auth')
export class AuthController {
  constructor(private readonly authUseCase: DI_AuthUseCase) {}

  @Post('local/login')
  @UseGuards(LocalAuthGuard)
  async login(
    // this argument was left here for documentation generation
    // the real processing of this handled by passport local strategy
    @ValidatedBody()
    loginUserRequestDTO: LoginUserRequestDTO,
    @Request() req: { user: UserAuthInfo },
  ): Promise<AuthTokenPairDTO> {
    return await this.authUseCase.login(req.user);
  }

  @Post('local/register')
  async register(
    @ValidatedBody()
    createUserDTO: CreateUserRequestDTO,
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
    @ValidatedBody()
    { refreshToken }: RefreshTokenDTO,
  ): Promise<AuthTokenPairDTO> {
    return await this.authUseCase.useRefreshTokenAndGetNewTokenPair(
      refreshToken,
    );
  }
}

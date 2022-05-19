import { Controller, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthorizedOnly, ValidatedBody } from 'src/tools';
import {
  AuthedRequest,
  CreateUserDTO,
  EmptyResponseDTO,
  RefreshTokenDTO,
  UserAuthInfo,
} from 'src/types';
import { AuthUseCase } from './services';
import { TokenPairDTO } from './types';
import { LocalAuthGuard } from './guards';

@ApiTags('auth')
@Controller('auth')
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
    return { response: {} };
  }

  @Post('logoutAllSessions')
  @AuthorizedOnly()
  async logoutAllSessions(
    @Request() { user }: AuthedRequest,
  ): Promise<EmptyResponseDTO> {
    await this.authUseCase.logoutAllSessions(user.id);
    return { response: {} };
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

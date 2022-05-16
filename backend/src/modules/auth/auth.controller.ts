import { Controller, Post, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthorizedOnly, ValidatedBody } from 'src/tools';
import {
  AuthedRequest,
  CreateUserDTO,
  EmptyResponseDTO,
  UserAuthInfo,
} from 'src/types';
import { AuthUseCase, RefreshTokenUseCase } from './services';
import { TokenPairDTO } from './types';
import { LocalAuthGuard } from './guards';
import { UserUseCase } from '../user';

@ApiTags('auth')
@Controller('/auth')
export class AuthController {
  constructor(
    private readonly authUseCase: AuthUseCase,
    private readonly refreshTokenUseCase: RefreshTokenUseCase,
    private readonly userUseCase: UserUseCase,
  ) {}

  @Post('/local/login')
  @UseGuards(LocalAuthGuard)
  async login(
    // leave here for documentation generation
    @Query('email') email: string,
    @Query('password') password: string,
    @Request() req: { user: UserAuthInfo },
  ): Promise<TokenPairDTO> {
    return await this.authUseCase.getAccessAndRefreshToken(req.user);
  }

  @Post('/local/register')
  async register(
    @ValidatedBody
    { firstName, lastName, email, password }: CreateUserDTO,
  ): Promise<TokenPairDTO> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { salt, passwordHash, ...user } = await this.userUseCase.createUser({
      firstName,
      lastName,
      email,
      password,
      accessScopes: [],
    });
    return await this.authUseCase.getAccessAndRefreshToken(user);
  }

  @Post('/logout')
  @AuthorizedOnly()
  async logout(
    @Request() { user, sessionUUID }: AuthedRequest,
  ): Promise<EmptyResponseDTO> {
    await this.authUseCase.logoutSessionOf(user.id, sessionUUID);
    return { response: {} };
  }

  @Post('/logoutAllSessions')
  @AuthorizedOnly()
  async logoutAllSessions(
    @Request() { user }: AuthedRequest,
  ): Promise<EmptyResponseDTO> {
    await this.authUseCase.logoutAllSessions(user.id);
    return { response: {} };
  }

  @Post('/refresh')
  @AuthorizedOnly()
  async refreshTokens(
    @Request() { user, sessionUUID }: AuthedRequest,
  ): Promise<EmptyResponseDTO> {
    this.refreshTokenUseCase.getRefreshTokenPayload(user, sessionUUID); // TODO: change
    return { response: {} };
  }
}

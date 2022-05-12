import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthorizedOnly } from '.';
import { AuthService } from './services';
import { AuthedRequest, UserWithoutSensitiveData } from './types';
import { LocalAuthGuard } from './guards';

@ApiTags('auth')
@Controller('/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('/login')
  @UseGuards(LocalAuthGuard)
  async login(
    @Request() req: { user: UserWithoutSensitiveData },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Query('email') email: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Query('password') password: string,
  ): Promise<{ access_token: string }> {
    return {
      access_token: await this.authService.getAccessToken(req.user),
    };
  }

  @Get('/me')
  @AuthorizedOnly()
  async getMe(@Request() { user }: AuthedRequest) {
    // TODO add a response dto here
    const payload = this.authService.getUserAuthTokenPayload(
      user as UserWithoutSensitiveData,
    );
    return {
      response: {
        user: payload.user,
      },
    };
  }
}

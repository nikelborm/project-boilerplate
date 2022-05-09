import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthedRequest, AuthorizedOnly } from '.';
import { AuthService, UserWithoutSensitiveData } from './auth.service';
import { LocalAuthGuard } from './guards/localAuth.guard';

@ApiTags('auth')
@Controller('/api/auth')
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

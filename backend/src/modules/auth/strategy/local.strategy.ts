import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { repo } from 'src/modules/infrastructure';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private readonly userRepo: repo.UserRepo,
  ) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string) {
    const userModel =
      await this.userRepo.findOneByEmailWithAccessScopesAndPassword(email);
    return this.authService.validateUser(userModel, password);
  }
}

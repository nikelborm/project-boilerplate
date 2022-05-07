import { Module } from '@nestjs/common';
import { UserUseCase } from './user.useCase';

@Module({
  providers: [UserUseCase],
  exports: [UserUseCase],
})
export class UserModule {}

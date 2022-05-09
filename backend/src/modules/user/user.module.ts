import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserUseCase } from './user.useCase';

@Module({
  providers: [UserUseCase],
  controllers: [UserController],
  exports: [UserUseCase],
})
export class UserModule {}

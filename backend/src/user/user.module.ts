import { Module } from '@nestjs/common';
import { DI_UserUseCase } from './di';
import { UserController } from './user.controller';
import { UserUseCaseDIProvider } from './user.useCase';

@Module({
  providers: [UserUseCaseDIProvider],
  controllers: [UserController],
  exports: [DI_UserUseCase],
})
export class UserModule {}

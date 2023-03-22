import { Test, TestingModule } from '@nestjs/testing';
import { InfrastructureModule } from 'src';
import { TypedConfigModule } from 'src/config';
import { UserController } from '../user.controller';
import { UserUseCaseDIProvider } from '../user.useCase';

describe('UserController', () => {
  let controller: UserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserUseCaseDIProvider],
      controllers: [UserController],
      imports: [InfrastructureModule, TypedConfigModule],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

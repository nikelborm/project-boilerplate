import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { messages } from 'src/config';
import { createManyPlain, createOneWithRelations } from 'src/tools';
import { Repository } from 'typeorm';
import { DataValidator } from '../model';

@Injectable()
export class DataValidatorRepo {
  constructor(
    @InjectRepository(DataValidator)
    private readonly repo: Repository<DataValidator>,
  ) {}

  getAll() {
    return this.repo.find();
  }

  async getOneByUUID(uuid: string) {
    const dataValidator = await this.repo.findOne({
      where: { uuid },
    });
    if (!dataValidator)
      throw new BadRequestException(
        messages.repo.common.cantGetNotFoundByUUID('dataValidator', uuid),
      );
    return dataValidator;
  }

  createOneWithRelations(newDataValidator: NewDataValidator) {
    return createOneWithRelations<any>(
      this.repo,
      newDataValidator,
      'dataValidator',
    );
  }

  createManyPlain(newDataValidators: NewDataValidator[]) {
    return createManyPlain<any>(this.repo, newDataValidators, 'dataValidator');
  }

  async delete(id: number) {
    await this.repo.delete(id);
  }
}

type NewDataValidator = {
  uuid: string;
  name: string;
};

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { messages } from 'src/config';
import {
  createManyPlain,
  createOneWithRelations,
  NewEntity,
  PlainEntityWithoutId,
  UpdatedEntity,
  updateOnePlain,
  updateOneWithRelations,
} from 'src/tools';
import { EntityManager, Repository } from 'typeorm';
import { ParameterToEventAssociation } from '../model';

@Injectable()
export class ParameterToEventAssociationRepo {
  constructor(
    @InjectRepository(ParameterToEventAssociation)
    private readonly repo: Repository<ParameterToEventAssociation>,
  ) {}

  getAll() {
    return this.repo.find();
  }

  async getOneById(id: number) {
    const parameterToEventAssociation = await this.repo.findOne({
      where: { id },
    });
    if (!parameterToEventAssociation)
      throw new BadRequestException(
        messages.repo.common.cantGetNotFoundById(
          id,
          'parameterToEventAssociation',
        ),
      );
    return parameterToEventAssociation;
  }

  createOneWithRelations(
    newParameterToEventAssociation: NewEntity<ParameterToEventAssociation>,
  ) {
    return createOneWithRelations(
      this.repo,
      newParameterToEventAssociation,
      'parameterToEventAssociation',
    );
  }

  createManyPlainInTransaction(
    newParameterToEventAssociations: PlainEntityWithoutId<ParameterToEventAssociation>[],
    transactionManager: EntityManager,
  ) {
    return this._createManyPlain(
      newParameterToEventAssociations,
      transactionManager.getRepository(ParameterToEventAssociation),
    );
  }

  private _createManyPlain(
    newParameterToEventAssociations: PlainEntityWithoutId<ParameterToEventAssociation>[],
    overrideRepo?: Repository<ParameterToEventAssociation>,
  ) {
    return createManyPlain(
      overrideRepo || this.repo,
      newParameterToEventAssociations,
      'parameterToEventAssociation',
    );
  }

  updateOnePlain(
    id: number,
    updated: PlainEntityWithoutId<ParameterToEventAssociation>,
  ) {
    return updateOnePlain(
      this.repo,
      id,
      updated,
      'parameterToEventAssociation',
    );
  }

  updateOneWithRelations(
    newParameterToEventAssociation: UpdatedEntity<ParameterToEventAssociation>,
  ) {
    return updateOneWithRelations(
      this.repo,
      newParameterToEventAssociation,
      'parameterToEventAssociation',
    );
  }

  async delete(id: number) {
    await this.repo.delete(id);
  }
}

import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { messages } from 'src/config';
import type { EndpointToUseAsSource } from 'src/modules/messages';
import {
  createManyPlain,
  PlainEntityWithoutId,
  UpdatedEntity,
  updateOnePlain,
  updateOneWithRelations,
} from 'src/tools';
import { EntityManager, Repository } from 'typeorm';
import { Endpoint } from '../model';

@Injectable()
export class EndpointRepo {
  constructor(
    @InjectRepository(Endpoint)
    private readonly repo: Repository<Endpoint>,
  ) {}

  getAll() {
    return this.repo.find();
  }

  async getOneById(id: number) {
    const endpoint = await this.repo.findOne({
      where: { id },
    });
    if (!endpoint)
      throw new BadRequestException(
        messages.repo.common.cantGetNotFoundById(id, 'endpoint'),
      );
    return endpoint;
  }

  async getOneByUUID(uuid: string) {
    const endpoint = await this.repo.findOne({
      where: {
        uuid,
      },
      select: {
        id: true,
        uuid: true,
        type: true,
        event: {
          id: true,
          uuid: true,
          type: true,
          parameterAssociations: {
            id: true,
            eventParameter: {
              id: true,
              uuid: true,
              dataValidatorUUID: true,
            },
            isParameterRequired: true,
          },
        },
      },
      relations: {
        event: {
          parameterAssociations: {
            eventParameter: true,
          },
        },
      },
    });
    if (!endpoint)
      throw new BadRequestException(
        messages.repo.common.cantGetNotFoundByUUID('endpoint', uuid),
      );
    return endpoint as EndpointToUseAsSource;
  }

  async getManyWithOnlyUUIDsByClientUUID(clientUUID: string) {
    const endpoints = await this.repo.find({
      select: {
        uuid: true,
      },
      relations: {
        client: true,
      },
      where: {
        client: {
          uuid: clientUUID,
        },
      },
    });
    return endpoints;
  }

  createManyPlainInTransaction(
    newEndpoints: PlainEntityWithoutId<Endpoint>[],
    transactionManager: EntityManager,
  ) {
    return this._createManyPlain(
      newEndpoints,
      transactionManager.getRepository(Endpoint),
    );
  }

  private _createManyPlain(
    newEndpoints: PlainEntityWithoutId<Endpoint>[],
    overrideRepo?: Repository<Endpoint>,
  ) {
    return createManyPlain(overrideRepo || this.repo, newEndpoints, 'endpoint');
  }

  updateOnePlain(id: number, updated: PlainEntityWithoutId<Endpoint>) {
    return updateOnePlain(this.repo, id, updated, 'endpoint');
  }

  updateOneWithRelations(newEndpoint: UpdatedEntity<Endpoint>) {
    return updateOneWithRelations(this.repo, newEndpoint, 'endpoint');
  }

  async delete(id: number) {
    await this.repo.delete(id);
  }
}

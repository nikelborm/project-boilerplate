import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { messages } from 'src/config';
import {
  createManyWithRelations,
  createOneWithRelations,
  NewEntity,
  PlainEntityWithoutId,
  UpdatedEntity,
  updateOnePlain,
  updateOneWithRelations,
} from 'src/tools';
import { EntityManager, Repository } from 'typeorm';
import { Client } from '../model';

@Injectable()
export class ClientRepo {
  constructor(
    @InjectRepository(Client)
    private readonly repo: Repository<Client>,
  ) {}

  getAll() {
    return this.repo.find();
  }

  async getOneById(id: number) {
    const client = await this.repo.findOne({
      where: { id },
    });
    if (!client)
      throw new BadRequestException(
        messages.repo.common.cantGetNotFoundById(id, 'client'),
      );
    return client;
  }

  async getOneWithInfoAboutSupportedStuffBy(uuid: string) {
    const client = await this.repo.findOne({
      where: { uuid },
      select: {
        id: true,
        encryptionWorkerUUID: true,
        endpoints: {
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
      },
      relations: {
        endpoints: {
          event: {
            parameterAssociations: {
              eventParameter: true,
            },
          },
        },
      },
    });
    if (!client)
      throw new BadRequestException(
        messages.repo.common.cantGetNotFoundByUUID('client', uuid),
      );
    client.uuid = uuid;
    return client;
  }

  async createOneInTransactionWithRelations(
    newClient: NewEntity<Client>,
    transactionManager: EntityManager,
  ) {
    return this._createOneWithRelations(
      newClient,
      transactionManager.getRepository(Client),
    );
  }

  private async _createOneWithRelations(
    newClient: NewEntity<Client>,
    overrideRepo?: Repository<Client>,
  ) {
    return createOneWithRelations(
      overrideRepo || this.repo,
      newClient,
      'client',
    );
  }

  createManyWithRelations(newClients: NewEntity<Client>[]) {
    return createManyWithRelations(this.repo, newClients, 'client');
  }

  updateOnePlain(id: number, updated: PlainEntityWithoutId<Client>) {
    return updateOnePlain(this.repo, id, updated, 'client');
  }

  updateOneWithRelations(newClient: UpdatedEntity<Client>) {
    return updateOneWithRelations(this.repo, newClient, 'client');
  }

  async delete(id: number) {
    await this.repo.delete(id);
  }
}

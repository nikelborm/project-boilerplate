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
import { EventParameter } from '../model';

@Injectable()
export class EventParameterRepo {
  constructor(
    @InjectRepository(EventParameter)
    private readonly repo: Repository<EventParameter>,
  ) {}

  getAll() {
    return this.repo.find();
  }

  async getOneById(id: number) {
    const eventParameter = await this.repo.findOne({
      where: { id },
    });
    if (!eventParameter)
      throw new BadRequestException(
        messages.repo.common.cantGetNotFoundById(id, 'eventParameter'),
      );
    return eventParameter;
  }

  getInTransactionWithIdsBy(
    uuids: string[],
    transactionManager: EntityManager,
  ) {
    return this._getWithIdsBy(
      uuids,
      transactionManager.getRepository(EventParameter),
    );
  }

  private async _getWithIdsBy(
    uuids: string[],
    overrideRepo?: Repository<EventParameter>,
  ) {
    const eventParameters = await (overrideRepo || this.repo).find({
      where: uuids.map((uuid) => ({ uuid })),
      select: {
        id: true,
        uuid: true,
      },
    });
    return eventParameters;
  }

  insertInTransactionOnlyNewEventParameters(
    newEventParameters: NewEntity<EventParameter>[],
    transactionManager: EntityManager,
  ) {
    return this._insertOnlyNewEventParameters(
      newEventParameters,
      transactionManager.getRepository(EventParameter),
    );
  }

  private async _insertOnlyNewEventParameters(
    newEventParameters: NewEntity<EventParameter>[],
    overrideRepo?: Repository<EventParameter>,
  ) {
    return await (overrideRepo || this.repo)
      .createQueryBuilder()
      .insert()
      .values(newEventParameters)
      .orIgnore()
      .returning(['id', 'uuid'])
      .execute();
    // .query(
    //   `INSERT INTO "account_group"("name", "rollupNodeId", "departmentId", "businessUnitId")
    //   VALUES($1, $2, $3, $4)
    //   ON CONFLICT ("rollupNodeId", "departmentId", "businessUnitId", "rollupId")
    //   DO UPDATE SET "deletedAt" = NULL, "name" = EXCLUDED.name;
    // `,
    //   [
    //     newAccountGroup.name,
    //     newAccountGroup.rollupNode.id,
    //     newAccountGroup.departmentId,
    //     newAccountGroup.businessUnitId,
    //   ],
    // );
  }

  createOneWithRelations(newEventParameter: NewEntity<EventParameter>) {
    return createOneWithRelations(
      this.repo,
      newEventParameter,
      'eventParameter',
    );
  }

  createManyWithRelations(newEventParameters: NewEntity<EventParameter>[]) {
    return createManyWithRelations(
      this.repo,
      newEventParameters,
      'eventParameter',
    );
  }

  updateOnePlain(id: number, updated: PlainEntityWithoutId<EventParameter>) {
    return updateOnePlain(this.repo, id, updated, 'eventParameter');
  }

  updateOneWithRelations(newEventParameter: UpdatedEntity<EventParameter>) {
    return updateOneWithRelations(
      this.repo,
      newEventParameter,
      'eventParameter',
    );
  }

  async delete(id: number) {
    await this.repo.delete(id);
  }
}

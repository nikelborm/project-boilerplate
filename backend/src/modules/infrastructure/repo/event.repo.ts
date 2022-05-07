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
import { Event } from '../model';

@Injectable()
export class EventRepo {
  constructor(
    @InjectRepository(Event)
    private readonly repo: Repository<Event>,
  ) {}

  getAll() {
    return this.repo.find();
  }

  getInTransactionWithIdsBy(
    uuids: string[],
    transactionManager: EntityManager,
  ) {
    return this._getWithIdsBy(uuids, transactionManager.getRepository(Event));
  }

  private async _getWithIdsBy(
    uuids: string[],
    overrideRepo?: Repository<Event>,
  ) {
    const events = await (overrideRepo || this.repo).find({
      where: uuids.map((uuid) => ({ uuid })),
    });
    return events;
  }

  async getOneById(id: number) {
    const event = await this.repo.findOne({
      where: { id },
    });
    if (!event)
      throw new BadRequestException(
        messages.repo.common.cantGetNotFoundById(id, 'event'),
      );
    return event;
  }

  createOneWithRelations(newEvent: NewEntity<Event>) {
    return createOneWithRelations(this.repo, newEvent, 'event');
  }

  insertInTransactionOnlyNewEvents(
    newEvents: NewEntity<Event>[],
    transactionManager: EntityManager,
  ) {
    return this._insertOnlyNewEvents(
      newEvents,
      transactionManager.getRepository(Event),
    );
  }

  private async _insertOnlyNewEvents(
    newEvents: NewEntity<Event>[],
    overrideRepo?: Repository<Event>,
  ) {
    return await (overrideRepo || this.repo)
      .createQueryBuilder()
      .insert()
      .values(newEvents)
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

  createManyWithRelations(
    newEvents: NewEntity<Event>[],
    overrideRepo?: Repository<Event>,
  ) {
    return createManyWithRelations(
      overrideRepo || this.repo,
      newEvents,
      'event',
    );
  }

  updateOnePlain(id: number, updated: PlainEntityWithoutId<Event>) {
    return updateOnePlain(this.repo, id, updated, 'event');
  }

  updateOneWithRelations(newEvent: UpdatedEntity<Event>) {
    return updateOneWithRelations(this.repo, newEvent, 'event');
  }

  async delete(id: number) {
    await this.repo.delete(id);
  }
}

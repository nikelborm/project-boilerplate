import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { messages } from 'src/config';
import {
  createManyWithRelations,
  createOnePlain,
  createOneWithRelations,
  NewEntity,
  PlainEntityWithoutId,
  UpdatedEntity,
  updateOnePlain,
  updateOneWithRelations,
} from 'src/tools';
import { Repository } from 'typeorm';
import { Route } from '../model';

@Injectable()
export class RouteRepo {
  constructor(
    @InjectRepository(Route)
    private readonly repo: Repository<Route>,
  ) {}

  getAll() {
    return this.repo.find();
  }

  async getOneById(id: number) {
    const route = await this.repo.findOne({
      where: { id },
    });
    if (!route)
      throw new BadRequestException(
        messages.repo.common.cantGetNotFoundById(id, 'route'),
      );
    return route;
  }

  async getManyRoutesBy({
    sinkEndpointId,
    sourceEndpointId,
  }: {
    sourceEndpointId?: number;
    sinkEndpointId?: number;
  }) {
    console.log('getManyRoutesBy');
    const routes = await this.repo.find({
      where: {
        ...(sourceEndpointId && { sourceEndpointId }),
        ...(sinkEndpointId && { sinkEndpointId }),
      },
      select: {
        sinkEndpoint: {
          uuid: true,
          clientId: true,
        },
        sourceEndpoint: {
          uuid: true,
          clientId: true,
        },
      },
      relations: {
        sourceEndpoint: true,
        sinkEndpoint: true,
      },
    });
    return routes;
  }

  async getManyRoutesComingFrom(clientId: number) {
    const routes = await this.repo.find({
      where: {
        sourceEndpoint: {
          clientId,
        },
      },
      select: {
        sourceEndpoint: {
          uuid: true,
          clientId: true,
        },
      },
      relations: {
        sinkEndpoint: true,
      },
    });
    return routes;
  }

  createOnePlain(newRoute: PlainEntityWithoutId<Route>) {
    return createOnePlain(this.repo, newRoute, 'route');
  }

  createOneWithRelations(newRoute: NewEntity<Route>) {
    return createOneWithRelations(this.repo, newRoute, 'route');
  }

  createManyWithRelations(newRoutes: NewEntity<Route>[]) {
    return createManyWithRelations(this.repo, newRoutes, 'route');
  }

  updateOnePlain(id: number, updated: PlainEntityWithoutId<Route>) {
    return updateOnePlain(this.repo, id, updated, 'route');
  }

  updateOneWithRelations(newRoute: UpdatedEntity<Route>) {
    return updateOneWithRelations(this.repo, newRoute, 'route');
  }

  async delete(id: number) {
    await this.repo.delete(id);
  }
}

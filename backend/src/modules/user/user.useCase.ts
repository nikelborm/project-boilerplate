import { Injectable } from '@nestjs/common';
import { repo } from '../infrastructure';

@Injectable()
export class UserUseCase {
  constructor(private readonly routeRepo: repo.RouteRepo) {}
}

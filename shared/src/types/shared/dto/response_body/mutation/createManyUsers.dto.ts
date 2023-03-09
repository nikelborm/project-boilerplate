import type { CreateOneUserResponse } from './createOneUser.dto';

export class CreateManyUsersResponseDTO {
  responses!: CreateOneUserResponse[];
}

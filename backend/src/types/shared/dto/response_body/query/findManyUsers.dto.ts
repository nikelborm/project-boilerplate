/* eslint-disable max-classes-per-file */
export class UserFromFindManyUsersResponseDTO {
  id!: number;

  firstName!: string;

  lastName!: string;

  patronymic!: string;

  gender!: string;

  email!: string;

  phone?: string;

  createdAt!: Date;

  updatedAt?: Date;
}

export class FindManyUsersResponseDTO {
  users!: UserFromFindManyUsersResponseDTO[];
}

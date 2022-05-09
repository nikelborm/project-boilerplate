export class UserFromFindManyUsersResponseDTO {
  id!: number;
  firstName!: string;
  lastName!: string;
  email!: string;
}

export class FindManyUsersResponseDTO {
  response!: {
    users: UserFromFindManyUsersResponseDTO[];
  };
}

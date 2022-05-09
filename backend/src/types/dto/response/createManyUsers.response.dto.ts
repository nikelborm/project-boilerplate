export class IUser {
  id!: number;
  firstName!: string;
  lastName!: string;
  email!: string;
  salt!: string;
  passwordHash!: string;
}

export class CreateManyUsersResponseDTO {
  response!: {
    users: IUser[];
  };
}

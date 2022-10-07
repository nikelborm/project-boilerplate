export class ClearedInsertedUserDTO implements Omit<InputUser, 'password'> {
  id!: number;
  firstName!: string;
  lastName!: string;
  patronymic!: string;
  canCreateEducationalSpaces!: boolean;
  gender!: string;
  email!: string;
}

export interface InputUser {
  firstName: string;
  lastName: string;
  patronymic: string;
  gender: string;
  canCreateEducationalSpaces: boolean;
  email: string;
  password: string;
}

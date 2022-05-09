export class CreateOneUserResponse {
  response!: {
    user: {
      firstName: string;
      lastName: string;
      email: string;
      accessScopes?: any[];
      salt: string;
      passwordHash: string;
      id: number;
    };
  };
}

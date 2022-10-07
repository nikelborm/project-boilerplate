import { IsPositive } from 'class-validator';

export class DeleteEntityByIdDTO {
  @IsPositive()
  id!: number;
}

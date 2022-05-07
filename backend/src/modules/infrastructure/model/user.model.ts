import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  id!: number;

  @Column({
    name: 'user_fullname',
    nullable: false,
  })
  fullname!: string;

  @CreateDateColumn({
    type: 'timestamptz',
    nullable: false,
    name: 'user_created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    name: 'user_updated_at',
  })
  updatedAt!: Date;
  // TODO: configuration?????
}

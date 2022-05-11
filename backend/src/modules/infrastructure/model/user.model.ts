import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { AccessScope, UserToAccessScope } from './';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  id!: number;

  @Column({
    name: 'user_first_name',
    nullable: false,
  })
  firstName!: string;

  @Column({
    name: 'user_last_name',
    nullable: false,
  })
  lastName!: string;

  @Column({
    name: 'user_email',
    nullable: false,
    unique: true,
  })
  email!: string;

  @Column({
    name: 'user_salt',
    select: false,
    nullable: false,
  })
  salt!: string;

  @Column({
    name: 'user_password_hash',
    select: false,
    nullable: false,
  })
  passwordHash!: string;

  @ManyToMany(
    () => AccessScope,
    (accessScope) => accessScope.usersWithThatAccessScope,
  )
  @JoinTable({
    name: 'user_to_access_scope',
    joinColumn: { name: 'user_id' },
    inverseJoinColumn: { name: 'access_scope_id' },
  })
  accessScopes!: AccessScope[];

  @OneToMany(
    () => UserToAccessScope,
    (userToAccessScope) => userToAccessScope.user,
  )
  userToAccessScopeRelations!: UserToAccessScope[];

  @CreateDateColumn({
    name: 'user_created_at',
    type: 'timestamptz',
    nullable: false,
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'user_updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;
}

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AccessScope, UserToAccessScope } from '.';

@Entity({ name: 'user' })
export class User {
  @PrimaryGeneratedColumn({ name: 'user_id' })
  id!: number;

  @Column({
    name: 'first_name',
    nullable: false,
  })
  firstName!: string;

  @Column({
    name: 'last_name',
    nullable: false,
  })
  lastName!: string;

  @Column({
    name: 'email',
    nullable: false,
    unique: true,
  })
  email!: string;

  @Column({
    name: 'salt',
    select: false,
    nullable: false,
  })
  salt!: string;

  @Column({
    name: 'password_hash',
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

  @Column({
    name: 'patronymic',
    nullable: false,
  })
  patronymic!: string;

  @Column({
    name: 'gender',
    nullable: false,
  })
  gender!: string;

  @Column({
    name: 'phone',
    type: 'varchar',
    length: 15,
    nullable: true,
  })
  phone?: string;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamptz',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamptz',
  })
  updatedAt!: Date;
}

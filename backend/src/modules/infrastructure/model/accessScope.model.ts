import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AccessScopeType } from 'src/types';
import { User, UserToAccessScope } from '.';

@Entity({ name: 'access_scope' })
export class AccessScope {
  @PrimaryGeneratedColumn({ name: 'access_scope_id' })
  id!: number;

  @Column({
    name: 'access_scope_type',
    type: 'enum',
    enum: AccessScopeType,
    nullable: false,
  })
  type!: AccessScopeType;

  @ManyToMany(() => User, (user) => user.accessScopes)
  usersWithThatAccessScope!: User[];

  @OneToMany(
    () => UserToAccessScope,
    (userToAccessScope) => userToAccessScope.accessScope,
  )
  userToAccessScopeRelations!: UserToAccessScope[];

  @CreateDateColumn({
    name: 'access_scope_created_at',
    type: 'timestamptz',
    nullable: false,
  })
  createdAt!: Date;

  @UpdateDateColumn({
    name: 'access_scope_updated_at',
    type: 'timestamptz',
    nullable: true,
  })
  updatedAt!: Date;
}

import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  OneToMany,
  JoinTable,
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
  @JoinTable({
    name: 'user_to_access_scope',
    joinColumn: {
      name: 'user',
      referencedColumnName: 'user_id',
    },
    inverseJoinColumn: {
      name: 'access_scope',
      referencedColumnName: 'access_scope_id',
    },
  })
  usersWithThatAccessScope!: User[];

  @OneToMany(
    () => UserToAccessScope,
    (userToAccessScope) => userToAccessScope.accessScope,
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
    nullable: true,
  })
  updatedAt!: Date;
}

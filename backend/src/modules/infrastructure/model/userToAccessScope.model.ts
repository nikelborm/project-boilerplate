import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AccessScope, User } from '.';

@Entity({ name: 'user_to_access_scope' })
export class UserToAccessScope {
  @ManyToOne(() => User, (user) => user.userToAccessScopeRelations, {
    nullable: false,
  })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({
    name: 'user_id',
    primary: true,
    nullable: false,
  })
  userId!: number;

  @ManyToOne(
    () => AccessScope,
    (accessScope) => accessScope.userToAccessScopeRelations,
    { nullable: false },
  )
  @JoinColumn({ name: 'access_scope_id' })
  accessScope!: AccessScope;

  @Column({
    name: 'access_scope_id',
    primary: true,
    nullable: false,
  })
  accessScopeId!: number;
}

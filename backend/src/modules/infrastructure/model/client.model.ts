import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EncryptionWorkerCredentialsStoredInDB } from 'src/types';
import { Endpoint, EncryptionWorker } from '.';

@Entity({ name: 'client' })
export class Client {
  @PrimaryGeneratedColumn({ name: 'client_id' })
  id!: number;

  @Column({
    name: 'client_uuid',
    type: 'uuid',
    nullable: false,
    unique: true,
  })
  uuid!: string;

  @Column({
    name: 'client_shortname',
    nullable: false,
  })
  shortname!: string;

  @Column({
    name: 'client_shortname_alias',
    nullable: true,
  })
  shortnameAlias?: string;

  @Column({
    name: 'client_fullname',
    nullable: false,
  })
  fullname!: string;

  @Column({
    name: 'client_fullname_alias',
    nullable: true,
  })
  fullnameAlias?: string;

  @Column({
    name: 'client_description',
    nullable: false,
  })
  description!: string;

  @Column({
    name: 'client_description_alias',
    nullable: true,
  })
  descriptionAlias?: string;

  @Column({
    type: 'timestamptz',
    nullable: false,
    name: 'client_was_last_active_at',
    default: 'now()',
  })
  wasLastActiveAt!: Date;

  @ManyToOne(
    () => EncryptionWorker,
    (encryptionWorker) => encryptionWorker.clients,
    { nullable: false },
  )
  @JoinColumn({ name: 'encryption_worker_uuid' })
  encryptionWorker!: EncryptionWorker;

  @Column({
    name: 'encryption_worker_uuid',
    nullable: false,
    type: 'uuid',
  })
  encryptionWorkerUUID!: string;

  @Column({
    name: 'client_encryption_credentials',
    nullable: false,
    type: 'jsonb',
  })
  encryptionWorkerCredentials!: EncryptionWorkerCredentialsStoredInDB;

  @OneToMany(() => Endpoint, (endpoint) => endpoint.client)
  endpoints!: Endpoint[];

  @CreateDateColumn({
    type: 'timestamptz',
    nullable: false,
    name: 'client_created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    name: 'client_updated_at',
  })
  updatedAt!: Date;
  // TODO: configuration?????
}

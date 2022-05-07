import {
  Entity,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EventParameter } from '.';

@Entity({ name: 'data_validator' })
export class DataValidator {
  @Column({
    name: 'data_validator_uuid',
    type: 'uuid',
    nullable: false,
    primary: true,
  })
  uuid!: string;

  @Column({
    name: 'data_validator_name',
    nullable: false,
  })
  name!: string;

  @OneToMany(
    () => EventParameter,
    (eventParameter) => eventParameter.dataValidator,
  )
  eventParameters!: EventParameter[];

  @CreateDateColumn({
    type: 'timestamptz',
    nullable: false,
    name: 'data_validator_created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    name: 'data_validator_updated_at',
  })
  updatedAt!: Date;
}

// По умолчанию будут включены следующие валидаторы данных

// float: aae1f077-aeeb-4e84-8e9e-5c0e402e8af9
// integer: 00db2932-12b8-415f-b5f2-9f6f6f8d8d06
// date: 17a8cf06-0490-4326-941b-660d56de4e73
// json: e9693774-a2d1-450a-b293-e77298e47bad

// Также производители могут загружать свои кастомные валидаторы данных
// тем самым например создавая свои типы данных аля enum или другие даже вложенные структуры

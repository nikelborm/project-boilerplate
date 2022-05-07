import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ParameterToEventAssociation, DataValidator } from './';

@Entity({ name: 'event_parameter' })
export class EventParameter {
  @PrimaryGeneratedColumn({ name: 'event_parameter_id' })
  id!: number;

  @Column({
    name: 'event_parameter_uuid',
    type: 'uuid',
    nullable: false,
    unique: true,
  })
  uuid!: string;

  @Column({
    name: 'event_parameter_name',
    nullable: false,
  })
  name!: string;

  @Column({
    name: 'event_parameter_name_alias',
    nullable: true,
  })
  nameAlias?: string;

  @ManyToOne(
    () => DataValidator,
    (dataValidator) => dataValidator.eventParameters,
    { nullable: false },
  )
  @JoinColumn({ name: 'data_validator_uuid' })
  dataValidator!: DataValidator;

  @Column({
    nullable: false,
    type: 'uuid',
    name: 'data_validator_uuid',
  })
  dataValidatorUUID!: string;

  @OneToMany(
    () => ParameterToEventAssociation,
    (parameterAssociation) => parameterAssociation.eventParameter,
  )
  eventAssociations!: ParameterToEventAssociation[];

  @Column({
    nullable: false,
    name: 'event_parameter_measurement_unit',
  })
  measurementUnit!: string;

  @CreateDateColumn({
    type: 'timestamptz',
    nullable: false,
    name: 'event_parameter_created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    name: 'event_parameter_updated_at',
  })
  updatedAt!: Date;
}

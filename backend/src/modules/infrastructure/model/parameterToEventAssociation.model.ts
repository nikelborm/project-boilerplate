import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  Index,
  Unique,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EventParameter, Event } from '.';

@Entity({ name: 'parameter_to_event_association' })
@Index(['eventParameterId', 'eventId'], { unique: true })
@Unique(['eventParameterId', 'eventId'])
export class ParameterToEventAssociation {
  @PrimaryGeneratedColumn({ name: 'parameter_to_event_association_id' })
  id!: number;

  @ManyToOne(
    () => EventParameter,
    (eventParameter) => eventParameter.eventAssociations,
    { nullable: false },
  )
  @JoinColumn({ name: 'event_parameter_id' })
  eventParameter!: EventParameter;

  @Column({
    nullable: false,
    name: 'event_parameter_id',
  })
  eventParameterId!: number;

  @ManyToOne(() => Event, (event) => event.parameterAssociations, {
    nullable: false,
  })
  @JoinColumn({ name: 'event_id' })
  event!: Event;

  @Column({
    nullable: false,
    name: 'event_id',
  })
  eventId!: number;

  @Column({
    nullable: false,
    name: 'is_parameter_required_for_event',
  })
  isParameterRequired!: boolean;

  @CreateDateColumn({
    type: 'timestamptz',
    nullable: false,
    name: 'parameter_to_event_association_created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    name: 'parameter_to_event_association_updated_at',
  })
  updatedAt!: Date;
}

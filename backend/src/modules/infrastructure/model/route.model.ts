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
import { Endpoint } from './';

@Entity({ name: 'route' })
@Index(['sourceEndpointId', 'sinkEndpointId'], { unique: true })
@Unique(['sourceEndpointId', 'sinkEndpointId'])
export class Route {
  @PrimaryGeneratedColumn({ name: 'route_id' })
  id!: number;

  @ManyToOne(() => Endpoint, (endpoint) => endpoint.outcomingRoutes, {
    nullable: false,
  })
  @JoinColumn({ name: 'source_endpoint_id' })
  sourceEndpoint!: Endpoint;

  @Column({
    nullable: false,
    name: 'source_endpoint_id',
  })
  sourceEndpointId!: number;

  @ManyToOne(() => Endpoint, (endpoint) => endpoint.incomingRoutes, {
    nullable: false,
  })
  @JoinColumn({ name: 'sink_endpoint_id' })
  sinkEndpoint!: Endpoint;

  @Column({
    nullable: false,
    name: 'sink_endpoint_id',
  })
  sinkEndpointId!: number;

  @CreateDateColumn({
    type: 'timestamptz',
    nullable: false,
    name: 'route_created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamptz',
    name: 'route_updated_at',
  })
  updatedAt!: Date;
}

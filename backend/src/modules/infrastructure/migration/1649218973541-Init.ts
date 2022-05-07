import { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1649218973541 implements MigrationInterface {
  name = 'Init1649218973541';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "data_validator" (
        "data_validator_uuid" uuid NOT NULL,
        "data_validator_name" character varying NOT NULL,
        "data_validator_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "data_validator_updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_09e69c49c12702f1dfc4a03412b" PRIMARY KEY ("data_validator_uuid")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "encryption_worker" (
        "encryption_worker_uuid" uuid NOT NULL,
        "encryption_worker_name" character varying NOT NULL,
        "encryption_worker_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "encryption_worker_updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_c7453dcae1c2001eb83a6e7db18" PRIMARY KEY ("encryption_worker_uuid")
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."endpoint_endpoint_type_enum" AS ENUM('eventSource', 'eventSink', 'universalSink')
    `);
    await queryRunner.query(`
      CREATE TABLE "endpoint" (
        "endpoint_id" SERIAL NOT NULL,
        "endpoint_uuid" uuid NOT NULL,
        "endpoint_name" character varying NOT NULL,
        "endpoint_name_alias" character varying,
        "endpoint_shortcode" character varying(4) NOT NULL,
        "endpoint_description" character varying NOT NULL,
        "endpoint_description_alias" character varying,
        "event_id" integer,
        "client_id" integer NOT NULL,
        "endpoint_type" "public"."endpoint_endpoint_type_enum" NOT NULL,
        "endpoint_hex_color" character(6) NOT NULL,
        "endpoint_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "endpoint_updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_9a2de9047b18c06c18fb8c36a38" UNIQUE ("endpoint_uuid"),
        CONSTRAINT "UQ_81d3d5eb8cd31fc7ab912d5ee39" UNIQUE ("client_id", "endpoint_name"),
        CONSTRAINT "UQ_6d5348e37d3ff8b80e49f6e8804" UNIQUE ("client_id", "endpoint_shortcode"),
        CONSTRAINT "CHK_ad7e53cbb2b4c4de3f376fd908" CHECK (
          (
            endpoint_type <> 'universalSink'
            AND event_id is not null
          )
          OR (
            endpoint_type = 'universalSink'
            AND event_id is null
          )
        ),
        CONSTRAINT "PK_b2b02791966766a03a316b583d9" PRIMARY KEY ("endpoint_id")
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."event_event_type_enum" AS ENUM('command', 'log', 'query', 'error')
    `);
    await queryRunner.query(`
      CREATE TABLE "event" (
        "event_id" SERIAL NOT NULL,
        "event_uuid" uuid NOT NULL,
        "event_name" character varying NOT NULL,
        "event_name_alias" character varying,
        "event_description" character varying NOT NULL,
        "event_description_alias" character varying,
        "event_type" "public"."event_event_type_enum" NOT NULL,
        "event_hex_color" character(6) NOT NULL,
        "event_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "event_updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_b30b2ed258a19ed7368c92849fb" UNIQUE ("event_uuid"),
        CONSTRAINT "PK_fe0840e4557d98ed53b0ae51466" PRIMARY KEY ("event_id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "event_parameter" (
        "event_parameter_id" SERIAL NOT NULL,
        "event_parameter_uuid" uuid NOT NULL,
        "event_parameter_name" character varying NOT NULL,
        "event_parameter_name_alias" character varying,
        "data_validator_uuid" uuid NOT NULL,
        "event_parameter_measurement_unit" character varying NOT NULL,
        "event_parameter_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "event_parameter_updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_e05ff8b95a30bd41beadc2e6477" UNIQUE ("event_parameter_uuid"),
        CONSTRAINT "PK_89e853344fedede4a20c728d848" PRIMARY KEY ("event_parameter_id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "parameter_to_event_association" (
        "parameter_to_event_association_id" SERIAL NOT NULL,
        "event_parameter_id" integer NOT NULL,
        "event_id" integer NOT NULL,
        "is_parameter_required_for_event" boolean NOT NULL,
        "parameter_to_event_association_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "parameter_to_event_association_updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_6c12f8831d0c015d5870e01124a" UNIQUE ("event_parameter_id", "event_id"),
        CONSTRAINT "PK_d2090084e29bc889e27003858bf" PRIMARY KEY ("parameter_to_event_association_id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_6c12f8831d0c015d5870e01124" ON "parameter_to_event_association" ("event_parameter_id", "event_id")
    `);
    await queryRunner.query(`
      CREATE TABLE "route" (
        "route_id" SERIAL NOT NULL,
        "source_endpoint_id" integer NOT NULL,
        "sink_endpoint_id" integer NOT NULL,
        "route_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "route_updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_44b30a9863e98f0e33a9b289f3d" UNIQUE ("source_endpoint_id", "sink_endpoint_id"),
        CONSTRAINT "PK_4e7fe1b2d0ef419d4ce018aa0b5" PRIMARY KEY ("route_id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_44b30a9863e98f0e33a9b289f3" ON "route" ("source_endpoint_id", "sink_endpoint_id")
    `);
    await queryRunner.query(`
      CREATE TABLE "client" (
        "client_id" SERIAL NOT NULL,
        "client_uuid" uuid NOT NULL,
        "client_shortname" character varying NOT NULL,
        "client_shortname_alias" character varying,
        "client_fullname" character varying NOT NULL,
        "client_fullname_alias" character varying,
        "client_description" character varying NOT NULL,
        "client_description_alias" character varying,
        "client_was_last_active_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT 'now()',
        "encryption_worker_uuid" uuid NOT NULL,
        "client_encryption_credentials" jsonb NOT NULL,
        "client_created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "client_updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_eda3a2175f92585f73102034683" UNIQUE ("client_uuid"),
        CONSTRAINT "PK_7510ce0a84bde51dbff978b4b49" PRIMARY KEY ("client_id")
      )
    `);
    await queryRunner.query(`
      ALTER TABLE "endpoint"
      ADD CONSTRAINT "FK_d7eaf082061e16e933604d7bb97" FOREIGN KEY ("event_id") REFERENCES "event"("event_id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "endpoint"
      ADD CONSTRAINT "FK_06c087987efc51ab13db8336000" FOREIGN KEY ("client_id") REFERENCES "client"("client_id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "event_parameter"
      ADD CONSTRAINT "FK_676452b8f2030f57a09026f0aeb" FOREIGN KEY ("data_validator_uuid") REFERENCES "data_validator"("data_validator_uuid") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "parameter_to_event_association"
      ADD CONSTRAINT "FK_d4b41b5f1b5e388733d7de36255" FOREIGN KEY ("event_parameter_id") REFERENCES "event_parameter"("event_parameter_id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "parameter_to_event_association"
      ADD CONSTRAINT "FK_e5f9a37e1ef6af48c46f9d80447" FOREIGN KEY ("event_id") REFERENCES "event"("event_id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "route"
      ADD CONSTRAINT "FK_ebb0e76ecfd4661e32cb1a0916d" FOREIGN KEY ("source_endpoint_id") REFERENCES "endpoint"("endpoint_id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "route"
      ADD CONSTRAINT "FK_8b945c4222359498a187243367b" FOREIGN KEY ("sink_endpoint_id") REFERENCES "endpoint"("endpoint_id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "client"
      ADD CONSTRAINT "FK_0f2df082753da875222377fe9bb" FOREIGN KEY ("encryption_worker_uuid") REFERENCES "encryption_worker"("encryption_worker_uuid") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "client" DROP CONSTRAINT "FK_0f2df082753da875222377fe9bb"
    `);
    await queryRunner.query(`
      ALTER TABLE "route" DROP CONSTRAINT "FK_8b945c4222359498a187243367b"
    `);
    await queryRunner.query(`
      ALTER TABLE "route" DROP CONSTRAINT "FK_ebb0e76ecfd4661e32cb1a0916d"
    `);
    await queryRunner.query(`
      ALTER TABLE "parameter_to_event_association" DROP CONSTRAINT "FK_e5f9a37e1ef6af48c46f9d80447"
    `);
    await queryRunner.query(`
      ALTER TABLE "parameter_to_event_association" DROP CONSTRAINT "FK_d4b41b5f1b5e388733d7de36255"
    `);
    await queryRunner.query(`
      ALTER TABLE "event_parameter" DROP CONSTRAINT "FK_676452b8f2030f57a09026f0aeb"
    `);
    await queryRunner.query(`
      ALTER TABLE "endpoint" DROP CONSTRAINT "FK_06c087987efc51ab13db8336000"
    `);
    await queryRunner.query(`
      ALTER TABLE "endpoint" DROP CONSTRAINT "FK_d7eaf082061e16e933604d7bb97"
    `);
    await queryRunner.query(`
      DROP TABLE "client"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."IDX_44b30a9863e98f0e33a9b289f3"
    `);
    await queryRunner.query(`
      DROP TABLE "route"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."IDX_6c12f8831d0c015d5870e01124"
    `);
    await queryRunner.query(`
      DROP TABLE "parameter_to_event_association"
    `);
    await queryRunner.query(`
      DROP TABLE "event_parameter"
    `);
    await queryRunner.query(`
      DROP TABLE "event"
    `);
    await queryRunner.query(`
      DROP TYPE "public"."event_event_type_enum"
    `);
    await queryRunner.query(`
      DROP TABLE "endpoint"
    `);
    await queryRunner.query(`
      DROP TYPE "public"."endpoint_endpoint_type_enum"
    `);
    await queryRunner.query(`
      DROP TABLE "encryption_worker"
    `);
    await queryRunner.query(`
      DROP TABLE "data_validator"
    `);
  }
}

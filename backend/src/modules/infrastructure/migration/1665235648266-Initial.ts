import { MigrationInterface, QueryRunner } from 'typeorm';

export class Initial1665235648266 implements MigrationInterface {
  name = 'Initial1665235648266';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "user" (
        "user_id" SERIAL NOT NULL,
        "first_name" character varying NOT NULL,
        "last_name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "salt" character varying NOT NULL,
        "password_hash" character varying NOT NULL,
        "patronymic" character varying NOT NULL,
        "gender" character varying NOT NULL,
        "phone" character varying(15),
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"),
        CONSTRAINT "PK_758b8ce7c18b9d347461b30228d" PRIMARY KEY ("user_id")
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "user_to_access_scope" (
        "user_id" integer NOT NULL,
        "access_scope_id" integer NOT NULL,
        CONSTRAINT "PK_f6326c8d048b48d6cc64b8e2e64" PRIMARY KEY ("user_id", "access_scope_id")
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."access_scope_type_enum" AS ENUM('superAdmin')
    `);
    await queryRunner.query(`
      CREATE TABLE "access_scope" (
        "access_scope_id" SERIAL NOT NULL,
        "type" "public"."access_scope_type_enum" NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_26acb7cf35e5f4a08a85d937b6e" PRIMARY KEY ("access_scope_id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_e507f0edbfbe11f2552fe977fc" ON "user_to_access_scope" ("user_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_25a021e06c12cff03ca9414964" ON "user_to_access_scope" ("access_scope_id")
    `);
    await queryRunner.query(`
      ALTER TABLE "user_to_access_scope"
      ADD CONSTRAINT "FK_e507f0edbfbe11f2552fe977fc3" FOREIGN KEY ("user_id") REFERENCES "user"("user_id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "user_to_access_scope"
      ADD CONSTRAINT "FK_25a021e06c12cff03ca94149649" FOREIGN KEY ("access_scope_id") REFERENCES "access_scope"("access_scope_id") ON DELETE NO ACTION ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_to_access_scope" DROP CONSTRAINT "FK_25a021e06c12cff03ca94149649"
    `);
    await queryRunner.query(`
      ALTER TABLE "user_to_access_scope" DROP CONSTRAINT "FK_e507f0edbfbe11f2552fe977fc3"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."IDX_25a021e06c12cff03ca9414964"
    `);
    await queryRunner.query(`
      DROP INDEX "public"."IDX_e507f0edbfbe11f2552fe977fc"
    `);
    await queryRunner.query(`
      DROP TABLE "access_scope"
    `);
    await queryRunner.query(`
      DROP TYPE "public"."access_scope_type_enum"
    `);
    await queryRunner.query(`
      DROP TABLE "user_to_access_scope"
    `);
    await queryRunner.query(`
      DROP TABLE "user"
    `);
  }
}

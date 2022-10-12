import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddedAdminAccessScope1665292748450 implements MigrationInterface {
  name = 'AddedAdminAccessScope1665292748450';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "public"."access_scope_type_enum"
      RENAME TO "access_scope_type_enum_old"
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."access_scope_type_enum" AS ENUM('superAdmin', 'admin')
    `);
    await queryRunner.query(`
      ALTER TABLE "access_scope"
      ALTER COLUMN "type" TYPE "public"."access_scope_type_enum" USING "type"::"text"::"public"."access_scope_type_enum"
    `);
    await queryRunner.query(`
      DROP TYPE "public"."access_scope_type_enum_old"
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "public"."access_scope_type_enum_old" AS ENUM('superAdmin')
    `);
    await queryRunner.query(`
      ALTER TABLE "access_scope"
      ALTER COLUMN "type" TYPE "public"."access_scope_type_enum_old" USING "type"::"text"::"public"."access_scope_type_enum_old"
    `);
    await queryRunner.query(`
      DROP TYPE "public"."access_scope_type_enum"
    `);
    await queryRunner.query(`
      ALTER TYPE "public"."access_scope_type_enum_old"
      RENAME TO "access_scope_type_enum"
    `);
  }
}

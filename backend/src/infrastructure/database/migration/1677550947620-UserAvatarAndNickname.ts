import type { MigrationInterface, QueryRunner } from 'typeorm';

export class UserAvatarAndNickname1677550947620 implements MigrationInterface {
  name = 'UserAvatarAndNickname1677550947620';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD "nickname" character varying NOT NULL
    `);
    await queryRunner.query(`
      ALTER TABLE "user"
      ADD "avatar_url" character varying
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user" DROP COLUMN "avatar_url"
    `);
    await queryRunner.query(`
      ALTER TABLE "user" DROP COLUMN "nickname"
    `);
  }
}

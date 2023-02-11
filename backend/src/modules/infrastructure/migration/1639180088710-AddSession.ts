import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSession1639180088710 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "session" (
        "sid" character varying NOT NULL,
        "sess" jsonb NOT NULL,
        "expire" TIMESTAMP NOT NULL,
        CONSTRAINT "PK_7575923e18b495ed2307ae629ae" PRIMARY KEY ("sid")
      )`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "session"`);
  }
}

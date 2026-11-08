import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkshops1762560000000 implements MigrationInterface {
  name = 'AddWorkshops1762560000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE \`products\`
        ADD COLUMN \`product_type\` enum('physical','workshop') NOT NULL DEFAULT 'physical',
        ADD COLUMN \`duration_minutes\` int unsigned NULL,
        ADD COLUMN \`location\` varchar(255) NULL
    `);

    await queryRunner.query(`
      ALTER TABLE \`order_item\`
        ADD COLUMN \`workshop_session_id\` int NULL,
        ADD COLUMN \`session_starts_at\` datetime(6) NULL,
        ADD COLUMN \`session_duration_minutes\` int unsigned NULL,
        ADD COLUMN \`session_location\` varchar(255) NULL,
        ADD KEY \`IDX_order_item_workshop_session\` (\`workshop_session_id\`)
    `);

    await queryRunner.query(`
      CREATE TABLE \`workshop_sessions\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`workshop_id\` int NOT NULL,
        \`starts_at\` datetime(6) NOT NULL,
        \`capacity\` int unsigned NOT NULL,
        \`booked_count\` int unsigned NOT NULL DEFAULT '0',
        \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
        PRIMARY KEY (\`id\`),
        KEY \`IDX_workshop_sessions_workshop_starts_at\` (\`workshop_id\`, \`starts_at\`),
        CONSTRAINT \`FK_workshop_sessions_workshop\` FOREIGN KEY (\`workshop_id\`) REFERENCES \`products\` (\`id\`) ON DELETE CASCADE
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      CREATE TABLE \`workshop_reservations\` (
        \`id\` int NOT NULL AUTO_INCREMENT,
        \`order_item_id\` int NOT NULL,
        \`session_id\` int NOT NULL,
        \`participants\` int unsigned NOT NULL,
        \`starts_at\` datetime(6) NOT NULL,
        PRIMARY KEY (\`id\`),
        UNIQUE KEY \`IDX_workshop_reservation_order_item\` (\`order_item_id\`),
        KEY \`IDX_workshop_reservation_session\` (\`session_id\`),
        CONSTRAINT \`FK_workshop_reservation_order_item\` FOREIGN KEY (\`order_item_id\`) REFERENCES \`order_item\` (\`id\`) ON DELETE CASCADE,
        CONSTRAINT \`FK_workshop_reservation_session\` FOREIGN KEY (\`session_id\`) REFERENCES \`workshop_sessions\` (\`id\`) ON DELETE RESTRICT
      ) ENGINE=InnoDB
    `);

    await queryRunner.query(`
      ALTER TABLE \`order_item\`
        ADD CONSTRAINT \`FK_order_item_workshop_session\`
        FOREIGN KEY (\`workshop_session_id\`) REFERENCES \`workshop_sessions\` (\`id\`) ON DELETE RESTRICT
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE `workshop_reservations`');
    await queryRunner.query('ALTER TABLE `order_item` DROP FOREIGN KEY `FK_order_item_workshop_session`');
    await queryRunner.query('DROP TABLE `workshop_sessions`');
    await queryRunner.query(`
      ALTER TABLE \`order_item\`
        DROP COLUMN \`session_location\`,
        DROP COLUMN \`session_duration_minutes\`,
        DROP COLUMN \`session_starts_at\`,
        DROP COLUMN \`workshop_session_id\`
    `);
    await queryRunner.query(`
      ALTER TABLE \`products\`
        DROP COLUMN \`location\`,
        DROP COLUMN \`duration_minutes\`,
        DROP COLUMN \`product_type\`
    `);
  }
}

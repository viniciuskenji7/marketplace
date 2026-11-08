import type { MigrationInterface, QueryRunner } from 'typeorm';

export class Init1700000000000 implements MigrationInterface {
  name = 'Init1700000000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('products'))) {
      await queryRunner.query(`
        CREATE TABLE \`products\` (
          \`id\` int NOT NULL AUTO_INCREMENT,
          \`name\` varchar(255) NOT NULL,
          \`description\` varchar(500) NOT NULL,
          \`image_url\` varchar(255) NOT NULL,
          \`stock\` int unsigned NOT NULL DEFAULT '0',
          \`is_active\` tinyint NOT NULL DEFAULT '1',
          \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
          \`price\` decimal(10,2) NOT NULL,
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB
      `);
    }

    if (!(await queryRunner.hasTable('order'))) {
      await queryRunner.query(`
        CREATE TABLE \`order\` (
          \`id\` varchar(36) NOT NULL,
          \`customer_name\` varchar(120) NOT NULL,
          \`customer_email\` varchar(255) NOT NULL,
          \`total_cents\` int unsigned NOT NULL,
          \`email_sent_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
          PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB
      `);
    }

    if (!(await queryRunner.hasTable('order_item'))) {
      await queryRunner.query(`
        CREATE TABLE \`order_item\` (
          \`id\` int NOT NULL AUTO_INCREMENT,
          \`product_name\` varchar(120) NOT NULL,
          \`unit_price_cents\` int unsigned NOT NULL,
          \`quantity\` int unsigned NOT NULL,
          \`subtotal_cents\` int unsigned NOT NULL,
          \`order_id\` varchar(36) NOT NULL,
          \`product_id\` int NOT NULL,
          PRIMARY KEY (\`id\`),
          KEY \`FK_e9674a6053adbaa1057848cddfa\` (\`order_id\`),
          KEY \`FK_5e17c017aa3f5164cb2da5b1c6b\` (\`product_id\`),
          CONSTRAINT \`FK_5e17c017aa3f5164cb2da5b1c6b\` FOREIGN KEY (\`product_id\`) REFERENCES \`products\` (\`id\`) ON DELETE RESTRICT,
          CONSTRAINT \`FK_e9674a6053adbaa1057848cddfa\` FOREIGN KEY (\`order_id\`) REFERENCES \`order\` (\`id\`) ON DELETE CASCADE
        ) ENGINE=InnoDB
      `);
    }
  }

  async down(): Promise<void> {
    throw new Error(
      'The initial schema migration cannot be reverted safely because it may baseline existing tables.',
    );
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1714330000000 implements MigrationInterface {
  name = 'InitSchema1714330000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');

    await queryRunner.query(`
      CREATE TABLE "products" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "name" character varying NOT NULL,
        "barcode" character varying(8) NOT NULL,
        "quantity" integer NOT NULL,
        "price" numeric(10,2) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_products_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_products_barcode" UNIQUE ("barcode")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "total" numeric(10,2) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_orders_id" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "quantity" integer NOT NULL,
        "price" numeric(10,2) NOT NULL,
        "product_id" uuid,
        "order_id" uuid,
        CONSTRAINT "PK_order_items_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_order_items_product_id" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_order_items_order_id" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION update_products_updated_at()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW."updatedAt" = now();
        RETURN NEW;
      END;
      $$ language 'plpgsql'
    `);

    await queryRunner.query(`
      CREATE TRIGGER trigger_products_updated_at
      BEFORE UPDATE ON "products"
      FOR EACH ROW
      EXECUTE PROCEDURE update_products_updated_at()
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      'DROP TRIGGER IF EXISTS trigger_products_updated_at ON "products"',
    );
    await queryRunner.query(
      'DROP FUNCTION IF EXISTS update_products_updated_at',
    );
    await queryRunner.query('DROP TABLE IF EXISTS "order_items"');
    await queryRunner.query('DROP TABLE IF EXISTS "orders"');
    await queryRunner.query('DROP TABLE IF EXISTS "products"');
  }
}

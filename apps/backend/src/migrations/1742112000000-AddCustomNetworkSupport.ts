/*
 *
 * Hedera Stablecoin SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCustomNetworkSupport1742112000000 implements MigrationInterface {
  name = 'AddCustomNetworkSupport1742112000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Convert network column from enum to varchar if it hasn't been already.
    // This is idempotent: if the column is already varchar, the block is skipped.
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM pg_type t
          JOIN pg_attribute a ON a.atttypid = t.oid
          JOIN pg_class c ON c.oid = a.attrelid
          WHERE c.relname = 'transaction'
            AND a.attname = 'network'
            AND t.typtype = 'e'
        ) THEN
          ALTER TABLE "transaction" ADD COLUMN "network_new" varchar;
          UPDATE "transaction" SET "network_new" = "network"::text;
          ALTER TABLE "transaction" DROP COLUMN "network";
          ALTER TABLE "transaction" RENAME COLUMN "network_new" TO "network";
          ALTER TABLE "transaction" ALTER COLUMN "network" SET NOT NULL;
          DROP TYPE IF EXISTS "public"."transaction_network_enum";
        END IF;
      END $$;
    `);

    // Add consensus_nodes column for custom network support.
    // IF NOT EXISTS makes this safe to run on DBs that already have the column.
    await queryRunner.query(`
      ALTER TABLE "transaction"
      ADD COLUMN IF NOT EXISTS "consensus_nodes" jsonb;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove consensus_nodes column
    await queryRunner.query(`
      ALTER TABLE "transaction" DROP COLUMN IF EXISTS "consensus_nodes";
    `);

    // Recreate the enum type and revert network column back to enum.
    // Rows with network='custom' will be deleted as they cannot be cast back.
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_type
          WHERE typname = 'transaction_network_enum'
        ) THEN
          CREATE TYPE "public"."transaction_network_enum"
            AS ENUM('mainnet', 'testnet', 'previewnet');
        END IF;
      END $$;
    `);

    await queryRunner.query(`
      DELETE FROM "transaction"
      WHERE "network" NOT IN ('mainnet', 'testnet', 'previewnet');
    `);

    await queryRunner.query(`
      ALTER TABLE "transaction"
        ADD COLUMN "network_old" "public"."transaction_network_enum";
    `);

    await queryRunner.query(`
      UPDATE "transaction"
        SET "network_old" = "network"::"public"."transaction_network_enum";
    `);

    await queryRunner.query(`
      ALTER TABLE "transaction" DROP COLUMN "network";
    `);

    await queryRunner.query(`
      ALTER TABLE "transaction" RENAME COLUMN "network_old" TO "network";
    `);

    await queryRunner.query(`
      ALTER TABLE "transaction" ALTER COLUMN "network" SET NOT NULL;
    `);
  }
}

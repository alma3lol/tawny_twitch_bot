/*
  Warnings:

  - You are about to drop the column `game_uuid` on the `Game` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Game` table. All the data in the column will be lost.
  - Added the required column `channel` to the `Game` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Game_game_uuid_key` ON `Game`;

-- AlterTable
ALTER TABLE `Game` DROP COLUMN `game_uuid`,
    DROP COLUMN `name`,
    ADD COLUMN `channel` VARCHAR(191) NOT NULL;

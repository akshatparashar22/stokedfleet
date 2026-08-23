/*
  Warnings:

  - You are about to drop the column `autoRefresh` on the `UserSettings` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "Theme" ADD VALUE 'SYSTEM';

-- AlterTable
ALTER TABLE "UserSettings" DROP COLUMN "autoRefresh",
ADD COLUMN     "autoRefreshAlerts" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "autoRefreshAnalytics" BOOLEAN NOT NULL DEFAULT true;

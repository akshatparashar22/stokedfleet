-- AlterTable
ALTER TABLE "UserSettings" ADD COLUMN     "widgets" JSONB DEFAULT '{"dashboard": {"showMap": true}}';

-- AlterTable
ALTER TABLE "Channel" ADD COLUMN     "lastTestAt" TIMESTAMP(3),
ADD COLUMN     "lastTestError" TEXT,
ADD COLUMN     "lastTestMs" INTEGER,
ADD COLUMN     "lastTestOk" BOOLEAN;

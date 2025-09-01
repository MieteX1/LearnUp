-- AlterTable
ALTER TABLE "User" ALTER COLUMN "last_activity" DROP DEFAULT;

-- CreateTable
CREATE TABLE "Activity_archive" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "createAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Activity_archive_pkey" PRIMARY KEY ("id")
);

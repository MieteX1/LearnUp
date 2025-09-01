/*
  Warnings:

  - You are about to drop the column `title` on the `Gap_option` table. All the data in the column will be lost.
  - You are about to drop the column `answer` on the `Task_open` table. All the data in the column will be lost.
  - Added the required column `category` to the `Card` table without a default value. This is not possible if the table is not empty.
  - Made the column `collection_id` on table `Card` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `position` to the `Gap_option` table without a default value. This is not possible if the table is not empty.
  - Added the required column `category` to the `Task_gap` table without a default value. This is not possible if the table is not empty.
  - Made the column `collection_id` on table `Task_gap` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `category` to the `Task_match` table without a default value. This is not possible if the table is not empty.
  - Made the column `collection_id` on table `Task_match` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `category` to the `Task_open` table without a default value. This is not possible if the table is not empty.
  - Made the column `collection_id` on table `Task_open` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `category` to the `Task_test` table without a default value. This is not possible if the table is not empty.
  - Made the column `collection_id` on table `Task_test` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('easy', 'medium', 'hard');

-- AlterTable
ALTER TABLE "Card" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "difficulty" "Difficulty" NOT NULL DEFAULT 'easy',
ADD COLUMN     "order" INTEGER DEFAULT 0,
ALTER COLUMN "collection_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "Gap_option" DROP COLUMN "title",
ADD COLUMN     "position" INTEGER NOT NULL,
ALTER COLUMN "answer" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Task_gap" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "difficulty" "Difficulty" NOT NULL DEFAULT 'easy',
ADD COLUMN     "order" INTEGER DEFAULT 0,
ALTER COLUMN "collection_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "Task_match" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "difficulty" "Difficulty" NOT NULL DEFAULT 'easy',
ADD COLUMN     "order" INTEGER DEFAULT 0,
ALTER COLUMN "collection_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "Task_open" DROP COLUMN "answer",
ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "difficulty" "Difficulty" NOT NULL DEFAULT 'easy',
ADD COLUMN     "order" INTEGER DEFAULT 0,
ALTER COLUMN "collection_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "Task_test" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "difficulty" "Difficulty" NOT NULL DEFAULT 'easy',
ADD COLUMN     "order" INTEGER DEFAULT 0,
ALTER COLUMN "collection_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "is_verified" BOOLEAN DEFAULT false;

-- CreateTable
CREATE TABLE "Subscription" (
    "id" SERIAL NOT NULL,
    "subscriber_id" INTEGER NOT NULL,
    "collection_id" INTEGER NOT NULL,
    "notification" BOOLEAN NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluation" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "collection_id" INTEGER NOT NULL,
    "comment" TEXT,
    "answer" INTEGER,
    "changed" BOOLEAN NOT NULL DEFAULT false,
    "points" INTEGER NOT NULL,
    "updated_at" TIMESTAMP(0) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluation_value" (
    "id" SERIAL NOT NULL,
    "evaluation_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "evaluator_id" INTEGER NOT NULL,
    "is_positive" BOOLEAN NOT NULL,

    CONSTRAINT "Evaluation_value_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer_test" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "answer_id" INTEGER NOT NULL,
    "test_id" INTEGER NOT NULL,

    CONSTRAINT "Answer_test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer_open" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "answer" TEXT NOT NULL,
    "open_id" INTEGER NOT NULL,

    CONSTRAINT "Answer_open_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer_gap" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "answer_id" INTEGER NOT NULL,
    "gap_id" INTEGER NOT NULL,

    CONSTRAINT "Answer_gap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer_match" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "answer_id" INTEGER NOT NULL,
    "match_id" INTEGER NOT NULL,

    CONSTRAINT "Answer_match_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "Task_collection"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Evaluation_value" ADD CONSTRAINT "Evaluation_value_evaluation_id_fkey" FOREIGN KEY ("evaluation_id") REFERENCES "Evaluation"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

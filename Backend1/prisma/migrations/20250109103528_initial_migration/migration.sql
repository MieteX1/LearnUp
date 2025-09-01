-- CreateEnum
CREATE TYPE "Role" AS ENUM ('admin', 'moderator', 'support', 'user', 'vip');

-- CreateEnum
CREATE TYPE "Difficulty" AS ENUM ('easy', 'medium', 'hard');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "login" TEXT,
    "password" TEXT,
    "profile_picture" TEXT,
    "email" TEXT NOT NULL,
    "last_activity" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "role" "Role" DEFAULT 'user',
    "ban_date" TIMESTAMP(3),
    "punishment" TIMESTAMP(3),
    "refresh_token" TEXT,
    "is_verified" BOOLEAN DEFAULT false,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task_collection" (
    "id" SERIAL NOT NULL,
    "author_id" INTEGER NOT NULL DEFAULT 1,
    "name" TEXT,
    "description" TEXT,
    "is_public" BOOLEAN,
    "type_id" INTEGER,
    "photo_id" INTEGER,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "Task_collection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task_open" (
    "id" SERIAL NOT NULL,
    "collection_id" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'easy',
    "order_" INTEGER DEFAULT 0,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Task_open_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task_test" (
    "id" SERIAL NOT NULL,
    "collection_id" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'easy',
    "order_" INTEGER DEFAULT 0,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "Task_test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Card" (
    "id" SERIAL NOT NULL,
    "collection_id" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'easy',
    "order_" INTEGER DEFAULT 0,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "side1" TEXT NOT NULL,
    "side2" TEXT NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task_match" (
    "id" SERIAL NOT NULL,
    "collection_id" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'easy',
    "order_" INTEGER DEFAULT 0,
    "description" TEXT,
    "name" TEXT NOT NULL,

    CONSTRAINT "Task_match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task_gap" (
    "id" SERIAL NOT NULL,
    "collection_id" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "difficulty" "Difficulty" NOT NULL DEFAULT 'easy',
    "order_" INTEGER DEFAULT 0,
    "description" TEXT,
    "name" TEXT NOT NULL,
    "text" TEXT,

    CONSTRAINT "Task_gap_pkey" PRIMARY KEY ("id")
);

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
    "updated_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Evaluation_value" (
    "id" SERIAL NOT NULL,
    "evaluation_id" INTEGER NOT NULL,
    "evaluator_id" INTEGER NOT NULL,
    "is_positive" BOOLEAN NOT NULL,

    CONSTRAINT "Evaluation_value_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection_rank" (
    "id" SERIAL NOT NULL,
    "collection_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,

    CONSTRAINT "Collection_rank_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer_test" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "collection_id" INTEGER NOT NULL,
    "option_id" INTEGER NOT NULL,
    "test_id" INTEGER NOT NULL,

    CONSTRAINT "Answer_test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer_open" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "collection_id" INTEGER NOT NULL,
    "answer" TEXT NOT NULL,
    "open_id" INTEGER NOT NULL,

    CONSTRAINT "Answer_open_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer_gap" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "collection_id" INTEGER NOT NULL,
    "answer" TEXT NOT NULL,
    "option_id" INTEGER NOT NULL,
    "gap_id" INTEGER NOT NULL,

    CONSTRAINT "Answer_gap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Answer_match" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "collection_id" INTEGER NOT NULL,
    "option_id" INTEGER NOT NULL,
    "match_id" INTEGER NOT NULL,

    CONSTRAINT "Answer_match_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "photo" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,

    CONSTRAINT "photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection_type" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Collection_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Test_option" (
    "id" SERIAL NOT NULL,
    "test_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "is_answer" BOOLEAN NOT NULL,

    CONSTRAINT "Test_option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match_option" (
    "id" SERIAL NOT NULL,
    "match_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "Match_option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gap_option" (
    "id" SERIAL NOT NULL,
    "gap_id" INTEGER NOT NULL,
    "answer" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "Gap_option_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Collection_complaint" (
    "id" SERIAL NOT NULL,
    "appliciant_id" INTEGER NOT NULL,
    "collection_id" INTEGER NOT NULL,
    "justification" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "solved_at" TIMESTAMP(3),

    CONSTRAINT "Collection_complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User_complaint" (
    "id" SERIAL NOT NULL,
    "appliciant_id" INTEGER NOT NULL,
    "disturber_id" INTEGER NOT NULL,
    "justification" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "solved_at" TIMESTAMP(3),

    CONSTRAINT "User_complaint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment_complaint" (
    "id" SERIAL NOT NULL,
    "appliciant_id" INTEGER NOT NULL,
    "evaluation_id" INTEGER NOT NULL,
    "justification" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "solved_at" TIMESTAMP(3),

    CONSTRAINT "Comment_complaint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Task_collection" ADD CONSTRAINT "Task_collection_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "User"("id") ON DELETE SET DEFAULT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Task_open" ADD CONSTRAINT "Task_open_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "Task_collection"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Task_test" ADD CONSTRAINT "Task_test_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "Task_collection"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Card" ADD CONSTRAINT "Card_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "Task_collection"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Task_match" ADD CONSTRAINT "Task_match_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "Task_collection"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Task_gap" ADD CONSTRAINT "Task_gap_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "Task_collection"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "Task_collection"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_subscriber_id_fkey" FOREIGN KEY ("subscriber_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Evaluation_value" ADD CONSTRAINT "Evaluation_value_evaluation_id_fkey" FOREIGN KEY ("evaluation_id") REFERENCES "Evaluation"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Collection_rank" ADD CONSTRAINT "Collection_rank_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Collection_rank" ADD CONSTRAINT "Collection_rank_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "Task_collection"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Answer_test" ADD CONSTRAINT "Answer_test_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "Task_collection"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Answer_open" ADD CONSTRAINT "Answer_open_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "Task_collection"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Answer_gap" ADD CONSTRAINT "Answer_gap_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "Task_collection"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Answer_match" ADD CONSTRAINT "Answer_match_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "Task_collection"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Test_option" ADD CONSTRAINT "Test_option_test_id_fkey" FOREIGN KEY ("test_id") REFERENCES "Task_test"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Match_option" ADD CONSTRAINT "Match_option_match_id_fkey" FOREIGN KEY ("match_id") REFERENCES "Task_match"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Gap_option" ADD CONSTRAINT "Gap_option_gap_id_fkey" FOREIGN KEY ("gap_id") REFERENCES "Task_gap"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Collection_complaint" ADD CONSTRAINT "Collection_complaint_collection_id_fkey" FOREIGN KEY ("collection_id") REFERENCES "Task_collection"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Collection_complaint" ADD CONSTRAINT "Collection_complaint_appliciant_id_fkey" FOREIGN KEY ("appliciant_id") REFERENCES "User"("id") ON DELETE SET DEFAULT ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "User_complaint" ADD CONSTRAINT "User_complaint_disturber_id_fkey" FOREIGN KEY ("disturber_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Comment_complaint" ADD CONSTRAINT "Comment_complaint_evaluation_id_fkey" FOREIGN KEY ("evaluation_id") REFERENCES "Evaluation"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "Comment_complaint" ADD CONSTRAINT "Comment_complaint_appliciant_id_fkey" FOREIGN KEY ("appliciant_id") REFERENCES "User"("id") ON DELETE SET DEFAULT ON UPDATE NO ACTION;

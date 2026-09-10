/*
  Warnings:

  - A unique constraint covering the columns `[userId,topicId]` on the table `Vote` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Vote_userId_groupId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Vote_userId_topicId_key" ON "Vote"("userId", "topicId");

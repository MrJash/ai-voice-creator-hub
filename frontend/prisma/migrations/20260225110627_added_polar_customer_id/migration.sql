/*
  Warnings:

  - A unique constraint covering the columns `[polarCustomerId]` on the table `user` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "user" ADD COLUMN     "polarCustomerId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "user_polarCustomerId_key" ON "user"("polarCustomerId");

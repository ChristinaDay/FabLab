-- AlterTable
ALTER TABLE "JobApplication" ALTER COLUMN "status" SET DEFAULT 'VIEWED';

-- CreateTable
CREATE TABLE "SearchResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "location" TEXT,
    "radius" INTEGER NOT NULL DEFAULT 25,
    "jobResults" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SearchResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobDetail" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "originalId" TEXT NOT NULL,
    "jobData" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SearchResult_userId_createdAt_idx" ON "SearchResult"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "SearchResult_expiresAt_idx" ON "SearchResult"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "JobDetail_jobId_key" ON "JobDetail"("jobId");

-- CreateIndex
CREATE INDEX "JobDetail_jobId_idx" ON "JobDetail"("jobId");

-- CreateIndex
CREATE INDEX "JobDetail_provider_originalId_idx" ON "JobDetail"("provider", "originalId");

-- CreateIndex
CREATE INDEX "JobDetail_expiresAt_idx" ON "JobDetail"("expiresAt");

-- AddForeignKey
ALTER TABLE "SearchResult" ADD CONSTRAINT "SearchResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

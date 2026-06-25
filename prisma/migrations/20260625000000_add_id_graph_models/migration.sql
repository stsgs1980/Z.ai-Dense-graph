-- CreateTable
CREATE TABLE "IdNode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "repo" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT '1.0',
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "level" TEXT,
    "filePath" TEXT,
    "owningStandard" TEXT,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "IdEdge" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sourceId" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "IdEdge_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "IdNode"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "IdEdge_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "IdNode"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "IdGraphSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "capturedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "platformTag" TEXT NOT NULL,
    "standardsSha" TEXT NOT NULL,
    "guardSha" TEXT NOT NULL,
    "skillsSha" TEXT NOT NULL,
    "countsJson" TEXT NOT NULL,
    "edgesJson" TEXT NOT NULL,
    "topHubsJson" TEXT NOT NULL,
    "isolatedJson" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "IdEdge_sourceId_targetId_type_key" ON "IdEdge"("sourceId", "targetId", "type");

-- CreateIndex
CREATE INDEX "IdEdge_sourceId_idx" ON "IdEdge"("sourceId");

-- CreateIndex
CREATE INDEX "IdEdge_targetId_idx" ON "IdEdge"("targetId");

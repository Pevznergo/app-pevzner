-- CreateTable
CREATE TABLE "ChannelTemplate" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "models" TEXT NOT NULL,
    "modelMapping" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Channel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "newapiId" INTEGER,
    "name" TEXT NOT NULL,
    "templateId" TEXT,
    "baseUrl" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "proxy" TEXT,
    "channelType" INTEGER NOT NULL DEFAULT 20,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Channel_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "ChannelTemplate" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AdminSetting" (
    "key" TEXT NOT NULL PRIMARY KEY,
    "value" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ChannelTemplate_name_key" ON "ChannelTemplate"("name");

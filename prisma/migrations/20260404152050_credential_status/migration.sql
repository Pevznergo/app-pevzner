-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PortalCredential" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "portal" TEXT NOT NULL,
    "portalLabel" TEXT,
    "username" TEXT NOT NULL,
    "passwordEnc" TEXT NOT NULL,
    "passwordIv" TEXT NOT NULL,
    "passwordTag" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PortalCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PortalCredential" ("createdAt", "id", "passwordEnc", "passwordIv", "passwordTag", "portal", "portalLabel", "userId", "username") SELECT "createdAt", "id", "passwordEnc", "passwordIv", "passwordTag", "portal", "portalLabel", "userId", "username" FROM "PortalCredential";
DROP TABLE "PortalCredential";
ALTER TABLE "new_PortalCredential" RENAME TO "PortalCredential";
CREATE UNIQUE INDEX "PortalCredential_userId_portal_key" ON "PortalCredential"("userId", "portal");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

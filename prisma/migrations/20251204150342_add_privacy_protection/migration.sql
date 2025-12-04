-- CreateTable
CREATE TABLE "PrivacyVerification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "verifyType" TEXT NOT NULL,
    "verifiedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL,
    "sessionId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PrivacyVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "enhancedPrivacyEnabled" BOOLEAN NOT NULL DEFAULT false,
    "privacyVerifyDuration" INTEGER NOT NULL DEFAULT 10
);
INSERT INTO "new_User" ("createdAt", "email", "emailVerified", "id", "image", "name", "twoFactorEnabled", "updatedAt") SELECT "createdAt", "email", "emailVerified", "id", "image", "name", "twoFactorEnabled", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "PrivacyVerification_userId_idx" ON "PrivacyVerification"("userId");

-- CreateIndex
CREATE INDEX "PrivacyVerification_expiresAt_idx" ON "PrivacyVerification"("expiresAt");

-- CreateIndex
CREATE INDEX "PrivacyVerification_sessionId_idx" ON "PrivacyVerification"("sessionId");

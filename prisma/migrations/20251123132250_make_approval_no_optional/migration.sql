-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Medicine" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "category" TEXT,
    "controlTypes" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "dosageUnit" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "quantityUnit" TEXT NOT NULL,
    "indications" TEXT,
    "usage" TEXT,
    "notes" TEXT,
    "expiryDate" DATETIME NOT NULL,
    "approvalNo" TEXT,
    "location" TEXT,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Medicine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Medicine" ("approvalNo", "brand", "category", "controlTypes", "createdAt", "dosage", "dosageUnit", "expiryDate", "id", "imageUrl", "indications", "location", "name", "notes", "quantity", "quantityUnit", "updatedAt", "usage", "userId") SELECT "approvalNo", "brand", "category", "controlTypes", "createdAt", "dosage", "dosageUnit", "expiryDate", "id", "imageUrl", "indications", "location", "name", "notes", "quantity", "quantityUnit", "updatedAt", "usage", "userId" FROM "Medicine";
DROP TABLE "Medicine";
ALTER TABLE "new_Medicine" RENAME TO "Medicine";
CREATE INDEX "Medicine_userId_idx" ON "Medicine"("userId");
CREATE INDEX "Medicine_expiryDate_idx" ON "Medicine"("expiryDate");
CREATE INDEX "Medicine_name_idx" ON "Medicine"("name");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

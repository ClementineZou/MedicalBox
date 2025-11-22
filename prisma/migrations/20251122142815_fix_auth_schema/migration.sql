/*
  Warnings:

  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Medicine` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `MedicineUsageRecord` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Reminder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `VitalSign` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `VitalSignReminder` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "idToken" TEXT,
    "expiresAt" DATETIME,
    "password" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

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
    "approvalNo" TEXT NOT NULL,
    "location" TEXT,
    "imageUrl" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Medicine_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Medicine" ("approvalNo", "brand", "category", "controlTypes", "createdAt", "dosage", "dosageUnit", "expiryDate", "id", "imageUrl", "indications", "location", "name", "notes", "quantity", "quantityUnit", "updatedAt", "usage") SELECT "approvalNo", "brand", "category", "controlTypes", "createdAt", "dosage", "dosageUnit", "expiryDate", "id", "imageUrl", "indications", "location", "name", "notes", "quantity", "quantityUnit", "updatedAt", "usage" FROM "Medicine";
DROP TABLE "Medicine";
ALTER TABLE "new_Medicine" RENAME TO "Medicine";
CREATE INDEX "Medicine_userId_idx" ON "Medicine"("userId");
CREATE INDEX "Medicine_expiryDate_idx" ON "Medicine"("expiryDate");
CREATE INDEX "Medicine_name_idx" ON "Medicine"("name");
CREATE TABLE "new_MedicineUsageRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "medicineId" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "usageTime" DATETIME NOT NULL,
    "notes" TEXT,
    "sideEffectNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MedicineUsageRecord_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "MedicineUsageRecord_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_MedicineUsageRecord" ("createdAt", "dosage", "id", "medicineId", "notes", "sideEffectNotes", "updatedAt", "usageTime") SELECT "createdAt", "dosage", "id", "medicineId", "notes", "sideEffectNotes", "updatedAt", "usageTime" FROM "MedicineUsageRecord";
DROP TABLE "MedicineUsageRecord";
ALTER TABLE "new_MedicineUsageRecord" RENAME TO "MedicineUsageRecord";
CREATE INDEX "MedicineUsageRecord_userId_idx" ON "MedicineUsageRecord"("userId");
CREATE INDEX "MedicineUsageRecord_medicineId_idx" ON "MedicineUsageRecord"("medicineId");
CREATE INDEX "MedicineUsageRecord_usageTime_idx" ON "MedicineUsageRecord"("usageTime");
CREATE TABLE "new_Reminder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "medicineId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "reminderTime" DATETIME NOT NULL,
    "frequency" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Reminder_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Reminder" ("createdAt", "description", "frequency", "id", "isActive", "isCompleted", "medicineId", "reminderTime", "title", "updatedAt") SELECT "createdAt", "description", "frequency", "id", "isActive", "isCompleted", "medicineId", "reminderTime", "title", "updatedAt" FROM "Reminder";
DROP TABLE "Reminder";
ALTER TABLE "new_Reminder" RENAME TO "Reminder";
CREATE INDEX "Reminder_userId_idx" ON "Reminder"("userId");
CREATE INDEX "Reminder_medicineId_idx" ON "Reminder"("medicineId");
CREATE INDEX "Reminder_reminderTime_idx" ON "Reminder"("reminderTime");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "image" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("createdAt", "email", "id", "name", "updatedAt") SELECT "createdAt", "email", "id", "name", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "new_VitalSign" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "measureTime" DATETIME NOT NULL,
    "notes" TEXT,
    "isNormal" BOOLEAN NOT NULL DEFAULT true,
    "referenceRange" TEXT,
    "category" TEXT,
    "systolic" INTEGER,
    "diastolic" INTEGER,
    "glucoseContext" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VitalSign_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_VitalSign" ("category", "createdAt", "diastolic", "glucoseContext", "id", "isNormal", "measureTime", "notes", "referenceRange", "systolic", "type", "unit", "updatedAt", "value") SELECT "category", "createdAt", "diastolic", "glucoseContext", "id", "isNormal", "measureTime", "notes", "referenceRange", "systolic", "type", "unit", "updatedAt", "value" FROM "VitalSign";
DROP TABLE "VitalSign";
ALTER TABLE "new_VitalSign" RENAME TO "VitalSign";
CREATE INDEX "VitalSign_userId_idx" ON "VitalSign"("userId");
CREATE INDEX "VitalSign_type_idx" ON "VitalSign"("type");
CREATE INDEX "VitalSign_measureTime_idx" ON "VitalSign"("measureTime");
CREATE INDEX "VitalSign_category_idx" ON "VitalSign"("category");
CREATE TABLE "new_VitalSignReminder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "vitalSignType" TEXT NOT NULL,
    "reminderTime" DATETIME NOT NULL,
    "frequency" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VitalSignReminder_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_VitalSignReminder" ("createdAt", "description", "frequency", "id", "isActive", "isCompleted", "reminderTime", "title", "updatedAt", "vitalSignType") SELECT "createdAt", "description", "frequency", "id", "isActive", "isCompleted", "reminderTime", "title", "updatedAt", "vitalSignType" FROM "VitalSignReminder";
DROP TABLE "VitalSignReminder";
ALTER TABLE "new_VitalSignReminder" RENAME TO "VitalSignReminder";
CREATE INDEX "VitalSignReminder_userId_idx" ON "VitalSignReminder"("userId");
CREATE INDEX "VitalSignReminder_vitalSignType_idx" ON "VitalSignReminder"("vitalSignType");
CREATE INDEX "VitalSignReminder_reminderTime_idx" ON "VitalSignReminder"("reminderTime");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Session_token_key" ON "Session"("token");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_providerId_accountId_key" ON "Account"("providerId", "accountId");

-- CreateIndex
CREATE UNIQUE INDEX "Verification_identifier_value_key" ON "Verification"("identifier", "value");

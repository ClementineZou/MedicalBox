/*
  Warnings:

  - You are about to drop the column `insuranceGroupNumber` on the `EmergencyCard` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_EmergencyCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "birthDate" DATETIME,
    "bloodType" TEXT,
    "height" REAL,
    "weight" REAL,
    "gender" TEXT,
    "nationality" TEXT,
    "primaryLanguage" TEXT,
    "insuranceProvider" TEXT,
    "insurancePolicyNumber" TEXT,
    "insurancePhone" TEXT,
    "insuranceNotes" TEXT,
    "surgicalHistory" TEXT,
    "medicalConditions" TEXT,
    "allergies" TEXT,
    "medications" TEXT,
    "emergencyContacts" TEXT,
    "organDonor" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmergencyCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_EmergencyCard" ("allergies", "birthDate", "bloodType", "emergencyContacts", "fullName", "gender", "height", "id", "insuranceNotes", "insurancePolicyNumber", "insuranceProvider", "medicalConditions", "medications", "nationality", "notes", "organDonor", "primaryLanguage", "surgicalHistory", "updatedAt", "userId", "weight") SELECT "allergies", "birthDate", "bloodType", "emergencyContacts", "fullName", "gender", "height", "id", "insuranceNotes", "insurancePolicyNumber", "insuranceProvider", "medicalConditions", "medications", "nationality", "notes", "organDonor", "primaryLanguage", "surgicalHistory", "updatedAt", "userId", "weight" FROM "EmergencyCard";
DROP TABLE "EmergencyCard";
ALTER TABLE "new_EmergencyCard" RENAME TO "EmergencyCard";
CREATE UNIQUE INDEX "EmergencyCard_userId_key" ON "EmergencyCard"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateTable
CREATE TABLE "EmergencyCard" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "birthDate" DATETIME,
    "bloodType" TEXT,
    "height" REAL,
    "weight" REAL,
    "medicalConditions" TEXT,
    "allergies" TEXT,
    "medications" TEXT,
    "emergencyContacts" TEXT,
    "organDonor" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "EmergencyCard_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "EmergencyCard_userId_key" ON "EmergencyCard"("userId");

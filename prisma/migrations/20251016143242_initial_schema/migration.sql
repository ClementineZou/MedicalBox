-- CreateTable
CREATE TABLE "Medicine" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "medicineId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "reminderTime" DATETIME NOT NULL,
    "frequency" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Reminder_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MedicineUsageRecord" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "medicineId" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "usageTime" DATETIME NOT NULL,
    "notes" TEXT,
    "sideEffectNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "MedicineUsageRecord_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES "Medicine" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VitalSign" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VitalSignReminder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "vitalSignType" TEXT NOT NULL,
    "reminderTime" DATETIME NOT NULL,
    "frequency" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "VitalSignReferenceRange" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "minValue" REAL NOT NULL,
    "maxValue" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "description" TEXT,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "VitalSignReferenceRange_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Medicine_expiryDate_idx" ON "Medicine"("expiryDate");

-- CreateIndex
CREATE INDEX "Medicine_name_idx" ON "Medicine"("name");

-- CreateIndex
CREATE INDEX "Reminder_medicineId_idx" ON "Reminder"("medicineId");

-- CreateIndex
CREATE INDEX "Reminder_reminderTime_idx" ON "Reminder"("reminderTime");

-- CreateIndex
CREATE INDEX "MedicineUsageRecord_medicineId_idx" ON "MedicineUsageRecord"("medicineId");

-- CreateIndex
CREATE INDEX "MedicineUsageRecord_usageTime_idx" ON "MedicineUsageRecord"("usageTime");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "VitalSign_type_idx" ON "VitalSign"("type");

-- CreateIndex
CREATE INDEX "VitalSign_measureTime_idx" ON "VitalSign"("measureTime");

-- CreateIndex
CREATE INDEX "VitalSign_category_idx" ON "VitalSign"("category");

-- CreateIndex
CREATE INDEX "VitalSignReminder_vitalSignType_idx" ON "VitalSignReminder"("vitalSignType");

-- CreateIndex
CREATE INDEX "VitalSignReminder_reminderTime_idx" ON "VitalSignReminder"("reminderTime");

-- CreateIndex
CREATE INDEX "VitalSignReferenceRange_type_idx" ON "VitalSignReferenceRange"("type");

-- CreateIndex
CREATE INDEX "VitalSignReferenceRange_userId_idx" ON "VitalSignReferenceRange"("userId");

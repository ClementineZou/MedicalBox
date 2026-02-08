-- Add barcode column (nullable; will be auto-filled on create/backfill)
ALTER TABLE "Medicine" ADD COLUMN "barcode" TEXT;

-- Unique index (SQLite allows multiple NULLs under UNIQUE)
CREATE UNIQUE INDEX "Medicine_barcode_key" ON "Medicine"("barcode");

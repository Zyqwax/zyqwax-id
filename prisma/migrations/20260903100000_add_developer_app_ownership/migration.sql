ALTER TABLE "App" ADD COLUMN "description" TEXT;
ALTER TABLE "App" ADD COLUMN "ownerId" TEXT;
ALTER TABLE "App" ADD COLUMN "allowedScopes" TEXT[] NOT NULL DEFAULT ARRAY['profile', 'email']::TEXT[];
ALTER TABLE "App" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "App" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- Mevcut clientler yeni owner/scope yönetimi gelmeden önce tüm public scope'ları kullanabiliyordu.
UPDATE "App" SET "allowedScopes" = ARRAY['profile', 'email', 'friends', 'blocks']::TEXT[];

CREATE INDEX "App_ownerId_createdAt_idx" ON "App"("ownerId", "createdAt");
ALTER TABLE "App" ADD CONSTRAINT "App_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

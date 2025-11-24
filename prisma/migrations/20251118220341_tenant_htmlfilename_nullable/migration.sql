-- DropForeignKey
ALTER TABLE "TenantAccounts" DROP CONSTRAINT "TenantAccounts_tenantid_fkey";

-- DropIndex
DROP INDEX "TenantAccounts_username_key";

-- AlterTable
ALTER TABLE "Plans" ADD COLUMN     "htmlcontent" TEXT,
ADD COLUMN     "intro" TEXT;

-- AlterTable
ALTER TABLE "TenantAccounts" ADD COLUMN     "emailverified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "verificationCode" TEXT,
ADD COLUMN     "verificationCodeExpiry" TIMESTAMP(3),
ALTER COLUMN "tenantid" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Tenants" ADD COLUMN     "htmlfilename" TEXT;

-- CreateTable
CREATE TABLE "Templates" (
    "templateid" SERIAL NOT NULL,
    "planid" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "htmlcontent" TEXT,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Templates_pkey" PRIMARY KEY ("templateid")
);

-- CreateTable
CREATE TABLE "TenantTemplates" (
    "tenanttemplateid" SERIAL NOT NULL,
    "tenantid" INTEGER NOT NULL,
    "templateid" INTEGER,
    "name" TEXT NOT NULL,
    "htmlcontent" TEXT,
    "data" JSONB,
    "slug" TEXT,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantTemplates_pkey" PRIMARY KEY ("tenanttemplateid")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantTemplates_slug_key" ON "TenantTemplates"("slug");

-- AddForeignKey
ALTER TABLE "TenantAccounts" ADD CONSTRAINT "TenantAccounts_tenantid_fkey" FOREIGN KEY ("tenantid") REFERENCES "Tenants"("tenantid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Templates" ADD CONSTRAINT "Templates_planid_fkey" FOREIGN KEY ("planid") REFERENCES "Plans"("planid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantTemplates" ADD CONSTRAINT "TenantTemplates_tenantid_fkey" FOREIGN KEY ("tenantid") REFERENCES "Tenants"("tenantid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantTemplates" ADD CONSTRAINT "TenantTemplates_templateid_fkey" FOREIGN KEY ("templateid") REFERENCES "Templates"("templateid") ON DELETE SET NULL ON UPDATE CASCADE;

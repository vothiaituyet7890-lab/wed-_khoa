-- CreateTable
CREATE TABLE "Tenants" (
    "tenantid" SERIAL NOT NULL,
    "tenantname" TEXT NOT NULL,
    "domain" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "status" TEXT DEFAULT 'active',
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Tenants_pkey" PRIMARY KEY ("tenantid")
);

-- CreateTable
CREATE TABLE "Departments" (
    "departmentid" SERIAL NOT NULL,
    "tenantid" INTEGER NOT NULL,
    "departmentname" TEXT NOT NULL,
    "description" TEXT,
    "head" TEXT,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Departments_pkey" PRIMARY KEY ("departmentid")
);

-- CreateTable
CREATE TABLE "Lecturers" (
    "lecturerid" SERIAL NOT NULL,
    "tenantid" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "departmentid" INTEGER,
    "title" TEXT,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Lecturers_pkey" PRIMARY KEY ("lecturerid")
);

-- CreateTable
CREATE TABLE "Programs" (
    "programid" SERIAL NOT NULL,
    "tenantid" INTEGER NOT NULL,
    "programname" TEXT NOT NULL,
    "departmentid" INTEGER,
    "description" TEXT,
    "durationyears" INTEGER,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Programs_pkey" PRIMARY KEY ("programid")
);

-- CreateTable
CREATE TABLE "ResearchProjects" (
    "projectid" SERIAL NOT NULL,
    "tenantid" INTEGER NOT NULL,
    "projectname" TEXT NOT NULL,
    "description" TEXT,
    "startdate" TIMESTAMP(3),
    "enddate" TIMESTAMP(3),
    "leaderid" INTEGER,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ResearchProjects_pkey" PRIMARY KEY ("projectid")
);

-- CreateTable
CREATE TABLE "News" (
    "newsid" SERIAL NOT NULL,
    "tenantid" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "authorid" INTEGER,
    "publisheddate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "News_pkey" PRIMARY KEY ("newsid")
);

-- CreateTable
CREATE TABLE "Events" (
    "eventid" SERIAL NOT NULL,
    "tenantid" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startdate" TIMESTAMP(3),
    "enddate" TIMESTAMP(3),
    "location" TEXT,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Events_pkey" PRIMARY KEY ("eventid")
);

-- CreateTable
CREATE TABLE "Achievements" (
    "achievementid" SERIAL NOT NULL,
    "tenantid" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3),
    "associatedwith" TEXT,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievements_pkey" PRIMARY KEY ("achievementid")
);

-- CreateTable
CREATE TABLE "TenantAccounts" (
    "accountid" SERIAL NOT NULL,
    "tenantid" INTEGER NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordhash" TEXT NOT NULL,
    "role" TEXT DEFAULT 'admin',
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantAccounts_pkey" PRIMARY KEY ("accountid")
);

-- CreateTable
CREATE TABLE "Plans" (
    "planid" SERIAL NOT NULL,
    "planname" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(65,30) NOT NULL,
    "durationmonths" INTEGER NOT NULL,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Plans_pkey" PRIMARY KEY ("planid")
);

-- CreateTable
CREATE TABLE "Subscriptions" (
    "subscriptionid" SERIAL NOT NULL,
    "tenantid" INTEGER NOT NULL,
    "planid" INTEGER NOT NULL,
    "startdate" TIMESTAMP(3) NOT NULL,
    "enddate" TIMESTAMP(3) NOT NULL,
    "status" TEXT DEFAULT 'active',
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Subscriptions_pkey" PRIMARY KEY ("subscriptionid")
);

-- CreateTable
CREATE TABLE "SubscriptionLogs" (
    "logid" SERIAL NOT NULL,
    "subscriptionid" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "actionby" TEXT,
    "actiondate" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,

    CONSTRAINT "SubscriptionLogs_pkey" PRIMARY KEY ("logid")
);

-- CreateTable
CREATE TABLE "SuperAdmin" (
    "adminid" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordhash" TEXT NOT NULL,
    "role" TEXT DEFAULT 'superadmin',
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuperAdmin_pkey" PRIMARY KEY ("adminid")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lecturers_email_key" ON "Lecturers"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TenantAccounts_username_key" ON "TenantAccounts"("username");

-- CreateIndex
CREATE UNIQUE INDEX "TenantAccounts_email_key" ON "TenantAccounts"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SuperAdmin_username_key" ON "SuperAdmin"("username");

-- CreateIndex
CREATE UNIQUE INDEX "SuperAdmin_email_key" ON "SuperAdmin"("email");

-- AddForeignKey
ALTER TABLE "Departments" ADD CONSTRAINT "Departments_tenantid_fkey" FOREIGN KEY ("tenantid") REFERENCES "Tenants"("tenantid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lecturers" ADD CONSTRAINT "Lecturers_tenantid_fkey" FOREIGN KEY ("tenantid") REFERENCES "Tenants"("tenantid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lecturers" ADD CONSTRAINT "Lecturers_departmentid_fkey" FOREIGN KEY ("departmentid") REFERENCES "Departments"("departmentid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Programs" ADD CONSTRAINT "Programs_tenantid_fkey" FOREIGN KEY ("tenantid") REFERENCES "Tenants"("tenantid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Programs" ADD CONSTRAINT "Programs_departmentid_fkey" FOREIGN KEY ("departmentid") REFERENCES "Departments"("departmentid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchProjects" ADD CONSTRAINT "ResearchProjects_tenantid_fkey" FOREIGN KEY ("tenantid") REFERENCES "Tenants"("tenantid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResearchProjects" ADD CONSTRAINT "ResearchProjects_leaderid_fkey" FOREIGN KEY ("leaderid") REFERENCES "Lecturers"("lecturerid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "News" ADD CONSTRAINT "News_tenantid_fkey" FOREIGN KEY ("tenantid") REFERENCES "Tenants"("tenantid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "News" ADD CONSTRAINT "News_authorid_fkey" FOREIGN KEY ("authorid") REFERENCES "Lecturers"("lecturerid") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Events" ADD CONSTRAINT "Events_tenantid_fkey" FOREIGN KEY ("tenantid") REFERENCES "Tenants"("tenantid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievements" ADD CONSTRAINT "Achievements_tenantid_fkey" FOREIGN KEY ("tenantid") REFERENCES "Tenants"("tenantid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantAccounts" ADD CONSTRAINT "TenantAccounts_tenantid_fkey" FOREIGN KEY ("tenantid") REFERENCES "Tenants"("tenantid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscriptions" ADD CONSTRAINT "Subscriptions_tenantid_fkey" FOREIGN KEY ("tenantid") REFERENCES "Tenants"("tenantid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscriptions" ADD CONSTRAINT "Subscriptions_planid_fkey" FOREIGN KEY ("planid") REFERENCES "Plans"("planid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionLogs" ADD CONSTRAINT "SubscriptionLogs_subscriptionid_fkey" FOREIGN KEY ("subscriptionid") REFERENCES "Subscriptions"("subscriptionid") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Add manage-org schema: locations extensions, teams, memberships, forms, form versions, form responses, org audit log, sms audit log, jobs

-- AlterTable Location: extend for the manage-organization dashboard
ALTER TABLE "Location"
  ADD COLUMN "description" TEXT,
  ADD COLUMN "photo_url" TEXT,
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN "sms_credits" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable User: support member status + invites_count + updated_at
ALTER TABLE "User"
  ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN "invites_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable Team
CREATE TABLE "Team" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'custom',
    "is_public_joinable" BOOLEAN NOT NULL DEFAULT false,
    "allow_member_pin" BOOLEAN NOT NULL DEFAULT false,
    "sms_otp_required" BOOLEAN NOT NULL DEFAULT false,
    "is_system" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- CreateTable TeamMembership
CREATE TABLE "TeamMembership" (
    "id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "is_team_admin" BOOLEAN NOT NULL DEFAULT false,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable Form
CREATE TABLE "Form" (
    "id" TEXT NOT NULL,
    "public_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "team_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "fields" JSONB NOT NULL,
    "distribution" JSONB NOT NULL,
    "analytics_scans" INTEGER NOT NULL DEFAULT 0,
    "analytics_submissions" INTEGER NOT NULL DEFAULT 0,
    "schema_version" INTEGER NOT NULL DEFAULT 1,
    "created_by" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "published_at" TIMESTAMP(3),
    "archived_at" TIMESTAMP(3),

    CONSTRAINT "Form_pkey" PRIMARY KEY ("id")
);

-- CreateTable FormVersion (snapshot of fields/distribution on each published-form edit)
CREATE TABLE "FormVersion" (
    "id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "schema_version" INTEGER NOT NULL,
    "fields" JSONB NOT NULL,
    "distribution" JSONB NOT NULL,
    "archived_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable FormResponse
CREATE TABLE "FormResponse" (
    "id" TEXT NOT NULL,
    "form_id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "location_id" TEXT NOT NULL,
    "form_schema_version" INTEGER NOT NULL,
    "submitted_by" TEXT,
    "answers" JSONB NOT NULL,
    "ip" TEXT,
    "ua" TEXT,
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FormResponse_pkey" PRIMARY KEY ("id")
);

-- CreateTable OrgAuditLog (per §13 / §16 audit checklist)
CREATE TABLE "OrgAuditLog" (
    "id" TEXT NOT NULL,
    "actor_id" TEXT,
    "organization_id" TEXT NOT NULL,
    "location_id" TEXT,
    "entity" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "diff" JSONB NOT NULL,
    "ip" TEXT NOT NULL,
    "ua" TEXT NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrgAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable SmsAuditLog (per §16 sms audit checklist)
CREATE TABLE "SmsAuditLog" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "location_id" TEXT,
    "to_phone" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "body_preview" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "credits_after" INTEGER NOT NULL,
    "at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SmsAuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable Job (for async bulk-import per §8)
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "location_id" TEXT,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queued',
    "total" INTEGER NOT NULL DEFAULT 0,
    "processed" INTEGER NOT NULL DEFAULT 0,
    "succeeded" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "errors" JSONB,
    "payload" JSONB,
    "started_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateIndex Location: unique name per org
CREATE UNIQUE INDEX "Location_organization_id_name_key" ON "Location"("organization_id", "name");

-- CreateIndex Location: status filter
CREATE INDEX "Location_organization_id_status_idx" ON "Location"("organization_id", "status");

-- CreateIndex User: org-scoped status filter
CREATE INDEX "User_organization_id_status_idx" ON "User"("organization_id", "status");

-- CreateIndex Team
CREATE INDEX "Team_organization_id_idx" ON "Team"("organization_id");
CREATE INDEX "Team_location_id_idx" ON "Team"("location_id");
CREATE INDEX "Team_organization_id_location_id_kind_idx" ON "Team"("organization_id", "location_id", "kind");
CREATE UNIQUE INDEX "Team_location_id_name_key" ON "Team"("location_id", "name");

-- CreateIndex TeamMembership
CREATE INDEX "TeamMembership_user_id_idx" ON "TeamMembership"("user_id");
CREATE INDEX "TeamMembership_team_id_is_team_admin_idx" ON "TeamMembership"("team_id", "is_team_admin");
CREATE UNIQUE INDEX "TeamMembership_team_id_user_id_key" ON "TeamMembership"("team_id", "user_id");

-- CreateIndex Form
CREATE UNIQUE INDEX "Form_public_id_key" ON "Form"("public_id");
CREATE INDEX "Form_organization_id_idx" ON "Form"("organization_id");
CREATE INDEX "Form_location_id_idx" ON "Form"("location_id");
CREATE INDEX "Form_team_id_idx" ON "Form"("team_id");
CREATE INDEX "Form_status_idx" ON "Form"("status");
CREATE INDEX "Form_organization_id_status_updated_at_idx" ON "Form"("organization_id", "status", "updated_at");

-- CreateIndex FormVersion
CREATE INDEX "FormVersion_form_id_idx" ON "FormVersion"("form_id");
CREATE UNIQUE INDEX "FormVersion_form_id_schema_version_key" ON "FormVersion"("form_id", "schema_version");

-- CreateIndex FormResponse
CREATE INDEX "FormResponse_form_id_submitted_at_idx" ON "FormResponse"("form_id", "submitted_at");
CREATE INDEX "FormResponse_organization_id_submitted_at_idx" ON "FormResponse"("organization_id", "submitted_at");
CREATE INDEX "FormResponse_location_id_submitted_at_idx" ON "FormResponse"("location_id", "submitted_at");

-- CreateIndex OrgAuditLog
CREATE INDEX "OrgAuditLog_organization_id_at_idx" ON "OrgAuditLog"("organization_id", "at");
CREATE INDEX "OrgAuditLog_entity_entity_id_idx" ON "OrgAuditLog"("entity", "entity_id");
CREATE INDEX "OrgAuditLog_actor_id_at_idx" ON "OrgAuditLog"("actor_id", "at");

-- CreateIndex SmsAuditLog
CREATE INDEX "SmsAuditLog_organization_id_at_idx" ON "SmsAuditLog"("organization_id", "at");
CREATE INDEX "SmsAuditLog_location_id_at_idx" ON "SmsAuditLog"("location_id", "at");

-- CreateIndex Job
CREATE INDEX "Job_organization_id_createdAt_idx" ON "Job"("organization_id", "createdAt");
CREATE INDEX "Job_status_idx" ON "Job"("status");

-- AddForeignKey Team
ALTER TABLE "Team" ADD CONSTRAINT "Team_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Team" ADD CONSTRAINT "Team_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey TeamMembership
ALTER TABLE "TeamMembership" ADD CONSTRAINT "TeamMembership_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamMembership" ADD CONSTRAINT "TeamMembership_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey Form
ALTER TABLE "Form" ADD CONSTRAINT "Form_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Form" ADD CONSTRAINT "Form_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Form" ADD CONSTRAINT "Form_team_id_fkey" FOREIGN KEY ("team_id") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Form" ADD CONSTRAINT "Form_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey FormVersion
ALTER TABLE "FormVersion" ADD CONSTRAINT "FormVersion_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey FormResponse
ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "Form"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "FormResponse" ADD CONSTRAINT "FormResponse_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey OrgAuditLog
ALTER TABLE "OrgAuditLog" ADD CONSTRAINT "OrgAuditLog_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "OrgAuditLog" ADD CONSTRAINT "OrgAuditLog_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey SmsAuditLog
ALTER TABLE "SmsAuditLog" ADD CONSTRAINT "SmsAuditLog_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SmsAuditLog" ADD CONSTRAINT "SmsAuditLog_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey Job
ALTER TABLE "Job" ADD CONSTRAINT "Job_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Job" ADD CONSTRAINT "Job_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "Form" ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "brand" JSONB,
ALTER COLUMN "updated_at" DROP DEFAULT;

-- AlterTable
ALTER TABLE "Organization" ADD COLUMN     "brand" JSONB,
ADD COLUMN     "settings" JSONB;

-- AlterTable
ALTER TABLE "Team" ALTER COLUMN "updated_at" DROP DEFAULT;

-- CreateTable
CREATE TABLE "MessageTemplate" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "scope" TEXT NOT NULL DEFAULT 'organization',
    "location_id" TEXT,
    "name" TEXT NOT NULL,
    "channel" TEXT NOT NULL DEFAULT 'sms',
    "body" TEXT NOT NULL,
    "variables" JSONB,
    "mode" TEXT NOT NULL DEFAULT 'flexible',
    "created_by" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "location_id" TEXT,
    "owner_user_id" TEXT,
    "source_user_id" TEXT,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "note" TEXT,
    "status" TEXT NOT NULL DEFAULT 'invited',
    "source_kind" TEXT NOT NULL DEFAULT 'worker',
    "last_messaged_at" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InviteLink" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "location_id" TEXT,
    "team_id" TEXT,
    "owner_user_id" TEXT NOT NULL,
    "form_id" TEXT,
    "code" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),
    "max_uses" INTEGER NOT NULL DEFAULT 0,
    "uses" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InviteLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "owner_type" TEXT NOT NULL,
    "owner_user_id" TEXT,
    "owner_location_id" TEXT,
    "delta" INTEGER NOT NULL,
    "balance_after" INTEGER NOT NULL,
    "kind" TEXT NOT NULL,
    "ref_id" TEXT,
    "location_id" TEXT,
    "actor_user_id" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CustomDomain" (
    "id" TEXT NOT NULL,
    "organization_id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "verification_token" TEXT NOT NULL,
    "verified_at" TIMESTAMP(3),
    "ssl_status" TEXT NOT NULL DEFAULT 'none',
    "dns_instructions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CustomDomain_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MessageTemplate_organization_id_scope_idx" ON "MessageTemplate"("organization_id", "scope");

-- CreateIndex
CREATE INDEX "MessageTemplate_location_id_idx" ON "MessageTemplate"("location_id");

-- CreateIndex
CREATE INDEX "MessageTemplate_organization_id_name_idx" ON "MessageTemplate"("organization_id", "name");

-- CreateIndex
CREATE INDEX "Contact_organization_id_status_idx" ON "Contact"("organization_id", "status");

-- CreateIndex
CREATE INDEX "Contact_location_id_idx" ON "Contact"("location_id");

-- CreateIndex
CREATE INDEX "Contact_owner_user_id_idx" ON "Contact"("owner_user_id");

-- CreateIndex
CREATE INDEX "Contact_organization_id_createdAt_idx" ON "Contact"("organization_id", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Contact_organization_id_phone_key" ON "Contact"("organization_id", "phone");

-- CreateIndex
CREATE UNIQUE INDEX "InviteLink_code_key" ON "InviteLink"("code");

-- CreateIndex
CREATE INDEX "InviteLink_organization_id_status_idx" ON "InviteLink"("organization_id", "status");

-- CreateIndex
CREATE INDEX "InviteLink_owner_user_id_idx" ON "InviteLink"("owner_user_id");

-- CreateIndex
CREATE INDEX "InviteLink_location_id_idx" ON "InviteLink"("location_id");

-- CreateIndex
CREATE INDEX "WalletTransaction_organization_id_owner_type_owner_user_id__idx" ON "WalletTransaction"("organization_id", "owner_type", "owner_user_id", "createdAt");

-- CreateIndex
CREATE INDEX "WalletTransaction_organization_id_owner_type_owner_location_idx" ON "WalletTransaction"("organization_id", "owner_type", "owner_location_id", "createdAt");

-- CreateIndex
CREATE INDEX "WalletTransaction_location_id_idx" ON "WalletTransaction"("location_id");

-- CreateIndex
CREATE UNIQUE INDEX "CustomDomain_domain_key" ON "CustomDomain"("domain");

-- CreateIndex
CREATE INDEX "CustomDomain_organization_id_idx" ON "CustomDomain"("organization_id");

-- CreateIndex
CREATE INDEX "CustomDomain_status_idx" ON "CustomDomain"("status");

-- AddForeignKey
ALTER TABLE "MessageTemplate" ADD CONSTRAINT "MessageTemplate_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageTemplate" ADD CONSTRAINT "MessageTemplate_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Contact" ADD CONSTRAINT "Contact_source_user_id_fkey" FOREIGN KEY ("source_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteLink" ADD CONSTRAINT "InviteLink_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteLink" ADD CONSTRAINT "InviteLink_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InviteLink" ADD CONSTRAINT "InviteLink_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_owner_location_id_fkey" FOREIGN KEY ("owner_location_id") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_location_id_fkey" FOREIGN KEY ("location_id") REFERENCES "Location"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CustomDomain" ADD CONSTRAINT "CustomDomain_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddUserEmail
ALTER TABLE "User" ADD COLUMN "email" TEXT;
CREATE INDEX "User_email_idx" ON "User"("email");

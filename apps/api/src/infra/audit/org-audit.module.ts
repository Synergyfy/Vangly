import { Module, Global } from '@nestjs/common';
import { OrgAuditService } from './org-audit.service';

@Global()
@Module({
  providers: [OrgAuditService],
  exports: [OrgAuditService],
})
export class OrgAuditModule {}

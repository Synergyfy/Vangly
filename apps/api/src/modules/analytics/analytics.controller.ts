import { Controller, Get, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { RolesGuard } from '../../auth/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { AnalyticsService } from './analytics.service';
import { OrgAnalyticsEntity } from './entities/analytics.entity';

@ApiTags('analytics')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Controller('api/analytics')
export class AnalyticsController {
  constructor(private readonly service: AnalyticsService) {}

  @Get('org')
  @ApiOperation({ summary: 'Get org analytics' })
  @ApiOkResponse({ type: OrgAnalyticsEntity })
  org(@CurrentUser() user: AuthUser) {
    return this.service.getOrgAnalytics({
      organizationId: user.organization_id!,
    });
  }

  @Get('location/:locationId')
  @ApiOperation({ summary: 'Get location analytics' })
  @ApiOkResponse({ type: OrgAnalyticsEntity })
  location(@CurrentUser() user: AuthUser) {
    return this.service.getLocationAnalytics({
      organizationId: user.organization_id!,
      locationId: user.branch_id ?? undefined,
    });
  }

  @Get('worker')
  @ApiOperation({ summary: 'Get worker analytics' })
  async worker(@CurrentUser() user: AuthUser) {
    return this.service.getWorkerAnalytics({
      organizationId: user.organization_id!,
      locationId: user.branch_id ?? undefined,
      ownerUserId: user.sub,
    });
  }
}

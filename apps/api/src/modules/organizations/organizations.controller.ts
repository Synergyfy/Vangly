import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { RolesGuard, Roles } from '../../auth/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { getIpAndUa } from '../../common/utils/request';
import {
  OrganizationBrandEntity,
  OrganizationEntity,
  OrganizationSettingsEntity,
} from './entities/organization.entity';
import {
  UpdateOrganizationBrandDto,
  UpdateOrganizationDto,
  UpdateOrganizationSettingsDto,
} from './dto/organization.dto';
import { OrganizationsService } from './organizations.service';

@ApiTags('organizations')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Controller('api/organizations')
export class OrganizationsController {
  constructor(private readonly service: OrganizationsService) {}

  @Get('me')
  @Roles('organization_admin', 'super_admin', 'location_admin', 'worker')
  @ApiOperation({ summary: 'Get my organization' })
  @ApiOkResponse({ type: OrganizationEntity })
  async getMe(@CurrentUser() user: AuthUser) {
    return this.service.getMyOrganization({
      ...user,
      organization_id: user.organization_id!,
      role: user.role ?? 'worker',
    });
  }

  @Patch('me')
  @Roles('organization_admin', 'super_admin')
  @ApiOperation({ summary: 'Update my organization' })
  @ApiOkResponse({ type: OrganizationEntity })
  async updateMe(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateOrganizationDto,
    @Req() req: Request,
  ) {
    return this.service.updateMyOrganization(
      {
        ...user,
        organization_id: user.organization_id!,
        role: user.role ?? 'worker',
      },
      dto,
      getIpAndUa(req),
    );
  }

  @Get('me/settings')
  @Roles('organization_admin', 'super_admin', 'location_admin', 'worker')
  @ApiOperation({ summary: 'Get my organization settings' })
  @ApiOkResponse({ type: OrganizationSettingsEntity })
  async getSettings(@CurrentUser() user: AuthUser) {
    return this.service.getMySettings({
      sub: user.sub,
      organization_id: user.organization_id!,
    });
  }

  @Patch('me/settings')
  @Roles('organization_admin', 'super_admin')
  @ApiOperation({ summary: 'Update my organization settings' })
  @ApiOkResponse({ type: OrganizationSettingsEntity })
  async updateSettings(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateOrganizationSettingsDto,
    @Req() req: Request,
  ) {
    return this.service.updateMySettings(
      {
        sub: user.sub,
        organization_id: user.organization_id!,
        role: user.role ?? 'worker',
      },
      dto,
      getIpAndUa(req),
    );
  }

  @Get('me/brand')
  @Roles('organization_admin', 'super_admin', 'location_admin', 'worker')
  @ApiOperation({ summary: 'Get my organization brand' })
  @ApiOkResponse({ type: OrganizationBrandEntity })
  async getBrand(@CurrentUser() user: AuthUser) {
    return this.service.getMyBrand({
      sub: user.sub,
      organization_id: user.organization_id!,
    });
  }

  @Patch('me/brand')
  @Roles('organization_admin', 'super_admin')
  @ApiOperation({ summary: 'Update my organization brand' })
  @ApiOkResponse({ type: OrganizationBrandEntity })
  async updateBrand(
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateOrganizationBrandDto,
    @Req() req: Request,
  ) {
    return this.service.updateMyBrand(
      {
        ...user,
        organization_id: user.organization_id!,
        role: user.role ?? 'worker',
      },
      dto,
      getIpAndUa(req),
    );
  }
}

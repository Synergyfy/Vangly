import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { LocationsService } from './locations.service';
import {
  CreateLocationDto,
  UpdateLocationDto,
  FindLocationsQueryDto,
  LocationDashboardQueryDto,
  LocationPhotoDto,
} from './dto';
import { Roles, RolesGuard } from '../../auth/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { getIpAndUa } from '../../common/utils/request';
import { LocationEntity } from './entities/location.entity';
import { LocationDashboardEntity } from './entities/location-dashboard.entity';

@ApiTags('locations')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Controller('api/locations')
export class LocationsController {
  constructor(private readonly service: LocationsService) {}

  @Get()
  @ApiOperation({ summary: "List locations for the caller's organization" })
  @ApiOkResponse({
    description: 'Paginated list of locations with stats and activity.',
  })
  @ApiForbiddenResponse()
  @Roles('organization_admin', 'super_admin', 'location_admin')
  async list(
    @CurrentUser() user: AuthUser,
    @Query() query: FindLocationsQueryDto,
  ) {
    return this.service.list(
      user.organization_id!,
      user.role ?? 'worker',
      user.branch_id,
      query,
    );
  }

  @Post()
  @ApiOperation({
    summary: "Create a new location in the caller's organization",
  })
  @ApiCreatedResponse({
    type: LocationEntity,
    description: 'Returns the new location with stats.',
  })
  @ApiBadRequestResponse()
  @ApiConflictResponse({
    description: 'A location with the same name already exists.',
  })
  @ApiForbiddenResponse()
  @Roles('organization_admin', 'super_admin')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateLocationDto,
    @Req() req: Request,
  ) {
    const { ip, ua } = getIpAndUa(req);
    return this.service.create(user.organization_id!, dto, {
      id: user.sub,
      ip,
      ua,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a location by id' })
  @ApiParam({ name: 'id', description: 'Location id' })
  @ApiOkResponse({ type: LocationEntity })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @Roles('organization_admin', 'super_admin', 'location_admin')
  async getOne(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.getById(
      user.organization_id!,
      id,
      user.role ?? 'worker',
      user.branch_id,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a location' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: LocationEntity })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiConflictResponse()
  @Roles('organization_admin', 'super_admin', 'location_admin')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateLocationDto,
    @Req() req: Request,
  ) {
    const { ip, ua } = getIpAndUa(req);
    return this.service.update(user.organization_id!, id, dto, {
      id: user.sub,
      ip,
      ua,
    });
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Soft-delete (archive) a location' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ description: 'Location archived.' })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse({ description: 'HQ location cannot be archived.' })
  @Roles('organization_admin', 'super_admin')
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    const { ip, ua } = getIpAndUa(req);
    await this.service.softDelete(user.organization_id!, id, {
      id: user.sub,
      ip,
      ua,
    });
    return { ok: true };
  }

  @Post(':id/photo')
  @ApiOperation({
    summary: 'Set a location photo (URL only; frontend uploads to CDN)',
  })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({
    schema: { example: { photo_url: 'https://cdn.vangly.app/...' } },
  })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @Roles('organization_admin', 'super_admin', 'location_admin')
  async setPhoto(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: LocationPhotoDto,
    @Req() req: Request,
  ) {
    const { ip, ua } = getIpAndUa(req);
    return this.service.setPhoto(user.organization_id!, id, dto.photo_url, {
      id: user.sub,
      ip,
      ua,
    });
  }

  @Get(':id/dashboard')
  @ApiOperation({ summary: 'Get the dashboard payload for a location' })
  @ApiParam({ name: 'id' })
  @ApiOkResponse({ type: LocationDashboardEntity })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @Roles('organization_admin', 'super_admin', 'location_admin')
  async getDashboard(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Query() query: LocationDashboardQueryDto,
  ) {
    return this.service.getDashboard(
      user.organization_id!,
      id,
      query,
      user.role ?? 'worker',
      user.branch_id,
    );
  }
}

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
import { TeamsService } from './teams.service';
import {
  CreateTeamDto,
  FindTeamsQueryDto,
  CloneTeamDto,
  UpdateTeamDto,
} from './dto';
import { Roles, RolesGuard } from '../../auth/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { getIpAndUa } from '../../common/utils/request';
import {
  TeamEntity,
  TeamDetailEntity,
  CloneTeamResultEntity,
} from './entities/team.entity';

@ApiTags('teams')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Controller('api/teams')
export class TeamsController {
  constructor(private readonly service: TeamsService) {}

  @Patch(':teamId')
  @ApiOperation({ summary: 'Update a team' })
  @ApiParam({ name: 'teamId' })
  @ApiOkResponse({ type: TeamEntity })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiConflictResponse()
  @ApiForbiddenResponse({ description: 'Admin team is read-only.' })
  @Roles('organization_admin', 'super_admin', 'location_admin')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('teamId') teamId: string,
    @Body() dto: UpdateTeamDto,
    @Req() req: Request,
  ) {
    const { ip, ua } = getIpAndUa(req);
    return this.service.update(user.organization_id!, teamId, dto, {
      id: user.sub,
      ip,
      ua,
    });
  }

  @Delete(':teamId')
  @ApiOperation({
    summary: 'Delete a team (forms detached to system General team)',
  })
  @ApiParam({ name: 'teamId' })
  @ApiOkResponse({ description: 'Team deleted.' })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse({ description: 'Admin team cannot be deleted.' })
  @Roles('organization_admin', 'super_admin', 'location_admin')
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('teamId') teamId: string,
    @Req() req: Request,
  ) {
    const { ip, ua } = getIpAndUa(req);
    await this.service.delete(user.organization_id!, teamId, {
      id: user.sub,
      ip,
      ua,
    });
    return { ok: true };
  }

  @Post(':teamId/clone-from')
  @ApiOperation({
    summary: 'Clone a team from another location in the same org',
  })
  @ApiParam({
    name: 'teamId',
    description: 'Optional target team id (not used for cloning)',
  })
  @ApiCreatedResponse({ type: CloneTeamResultEntity })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiForbiddenResponse({
    description: 'Source location must belong to your organization.',
  })
  @ApiConflictResponse()
  @Roles('organization_admin', 'super_admin', 'location_admin')
  async cloneFrom(
    @CurrentUser() user: AuthUser,
    @Param('teamId') _teamId: string,
    @Body() dto: CloneTeamDto,
    @Req() req: Request,
  ) {
    const { ip, ua } = getIpAndUa(req);
    return this.service.cloneFrom(user.organization_id!, _teamId, null, dto, {
      id: user.sub,
      ip,
      ua,
    });
  }
}

@ApiTags('teams')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Controller('api/locations/:locationId/teams')
export class LocationTeamsController {
  constructor(private readonly service: TeamsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a team in a location' })
  @ApiParam({ name: 'locationId' })
  @ApiCreatedResponse({ type: TeamEntity })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiConflictResponse({
    description: 'Duplicate team name, or "Admin" reserved.',
  })
  @Roles('organization_admin', 'super_admin', 'location_admin')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: AuthUser,
    @Param('locationId') locationId: string,
    @Body() dto: CreateTeamDto,
    @Req() req: Request,
  ) {
    const { ip, ua } = getIpAndUa(req);
    return this.service.create(user.organization_id!, locationId, dto, {
      id: user.sub,
      ip,
      ua,
    });
  }

  @Get()
  @ApiOperation({ summary: 'List teams in a location' })
  @ApiParam({ name: 'locationId' })
  @ApiOkResponse({ type: [TeamEntity] })
  @Roles('organization_admin', 'super_admin', 'location_admin')
  async list(
    @CurrentUser() user: AuthUser,
    @Param('locationId') locationId: string,
    @Query() query: FindTeamsQueryDto,
  ) {
    return this.service.list(user.organization_id!, locationId, query);
  }

  @Get(':teamId')
  @ApiOperation({ summary: 'Get team detail (members + forms)' })
  @ApiParam({ name: 'locationId' })
  @ApiParam({ name: 'teamId' })
  @ApiOkResponse({ type: TeamDetailEntity })
  @ApiNotFoundResponse()
  @Roles('organization_admin', 'super_admin', 'location_admin')
  async getDetail(
    @CurrentUser() user: AuthUser,
    @Param('locationId') locationId: string,
    @Param('teamId') teamId: string,
    @Query() query: FindTeamsQueryDto,
  ) {
    return this.service.getDetail(
      user.organization_id!,
      locationId,
      teamId,
      query.page ?? 1,
      query.per_page ?? 50,
      query.q,
    );
  }
}

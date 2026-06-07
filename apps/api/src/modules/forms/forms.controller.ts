import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
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
  ApiProduces,
  ApiTags,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { FormsService } from './forms.service';
import {
  CreateFormDto,
  UpdateFormDto,
  FindFormsQueryDto,
  CloneFormDto,
} from './dto';
import { Roles, RolesGuard } from '../../auth/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import {
  FormEntity,
  FormResponseEntity,
  FormVersionEntity,
} from './entities/form.entity';

@ApiTags('forms')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Controller('api/teams/:teamId/forms')
export class TeamFormsController {
  constructor(private readonly service: FormsService) {}

  @Get()
  @ApiOperation({ summary: 'List forms for a team' })
  @ApiParam({ name: 'teamId' })
  @ApiOkResponse({ description: 'Paginated forms.' })
  @Roles('organization_admin', 'super_admin', 'location_admin')
  async list(
    @CurrentUser() user: AuthUser,
    @Param('teamId') teamId: string,
    @Query() query: FindFormsQueryDto,
  ) {
    return this.service.list(user.organization_id!, null, {
      ...query,
      team_id: teamId,
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a form for a team' })
  @ApiParam({ name: 'teamId' })
  @ApiCreatedResponse({ type: FormEntity })
  @ApiBadRequestResponse()
  @ApiConflictResponse()
  @Roles('organization_admin', 'super_admin', 'location_admin')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: AuthUser,
    @Param('teamId') teamId: string,
    @Body() dto: CreateFormDto,
  ) {
    dto.team_id = teamId;
    const locationId = user.branch_id;
    if (!locationId) {
      throw new (await import('@nestjs/common')).BadRequestException({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'caller is not pinned to a location.',
        },
      });
    }
    return this.service.create(user.organization_id!, locationId, dto, user);
  }
}

@ApiTags('forms')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Controller('api/forms')
export class FormsController {
  constructor(private readonly service: FormsService) {}

  @Get()
  @ApiOperation({
    summary:
      'List forms for the caller. Use ?scope=org|location|me (default: scope=me for workers, org otherwise).',
  })
  @ApiOkResponse({ description: 'Paginated forms.' })
  @Roles('organization_admin', 'super_admin', 'location_admin', 'worker')
  async listAll(
    @CurrentUser() user: AuthUser,
    @Query() query: FindFormsQueryDto & { scope?: 'org' | 'location' | 'me' },
  ) {
    const scope = query.scope
      ? query.scope
      : user.role === 'worker'
        ? 'me'
        : user.role === 'location_admin' || user.role === 'branch_admin'
          ? 'location'
          : 'org';
    return this.service.list(
      user.organization_id!,
      user.branch_id ?? null,
      {
        ...query,
        scope,
      },
      user,
    );
  }

  @Get(':formId')
  @ApiOperation({ summary: 'Get a form by id' })
  @ApiParam({ name: 'formId' })
  @ApiOkResponse({ type: FormEntity })
  @ApiNotFoundResponse()
  @Roles('organization_admin', 'super_admin', 'location_admin', 'worker')
  async getOne(@CurrentUser() user: AuthUser, @Param('formId') formId: string) {
    return this.service.getById(user.organization_id!, formId, {
      isSuper: user.role === 'super_admin',
      branchId: user.branch_id ?? null,
    });
  }

  @Patch(':formId')
  @ApiOperation({
    summary: 'Update a form; bumps schema_version on published-form edit',
  })
  @ApiParam({ name: 'formId' })
  @ApiOkResponse({ type: FormEntity })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @Roles('organization_admin', 'super_admin', 'location_admin')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('formId') formId: string,
    @Body() dto: UpdateFormDto,
  ) {
    return this.service.update(user.organization_id!, formId, dto, user);
  }

  @Post(':formId/publish')
  @ApiOperation({ summary: 'Publish a draft form' })
  @ApiParam({ name: 'formId' })
  @ApiOkResponse({ type: FormEntity })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @Roles('organization_admin', 'super_admin', 'location_admin')
  async publish(
    @CurrentUser() user: AuthUser,
    @Param('formId') formId: string,
  ) {
    return this.service.publish(user.organization_id!, formId, user);
  }

  @Post(':formId/archive')
  @ApiOperation({ summary: 'Archive a form' })
  @ApiParam({ name: 'formId' })
  @ApiOkResponse({ type: FormEntity })
  @ApiNotFoundResponse()
  @Roles('organization_admin', 'super_admin', 'location_admin')
  async archive(
    @CurrentUser() user: AuthUser,
    @Param('formId') formId: string,
  ) {
    return this.service.archive(user.organization_id!, formId, user);
  }

  @Post(':formId/duplicate')
  @ApiOperation({ summary: 'Duplicate a form within the same team/location' })
  @ApiParam({ name: 'formId' })
  @ApiCreatedResponse({ type: FormEntity })
  @ApiNotFoundResponse()
  @Roles('organization_admin', 'super_admin', 'location_admin')
  @HttpCode(HttpStatus.CREATED)
  async duplicate(
    @CurrentUser() user: AuthUser,
    @Param('formId') formId: string,
  ) {
    return this.service.duplicate(user.organization_id!, formId, user);
  }

  @Post(':formId/clone')
  @ApiOperation({
    summary: 'Clone a form into a different team (cross-location)',
  })
  @ApiParam({ name: 'formId' })
  @ApiCreatedResponse({ type: FormEntity })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @Roles('organization_admin', 'super_admin', 'location_admin')
  @HttpCode(HttpStatus.CREATED)
  async clone(
    @CurrentUser() user: AuthUser,
    @Param('formId') formId: string,
    @Body() dto: CloneFormDto,
  ) {
    return this.service.cloneTo(user.organization_id!, formId, dto, user);
  }

  @Get(':formId/versions')
  @ApiOperation({
    summary: 'List form versions (snapshots before schema_version bumps)',
  })
  @ApiParam({ name: 'formId' })
  @ApiOkResponse({ type: [FormVersionEntity] })
  @ApiNotFoundResponse()
  @Roles('organization_admin', 'super_admin', 'location_admin')
  async versions(
    @CurrentUser() user: AuthUser,
    @Param('formId') formId: string,
  ) {
    return this.service.listVersions(user.organization_id!, formId);
  }

  @Get(':formId/responses')
  @ApiOperation({ summary: 'List responses for a form' })
  @ApiParam({ name: 'formId' })
  @ApiOkResponse({ type: [FormResponseEntity] })
  @ApiNotFoundResponse()
  @Roles('organization_admin', 'super_admin', 'location_admin')
  async responses(
    @CurrentUser() user: AuthUser,
    @Param('formId') formId: string,
    @Query('page') page: string = '1',
    @Query('per_page') perPage: string = '50',
  ) {
    return this.service.listResponses(
      user.organization_id!,
      formId,
      Number(page) || 1,
      Number(perPage) || 50,
    );
  }

  @Get(':formId/responses/export')
  @ApiOperation({ summary: 'Export form responses as CSV' })
  @ApiParam({ name: 'formId' })
  @ApiProduces('text/csv')
  @ApiOkResponse({ description: 'CSV file.' })
  @ApiNotFoundResponse()
  @Roles('organization_admin', 'super_admin', 'location_admin')
  async export(
    @CurrentUser() user: AuthUser,
    @Param('formId') formId: string,
    @Res() res: Response,
  ) {
    const csv = await this.service.exportResponsesCsv(
      user.organization_id!,
      formId,
    );
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="form-${formId}-responses.csv"`,
    );
    res.send(csv);
  }
}

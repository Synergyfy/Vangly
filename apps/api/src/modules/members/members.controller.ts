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
import { MembersService } from './members.service';
import {
  BulkImportDto,
  CreateMemberDto,
  FindMembersQueryDto,
  ResetPinRequestDto,
  TransferMemberDto,
  UpdateMemberDto,
} from './dto';
import { Roles, RolesGuard } from '../../auth/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { getIpAndUa } from '../../common/utils/request';
import { MemberEntity } from './entities/member.entity';

@ApiTags('members')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Controller('api/locations/:locationId/members')
export class LocationMembersController {
  constructor(private readonly service: MembersService) {}

  @Get()
  @ApiOperation({ summary: 'List members of a location' })
  @ApiParam({ name: 'locationId' })
  @ApiOkResponse({ description: 'Paginated members list.' })
  @ApiForbiddenResponse()
  @Roles('organization_admin', 'super_admin', 'location_admin')
  async list(
    @CurrentUser() user: AuthUser,
    @Param('locationId') locationId: string,
    @Query() query: FindMembersQueryDto,
  ) {
    return this.service.list(user.organization_id!, locationId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Add a member to the location' })
  @ApiParam({ name: 'locationId' })
  @ApiCreatedResponse({ type: MemberEntity })
  @ApiBadRequestResponse()
  @ApiConflictResponse()
  @ApiForbiddenResponse()
  @Roles('organization_admin', 'super_admin', 'location_admin')
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: AuthUser,
    @Param('locationId') locationId: string,
    @Body() dto: CreateMemberDto,
    @Req() req: Request,
  ) {
    const { ip, ua } = getIpAndUa(req);
    return this.service.create(user.organization_id!, locationId, dto, {
      id: user.sub,
      ip,
      ua,
    });
  }

  @Get('export')
  @ApiOperation({ summary: 'Export members of a location as CSV' })
  @ApiParam({ name: 'locationId' })
  @ApiProduces('text/csv')
  @ApiOkResponse({ description: 'CSV file.' })
  @Roles('organization_admin', 'super_admin', 'location_admin')
  async export(
    @CurrentUser() user: AuthUser,
    @Param('locationId') locationId: string,
    @Res() res: Response,
  ) {
    const csv = await this.service.exportCsv(user.organization_id!, locationId);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="members.csv"');
    res.send(csv);
  }
}

@ApiTags('members')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Controller('api/members')
export class MembersController {
  constructor(private readonly service: MembersService) {}

  @Get(':memberId')
  @ApiOperation({ summary: 'Get a member by id' })
  @ApiParam({ name: 'memberId' })
  @ApiOkResponse({ type: MemberEntity })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @Roles('organization_admin', 'super_admin', 'location_admin')
  async getOne(
    @CurrentUser() user: AuthUser,
    @Param('memberId') memberId: string,
  ) {
    return this.service.getById(user.organization_id!, memberId);
  }

  @Patch(':memberId')
  @ApiOperation({ summary: 'Update a member' })
  @ApiParam({ name: 'memberId' })
  @ApiOkResponse({ type: MemberEntity })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiConflictResponse()
  @Roles('organization_admin', 'super_admin', 'location_admin')
  async update(
    @CurrentUser() user: AuthUser,
    @Param('memberId') memberId: string,
    @Body() dto: UpdateMemberDto,
    @Req() req: Request,
  ) {
    const { ip, ua } = getIpAndUa(req);
    return this.service.update(user.organization_id!, memberId, dto, {
      id: user.sub,
      ip,
      ua,
    });
  }

  @Delete(':memberId')
  @ApiOperation({ summary: 'Remove a member from a location' })
  @ApiParam({ name: 'memberId' })
  @ApiOkResponse({ description: 'Member removed from location.' })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @Roles('organization_admin', 'super_admin', 'location_admin')
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('memberId') memberId: string,
    @Query('location_id') locationId: string,
    @Req() req: Request,
  ) {
    const { ip, ua } = getIpAndUa(req);
    if (!locationId) {
      throw new (await import('@nestjs/common')).BadRequestException({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'location_id is required.',
        },
      });
    }
    await this.service.delete(user.organization_id!, locationId, memberId, {
      id: user.sub,
      ip,
      ua,
    });
    return { ok: true };
  }

  @Post(':memberId/transfer')
  @ApiOperation({ summary: 'Transfer a member to a different location' })
  @ApiParam({ name: 'memberId' })
  @ApiOkResponse({ type: MemberEntity })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @Roles('organization_admin', 'super_admin', 'location_admin')
  async transfer(
    @CurrentUser() user: AuthUser,
    @Param('memberId') memberId: string,
    @Body() dto: TransferMemberDto,
    @Req() req: Request,
  ) {
    const { ip, ua } = getIpAndUa(req);
    return this.service.transfer(user.organization_id!, memberId, dto, {
      id: user.sub,
      ip,
      ua,
    });
  }

  @Post(':memberId/reset-pin')
  @ApiOperation({ summary: 'Start a PIN reset for a member (sends SMS OTP)' })
  @ApiParam({ name: 'memberId' })
  @ApiOkResponse({ description: 'OTP dispatched.' })
  @ApiNotFoundResponse()
  @Roles('organization_admin', 'super_admin', 'location_admin')
  async resetPin(
    @CurrentUser() user: AuthUser,
    @Param('memberId') memberId: string,
    @Req() req: Request,
  ) {
    const { ip, ua } = getIpAndUa(req);
    return this.service.resetPin(user.organization_id!, memberId, {
      id: user.sub,
      ip,
      ua,
    });
  }

  @Post(':memberId/reset-pin/verify')
  @ApiOperation({ summary: 'Verify the OTP and set a new PIN for a member' })
  @ApiParam({ name: 'memberId' })
  @ApiOkResponse({ description: 'PIN changed.' })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @Roles('organization_admin', 'super_admin', 'location_admin')
  async verifyResetPin(
    @CurrentUser() user: AuthUser,
    @Param('memberId') memberId: string,
    @Body() dto: ResetPinRequestDto,
    @Req() req: Request,
  ) {
    const { ip, ua } = getIpAndUa(req);
    if (!dto.otp || !dto.pin) {
      throw new (await import('@nestjs/common')).BadRequestException({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'otp and pin are required.',
        },
      });
    }
    return this.service.verifyResetPin(
      user.organization_id!,
      memberId,
      dto.otp,
      dto.pin,
      {
        id: user.sub,
        ip,
        ua,
      },
    );
  }
}

@ApiTags('members')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Controller('api/locations/:locationId/members')
export class LocationBulkMembersController {
  constructor(private readonly service: MembersService) {}

  @Post('bulk-import')
  @ApiOperation({ summary: 'Bulk-import members into a single team' })
  @ApiParam({ name: 'locationId' })
  @ApiCreatedResponse({
    description: 'Returns a job id; poll GET /api/jobs/:jobId.',
  })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @Roles('organization_admin', 'super_admin', 'location_admin')
  async bulkImport(
    @CurrentUser() user: AuthUser,
    @Param('locationId') locationId: string,
    @Body() dto: BulkImportDto,
    @Req() req: Request,
  ) {
    const { ip, ua } = getIpAndUa(req);
    return this.service.bulkImport(user.organization_id!, locationId, dto, {
      id: user.sub,
      ip,
      ua,
    });
  }
}

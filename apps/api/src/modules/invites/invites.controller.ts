import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { RolesGuard } from '../../auth/roles.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { getIpAndUa } from '../../common/utils/request';
import { paginationFromQuery } from '../../common/utils/paginated';
import { InvitesService } from './invites.service';
import {
  CreateInviteLinkDto,
  ShareInviteLinkDto,
  UpdateInviteLinkDto,
} from './dto/invite.dto';
import { InviteLinkEntity } from './entities/invite-link.entity';

@ApiTags('invites')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Controller('api/invites')
export class InvitesController {
  constructor(private readonly service: InvitesService) {}

  @Get()
  @ApiOperation({ summary: 'List invite links' })
  @ApiOkResponse({ type: InviteLinkEntity, isArray: true })
  async list(
    @CurrentUser() user: AuthUser,
    @Query() q: { page?: string; page_size?: string },
  ) {
    const { page, perPage: page_size } = paginationFromQuery(
      Number(q.page) || 1,
      Number(q.page_size) || 25,
      { maxPerPage: 100 },
    );
    return this.service.list(user, page, page_size);
  }

  @Get('me')
  @ApiOperation({
    summary: 'Get or create the caller\u2019s personal invite link',
  })
  @ApiOkResponse({ type: InviteLinkEntity })
  mine(@CurrentUser() user: AuthUser) {
    return this.service.getOrCreatePersonalLink(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get invite link' })
  @ApiOkResponse({ type: InviteLinkEntity })
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.get(user, id);
  }

  @Post()
  @ApiOperation({ summary: 'Create invite link' })
  @ApiCreatedResponse({ type: InviteLinkEntity })
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateInviteLinkDto,
    @Req() req: Request,
  ) {
    return this.service.create(user, dto, getIpAndUa(req));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update invite link' })
  @ApiOkResponse({ type: InviteLinkEntity })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateInviteLinkDto,
    @Req() req: Request,
  ) {
    return this.service.update(user, id, dto, getIpAndUa(req));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke/delete invite link' })
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    return this.service.remove(user, id, getIpAndUa(req));
  }

  @Post(':id/share')
  @ApiOperation({ summary: 'Share invite link via SMS/email/QR' })
  share(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: ShareInviteLinkDto,
    @Req() req: Request,
  ) {
    return this.service.share(user, id, dto, getIpAndUa(req));
  }

  @Get('track/:code')
  @ApiOperation({ summary: 'Track and decode invite link by code' })
  async track(@Param('code') code: string) {
    const res = await this.service.trackUse(code);
    if (!res) {
      throw new NotFoundException('Invite link not found or inactive');
    }
    return res;
  }
}

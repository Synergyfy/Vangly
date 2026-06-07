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
import { ContactsService } from './contacts.service';
import { ContactMatchService } from './contact-match.service';
import { ContactEntity } from './entities/contact.entity';
import {
  BulkCreateContactDto,
  CreateContactDto,
  ListContactsQueryDto,
  UpdateContactDto,
} from './dto/contact.dto';

@ApiTags('contacts')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Controller('api/contacts')
export class ContactsController {
  constructor(
    private readonly service: ContactsService,
    private readonly matcher: ContactMatchService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List contacts' })
  @ApiOkResponse({ type: ContactEntity, isArray: true })
  async list(
    @CurrentUser() user: AuthUser,
    @Query() query: ListContactsQueryDto,
  ) {
    const { page, perPage: page_size } = paginationFromQuery(
      Number(query.page) || 1,
      Number(query.page_size) || 25,
      { maxPerPage: 100 },
    );
    return this.service.list(user, query, page, page_size);
  }

  @Post()
  @ApiOperation({ summary: 'Create contact (idempotent on phone)' })
  @ApiCreatedResponse({ type: ContactEntity })
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateContactDto,
    @Req() req: Request,
  ) {
    return this.service.create(user, dto, getIpAndUa(req));
  }

  @Post('bulk')
  @ApiOperation({ summary: 'Bulk create contacts' })
  async bulkCreate(
    @CurrentUser() user: AuthUser,
    @Body() dto: BulkCreateContactDto,
    @Req() req: Request,
  ) {
    return this.service.bulkCreate(user, dto, getIpAndUa(req));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get contact' })
  @ApiOkResponse({ type: ContactEntity })
  async get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.get(user, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update contact' })
  @ApiOkResponse({ type: ContactEntity })
  async update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateContactDto,
    @Req() req: Request,
  ) {
    return this.service.update(user, id, dto, getIpAndUa(req));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete contact' })
  async remove(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    return this.service.remove(user, id, getIpAndUa(req));
  }
}

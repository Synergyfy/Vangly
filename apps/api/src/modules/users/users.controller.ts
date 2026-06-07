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
import { UsersService } from './users.service';
import {
  CreateUserDto,
  ListUsersQueryDto,
  UpdateUserDto,
} from './dto/user.dto';
import { AdminUserEntity } from './entities/admin-user.entity';

@ApiTags('users')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Controller('api/users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List users (org/branch scoped)' })
  @ApiOkResponse({ type: AdminUserEntity, isArray: true })
  async list(@CurrentUser() user: AuthUser, @Query() q: ListUsersQueryDto) {
    const { page, perPage: page_size } = paginationFromQuery(
      Number(q.page) || 1,
      Number(q.page_size) || 25,
      { maxPerPage: 100 },
    );
    return this.service.list(user, q, page, page_size);
  }

  @Post()
  @ApiOperation({ summary: 'Create user (admin/branch only)' })
  @ApiCreatedResponse({ type: AdminUserEntity })
  async create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateUserDto,
    @Req() req: Request,
  ) {
    return this.service.create(user, dto, getIpAndUa(req));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user' })
  @ApiOkResponse({ type: AdminUserEntity })
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.get(user, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiOkResponse({ type: AdminUserEntity })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @Req() req: Request,
  ) {
    return this.service.update(user, id, dto, getIpAndUa(req));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete user' })
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    return this.service.remove(user, id, getIpAndUa(req));
  }
}

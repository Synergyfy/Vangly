import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
import { DomainsService } from './domains.service';
import { CreateCustomDomainDto, UpdateCustomDomainDto } from './dto/domain.dto';
import { CustomDomainEntity } from './entities/custom-domain.entity';

@ApiTags('domains')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Controller('api/domains')
export class DomainsController {
  constructor(private readonly service: DomainsService) {}

  @Get()
  @ApiOperation({ summary: 'List custom domains' })
  @ApiOkResponse({ type: CustomDomainEntity, isArray: true })
  list(@CurrentUser() user: AuthUser) {
    return this.service.list(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get custom domain' })
  @ApiOkResponse({ type: CustomDomainEntity })
  get(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.get(user, id);
  }

  @Post()
  @ApiOperation({ summary: 'Add custom domain' })
  @ApiCreatedResponse({ type: CustomDomainEntity })
  create(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateCustomDomainDto,
    @Req() req: Request,
  ) {
    return this.service.create(user, dto, getIpAndUa(req));
  }

  @Post(':id/verify')
  @ApiOperation({ summary: 'Verify custom domain (mock)' })
  @ApiOkResponse({ type: CustomDomainEntity })
  verify(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    return this.service.verify(user, id, getIpAndUa(req));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update custom domain (note / ssl_status)' })
  @ApiOkResponse({ type: CustomDomainEntity })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateCustomDomainDto,
    @Req() req: Request,
  ) {
    return this.service.update(user, id, dto, getIpAndUa(req));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove custom domain' })
  remove(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    return this.service.remove(user, id, getIpAndUa(req));
  }
}

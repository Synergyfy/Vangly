import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
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
import { WalletService } from './wallet.service';
import { PurchaseSmsDto, TopupWalletDto } from './dto/wallet.dto';
import {
  WalletBalanceEntity,
  WalletLedgerEntity,
} from './entities/wallet.entity';

@ApiTags('wallet')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Controller('api/wallet')
export class WalletController {
  constructor(private readonly service: WalletService) {}

  @Get('balance')
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiOkResponse({ type: WalletBalanceEntity })
  balance(@CurrentUser() user: AuthUser) {
    return this.service.getBalance({
      ...user,
      organization_id: user.organization_id!,
      branch_id: user.branch_id ?? undefined,
      role: user.role ?? 'worker',
    });
  }

  @Get('transactions')
  @ApiOperation({ summary: 'List wallet transactions' })
  @ApiOkResponse({ type: WalletLedgerEntity })
  async transactions(
    @CurrentUser() user: AuthUser,
    @Query() q: { page?: string; page_size?: string },
  ) {
    const { page, perPage: page_size } = paginationFromQuery(
      Number(q.page) || 1,
      Number(q.page_size) || 50,
      { maxPerPage: 200 },
    );
    return this.service.listTransactions(
      {
        ...user,
        organization_id: user.organization_id!,
        branch_id: user.branch_id ?? undefined,
        role: user.role ?? 'worker',
      },
      page,
      page_size,
    );
  }

  @Post('topup')
  @ApiOperation({ summary: 'Top up wallet' })
  async topup(
    @CurrentUser() user: AuthUser,
    @Body() dto: TopupWalletDto,
    @Req() req: Request,
  ) {
    return this.service.topup(
      {
        ...user,
        organization_id: user.organization_id!,
        branch_id: user.branch_id ?? undefined,
        role: user.role ?? 'worker',
      },
      dto,
      getIpAndUa(req),
    );
  }

  @Post('sms-purchase')
  @ApiOperation({ summary: 'Convert personal credits into SMS credits' })
  async purchaseSms(
    @CurrentUser() user: AuthUser,
    @Body() dto: PurchaseSmsDto,
    @Req() req: Request,
  ) {
    return this.service.purchaseSms(
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

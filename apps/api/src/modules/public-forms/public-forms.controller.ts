import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { PublicFormsService } from './public-forms.service';
import {
  PublicFormEntity,
  PublicSubmitResultEntity,
  PublicScanEntity,
} from './entities/public-form.entity';
import { TrackScanDto, PublicSubmitDto } from './dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { AuthUser } from '../../common/decorators/current-user.decorator';
import { getIpAndUa } from '../../common/utils/request';
import { SkipThrottle } from '../../common/guards/throttler.guard';

@ApiTags('public-forms')
@Controller('f')
export class PublicFormsController {
  constructor(private readonly service: PublicFormsService) {}

  @Get(':publicId')
  @SkipThrottle()
  @ApiOperation({ summary: 'Get a published form by its 9-char public_id' })
  @ApiParam({ name: 'publicId' })
  @ApiOkResponse({ type: PublicFormEntity })
  @ApiNotFoundResponse()
  @ApiForbiddenResponse({
    description: 'Form not published, or requires sign-in.',
  })
  async getForm(
    @Param('publicId') publicId: string,
    @CurrentUser() user: AuthUser | null,
  ) {
    return this.service.getForm(publicId, user?.sub ?? null);
  }

  @Post(':publicId/track')
  @SkipThrottle()
  @ApiOperation({
    summary:
      'Generate a scan token after the QR is opened (recorded as a scan)',
  })
  @ApiParam({ name: 'publicId' })
  @ApiCreatedResponse({ type: PublicScanEntity })
  @ApiNotFoundResponse()
  @ApiBadRequestResponse()
  async trackScan(
    @Param('publicId') publicId: string,
    @Body() dto: TrackScanDto,
    @Req() req: Request,
  ) {
    const { ip, ua } = getIpAndUa(req);
    return this.service.requestScan(publicId, dto.scan_token, { ip, ua });
  }

  @Post(':publicId')
  @ApiOperation({ summary: 'Submit answers to a published form' })
  @ApiParam({ name: 'publicId' })
  @ApiCreatedResponse({ type: PublicSubmitResultEntity })
  @ApiBadRequestResponse()
  @ApiNotFoundResponse()
  @ApiForbiddenResponse()
  @UseGuards()
  @HttpCode(HttpStatus.CREATED)
  async submit(
    @Param('publicId') publicId: string,
    @Body() dto: PublicSubmitDto,
    @Req() req: Request,
    @CurrentUser() user: AuthUser | null,
  ) {
    const { ip, ua } = getIpAndUa(req);
    return this.service.submit(publicId, dto.answers ?? {}, {
      ip,
      ua,
      scanToken: dto.scan_token,
      userId: user?.sub ?? dto.user_id,
      workerId: dto.worker_id,
      workerName: dto.worker_name,
      locationId: dto.location_id,
      locationName: dto.location_name,
    });
  }
}

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
  Query,
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
import { MessagesService } from './messages.service';
import {
  CreateMessageTemplateDto,
  SendMessageDto,
  UpdateMessageTemplateDto,
} from './dto/message.dto';
import {
  MessageTemplateEntity,
  SendMessageResultEntity,
} from './entities/message.entity';

@ApiTags('messages')
@ApiBearerAuth('access-token')
@UseGuards(RolesGuard)
@Controller('api')
export class MessagesController {
  constructor(private readonly service: MessagesService) {}

  @Get('messages/templates')
  @ApiOperation({ summary: 'List message templates' })
  @ApiOkResponse({ type: MessageTemplateEntity, isArray: true })
  listTemplates(@CurrentUser() user: AuthUser) {
    return this.service.listTemplates(user);
  }

  @Post('messages/templates')
  @ApiOperation({ summary: 'Create message template' })
  @ApiCreatedResponse({ type: MessageTemplateEntity })
  createTemplate(
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateMessageTemplateDto,
    @Req() req: Request,
  ) {
    return this.service.createTemplate(user, dto, getIpAndUa(req));
  }

  @Get('messages/templates/:id')
  @ApiOperation({ summary: 'Get message template' })
  @ApiOkResponse({ type: MessageTemplateEntity })
  getTemplate(@CurrentUser() user: AuthUser, @Param('id') id: string) {
    return this.service.getTemplate(user, id);
  }

  @Patch('messages/templates/:id')
  @ApiOperation({ summary: 'Update message template' })
  @ApiOkResponse({ type: MessageTemplateEntity })
  updateTemplate(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Body() dto: UpdateMessageTemplateDto,
    @Req() req: Request,
  ) {
    return this.service.updateTemplate(user, id, dto, getIpAndUa(req));
  }

  @Delete('messages/templates/:id')
  @ApiOperation({ summary: 'Delete message template' })
  removeTemplate(
    @CurrentUser() user: AuthUser,
    @Param('id') id: string,
    @Req() req: Request,
  ) {
    return this.service.deleteTemplate(user, id, getIpAndUa(req));
  }

  @Post('messages/send')
  @ApiOperation({ summary: 'Send messages to recipients' })
  @ApiOkResponse({ type: SendMessageResultEntity })
  send(
    @CurrentUser() user: AuthUser,
    @Body() dto: SendMessageDto,
    @Req() req: Request,
  ) {
    return this.service.send(user, dto, getIpAndUa(req));
  }

  @Get('messages/history')
  @ApiOperation({ summary: 'Get message history' })
  listHistory(
    @CurrentUser() user: AuthUser,
    @Query() q: { page?: string; page_size?: string },
  ) {
    const page = Number(q.page) || 1;
    const pageSize = Number(q.page_size) || 20;
    return this.service.listHistory(user, page, pageSize);
  }
}

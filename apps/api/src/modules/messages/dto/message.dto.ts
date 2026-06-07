import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export const TEMPLATE_MODES = ['strict', 'flexible', 'open'] as const;
export type TemplateMode = (typeof TEMPLATE_MODES)[number];

export const TEMPLATE_CHANNELS = ['sms'] as const;
export type TemplateChannel = (typeof TEMPLATE_CHANNELS)[number];

export const TEMPLATE_SCOPES = ['organization', 'location'] as const;
export type TemplateScope = (typeof TEMPLATE_SCOPES)[number];

export class CreateMessageTemplateDto {
  @ApiProperty() @IsString() @MaxLength(120) name!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(1600)
  body!: string;

  @ApiPropertyOptional({ enum: TEMPLATE_MODES, default: 'flexible' })
  @IsOptional()
  @IsEnum(TEMPLATE_MODES)
  mode?: TemplateMode;

  @ApiPropertyOptional({ enum: TEMPLATE_CHANNELS, default: 'sms' })
  @IsOptional()
  @IsEnum(TEMPLATE_CHANNELS)
  channel?: TemplateChannel;

  @ApiPropertyOptional({ enum: TEMPLATE_SCOPES, default: 'organization' })
  @IsOptional()
  @IsEnum(TEMPLATE_SCOPES)
  scope?: TemplateScope;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  location_id?: string;

  @ApiPropertyOptional({
    description:
      'Map of placeholders, e.g. {"name":"[Name]","church":"[Church Name]"}',
    type: Object,
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  variables?: Record<string, string>;
}

export class UpdateMessageTemplateDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() body?: string;
  @ApiPropertyOptional({ enum: TEMPLATE_MODES })
  @IsOptional()
  @IsEnum(TEMPLATE_MODES)
  mode?: TemplateMode;
  @ApiPropertyOptional({ enum: TEMPLATE_SCOPES })
  @IsOptional()
  @IsEnum(TEMPLATE_SCOPES)
  scope?: TemplateScope;
  @ApiPropertyOptional() @IsOptional() @IsString() location_id?: string;
  @ApiPropertyOptional({ type: Object, additionalProperties: true })
  @IsOptional()
  @IsObject()
  variables?: Record<string, string>;
}

export class SendMessageRecipientDto {
  @ApiProperty()
  @IsString()
  @MaxLength(32)
  phone!: string;

  @ApiPropertyOptional() @IsOptional() @IsString() contact_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
}

export class SendMessageDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  template_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1600)
  body?: string;

  @ApiPropertyOptional({
    description: 'Variable values to substitute in the template body',
    type: Object,
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  variables?: Record<string, string>;

  @ApiProperty({ type: [SendMessageRecipientDto] })
  @IsArray()
  @ArrayMaxSize(2000)
  @ValidateNested({ each: true })
  @Type(() => SendMessageRecipientDto)
  recipients!: SendMessageRecipientDto[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  contact_id?: string;
}

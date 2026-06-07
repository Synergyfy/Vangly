import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export const CONTACT_STATUSES = ['invited', 'attended', 'lost'] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export class CreateContactDto {
  @ApiProperty({ example: 'Jane Doe' })
  @IsString()
  @MaxLength(120)
  name!: string;

  @ApiProperty({ example: '+2348012345678' })
  @IsString()
  @MaxLength(32)
  phone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  note?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  team_id?: string;
}

export class UpdateContactDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() note?: string;
  @ApiPropertyOptional({ enum: CONTACT_STATUSES })
  @IsOptional()
  @IsEnum(CONTACT_STATUSES)
  status?: ContactStatus;
}

export class BulkCreateContactItemDto extends CreateContactDto {}

export class BulkCreateContactDto {
  @ApiProperty({ type: [BulkCreateContactItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkCreateContactItemDto)
  contacts!: BulkCreateContactItemDto[];
}

export class ListContactsQueryDto {
  @ApiPropertyOptional({ enum: CONTACT_STATUSES })
  @IsOptional()
  @IsEnum(CONTACT_STATUSES)
  status?: ContactStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() team_id?: string;

  @ApiPropertyOptional() @IsOptional() @IsString() owner_user_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  page_size?: string;
}

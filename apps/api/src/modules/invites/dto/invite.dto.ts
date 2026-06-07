import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateInviteLinkDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  team_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  form_id?: string;

  @ApiPropertyOptional({ minimum: 0, default: 0, description: '0 = unlimited' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  max_uses?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expires_at?: string;
}

export class UpdateInviteLinkDto {
  @ApiPropertyOptional() @IsOptional() @IsString() status?:
    | 'active'
    | 'revoked';
  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  max_uses?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  expires_at?: string;
}

export class ShareInviteLinkDto {
  @ApiProperty()
  @IsString()
  channel!: 'sms' | 'email' | 'qr';

  @ApiProperty()
  @IsString()
  recipient!: string;
}

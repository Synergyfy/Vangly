import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString, MaxLength } from 'class-validator';

export class TrackScanDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  scan_token?: string;
}

export class PublicSubmitDto {
  @ApiProperty({ type: 'object', additionalProperties: true })
  @IsObject()
  answers!: Record<string, unknown>;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(64)
  scan_token?: string;

  @ApiPropertyOptional({ description: 'When distribution.mode=registered' })
  @IsOptional()
  @IsString()
  user_id?: string;
}

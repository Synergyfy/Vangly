import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateTeamDto {
  @ApiProperty({ example: 'Media Team' })
  @IsString()
  @Length(1, 100)
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  name!: string;

  @ApiPropertyOptional({ example: 'Handles all audio/visual needs.' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  is_public_joinable?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  allow_member_pin?: boolean;
}

export class UpdateTeamDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  is_public_joinable?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allow_member_pin?: boolean;
}

export class CloneTeamDto {
  @ApiProperty({ example: 'loc_01H...' })
  @IsString()
  source_location_id!: string;

  @ApiProperty({ example: 'Workers' })
  @IsString()
  @Length(1, 100)
  source_team_name!: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  import_members?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  import_forms?: boolean;
}

export class FindTeamsQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  team_id?: string;

  @ApiPropertyOptional({ enum: ['admin', 'operational', 'outreach', 'custom'] })
  @IsOptional()
  @IsIn(['admin', 'operational', 'outreach', 'custom'])
  kind?: 'admin' | 'operational' | 'outreach' | 'custom';

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page: number = 1;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  per_page: number = 50;
}

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';

const E164_REGEX = /^\+?[1-9]\d{1,14}$/;

export class CreateMemberDto {
  @ApiProperty({ example: 'Jane Member' })
  @IsString()
  @Length(1, 200)
  name!: string;

  @ApiProperty({ example: '+2348012345678' })
  @IsString()
  @Matches(E164_REGEX, { message: 'phone must be in E.164 format' })
  phone!: string;

  @ApiPropertyOptional({ example: 'jane@example.com' })
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @ApiPropertyOptional({ example: '123456', description: '4-6 digits' })
  @IsOptional()
  @IsString()
  @Length(4, 6)
  @Matches(/^\d+$/, { message: 'pin must be numeric' })
  pin?: string;

  @ApiProperty({ type: [String], example: ['team_01H...', 'team_01H...'] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  team_ids!: string[];

  @ApiPropertyOptional({
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  })
  @IsOptional()
  @IsIn(['active', 'inactive', 'suspended'])
  status?: 'active' | 'inactive' | 'suspended' = 'active';

  @ApiPropertyOptional({ type: [String], description: 'Subset of team_ids' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  is_team_admin?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assign_forms?: string[];
}

export class UpdateMemberDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 200)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(E164_REGEX, { message: 'phone must be in E.164 format' })
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  @MaxLength(254)
  email?: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'suspended'] })
  @IsOptional()
  @IsIn(['active', 'inactive', 'suspended'])
  status?: 'active' | 'inactive' | 'suspended';

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  is_team_admin?: string[];

  @ApiPropertyOptional({ example: '123456' })
  @IsOptional()
  @IsString()
  @Length(4, 6)
  @Matches(/^\d+$/, { message: 'pin must be numeric' })
  pin?: string;
}

export class FindMembersQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  q?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  team_id?: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive', 'suspended'] })
  @IsOptional()
  @IsIn(['active', 'inactive', 'suspended'])
  status?: 'active' | 'inactive' | 'suspended';

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page: number = 1;

  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  per_page: number = 50;
}

export class TransferMemberDto {
  @ApiProperty({ example: 'loc_01H...' })
  @IsString()
  to_location_id!: string;

  @ApiProperty({ type: [String], example: ['team_01H...'] })
  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  to_team_ids!: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  is_team_admin?: string[];
}

export class BulkImportRowDto {
  @ApiProperty({ example: 'John Doe' })
  @IsString()
  @Length(1, 200)
  name!: string;

  @ApiProperty({ example: '+2348012345678' })
  @IsString()
  @Matches(E164_REGEX, { message: 'phone must be in E.164 format' })
  phone!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  role?: string;
}

export class BulkImportDto {
  @ApiProperty({ example: 'team_01H...' })
  @IsString()
  team_id!: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive'], default: 'active' })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  default_status?: 'active' | 'inactive' = 'active';

  @ApiProperty({ type: [BulkImportRowDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkImportRowDto)
  rows!: BulkImportRowDto[];
}

export class ResetPinRequestDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(4, 6)
  @Matches(/^\d+$/, { message: 'pin must be numeric' })
  pin?: string;

  @ApiPropertyOptional({ description: 'OTP from the previous /reset-pin call' })
  @IsOptional()
  @IsString()
  otp?: string;
}

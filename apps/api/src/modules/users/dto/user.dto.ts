import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import { Type } from 'class-transformer';

const PHONE_REGEX = /^\+?[1-9]\d{6,14}$/;

export class CreateUserDto {
  @ApiProperty() @IsString() @MinLength(2) @MaxLength(80) name!: string;
  @ApiProperty({ example: '+2348012345678' })
  @Matches(PHONE_REGEX)
  phone!: string;

  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;

  @ApiProperty({
    enum: ['organization_admin', 'super_admin', 'location_admin', 'worker'],
  })
  @IsIn(['organization_admin', 'super_admin', 'location_admin', 'worker'])
  role!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  team_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  branch_id?: string;

  @ApiPropertyOptional({ minimum: 0, default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  credits?: number;
}

export class UpdateUserDto {
  @ApiPropertyOptional() @IsOptional() @IsString() name?: string;
  @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() team_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() branch_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() suspended?: boolean;
  @ApiPropertyOptional({ minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  credits?: number;
}

export class ListUsersQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() role?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() team_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() branch_id?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() status?:
    | 'active'
    | 'suspended';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  page?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  page_size?: string;
}

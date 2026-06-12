import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator';

export const FORM_FIELD_TYPES = [
  'text',
  'multiline',
  'number',
  'email',
  'phone',
  'rating',
  'single_choice',
  'multi_choice',
  'dropdown',
  'date',
  'signature',
  'photo',
  'barcode',
  'address',
] as const;

export type FormFieldType = (typeof FORM_FIELD_TYPES)[number];

export class FormFieldOptionDto {
  @ApiProperty()
  @IsString()
  @Length(1, 100)
  value!: string;

  @ApiProperty()
  @IsString()
  @Length(1, 200)
  label!: string;
}

export class FormFieldValidationDto {
  @ApiPropertyOptional() @IsOptional() @IsInt() @Min(0) min?: number;
  @ApiPropertyOptional() @IsOptional() @IsInt() @Max(10000) max?: number;
  @ApiPropertyOptional() @IsOptional() @IsString() pattern?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(400)
  message?: string;
}

export class FormFieldDto {
  @ApiProperty()
  @IsString()
  @Length(1, 100)
  key!: string;

  @ApiProperty()
  @IsString()
  @Length(1, 200)
  label!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsIn(FORM_FIELD_TYPES)
  type?: FormFieldType;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  required?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  placeholder?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  help_text?: string;

  @ApiPropertyOptional({ type: [FormFieldOptionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldOptionDto)
  options?: FormFieldOptionDto[];

  @ApiPropertyOptional({ type: FormFieldValidationDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FormFieldValidationDto)
  validation?: FormFieldValidationDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  meta?: Record<string, unknown>;
}

export class FormDistributionDto {
  @ApiPropertyOptional({ default: 'public' })
  @IsOptional()
  @IsIn(['public', 'registered', 'private'])
  mode?: 'public' | 'registered' | 'private';

  @ApiPropertyOptional({ default: 'all' })
  @IsOptional()
  @IsIn(['all', 'one_per_user', 'unlimited'])
  frequency?: 'all' | 'one_per_user' | 'unlimited';

  @ApiPropertyOptional({ description: 'ISO date string' })
  @IsOptional()
  @IsString()
  open_at?: string;

  @ApiPropertyOptional({ description: 'ISO date string' })
  @IsOptional()
  @IsString()
  close_at?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  send_sms_invites?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  sms_message?: string;
}

export class CreateFormDto {
  @ApiProperty()
  @IsString()
  @Length(1, 200)
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @ApiPropertyOptional({ example: 'team_01H...' })
  @IsOptional()
  @IsString()
  team_id?: string;

  @ApiProperty({ type: [FormFieldDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  @ArrayMinSize(1)
  fields!: FormFieldDto[];

  @ApiPropertyOptional({ type: FormDistributionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FormDistributionDto)
  distribution?: FormDistributionDto;
}

export class UpdateFormDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 200)
  title?: string;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;
  @ApiPropertyOptional({ type: [FormFieldDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FormFieldDto)
  fields?: FormFieldDto[];

  @ApiPropertyOptional({ type: FormDistributionDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => FormDistributionDto)
  distribution?: FormDistributionDto;
}

export class SubmitFormDto {
  @ApiProperty({ type: 'object', additionalProperties: true })
  @IsObject()
  answers!: Record<string, unknown>;
}

export class FindFormsQueryDto {
  @ApiPropertyOptional() @IsOptional() @IsString() team_id?: string;
  @ApiPropertyOptional({ enum: ['draft', 'published', 'archived'] })
  @IsOptional()
  @IsIn(['draft', 'published', 'archived'])
  status?: 'draft' | 'published' | 'archived';
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(100) q?: string;
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  page: number = 1;
  @ApiPropertyOptional({ default: 50 })
  @IsOptional()
  @Type(() => Number)
  per_page: number = 50;
}

export class CloneFormDto {
  @ApiProperty({ example: 'team_01H...' })
  @IsString()
  target_team_id!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 200)
  new_title?: string;
}

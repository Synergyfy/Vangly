import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

const PIN_REGEX = /^\d{4,6}$/;

export class SetupPinDto {
  @ApiProperty()
  @IsString()
  @Matches(PIN_REGEX, { message: 'PIN must be 4 to 6 digits' })
  new_pin!: string;

  @ApiPropertyOptional({ description: 'Required if user already has a PIN' })
  @IsOptional()
  @IsString()
  @Matches(PIN_REGEX, { message: 'current_pin must be 4 to 6 digits' })
  current_pin?: string;
}

export class UpdateMeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;
}

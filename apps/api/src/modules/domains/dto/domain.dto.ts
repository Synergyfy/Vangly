import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsFQDN,
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCustomDomainDto {
  @ApiProperty({ example: 'forms.acme.org' })
  @IsFQDN({ require_tld: true })
  domain!: string;
}

export class UpdateCustomDomainDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(280)
  note?: string;

  @ApiPropertyOptional({
    enum: ['none', 'provisioning', 'active', 'failed'],
    description: 'Update SSL provisioning status',
  })
  @IsOptional()
  @IsIn(['none', 'provisioning', 'active', 'failed'])
  ssl_status?: 'none' | 'provisioning' | 'active' | 'failed';
}

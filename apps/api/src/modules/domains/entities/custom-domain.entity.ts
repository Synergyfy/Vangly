import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CustomDomainEntity {
  @Expose() @ApiProperty() id!: string;
  @Expose() @ApiProperty() organization_id!: string;
  @Expose() @ApiProperty() domain!: string;
  @Expose()
  @ApiProperty({ enum: ['pending', 'verifying', 'active', 'failed'] })
  status!: string;
  @Expose() @ApiProperty() verification_token!: string;
  @Expose()
  @ApiPropertyOptional({ nullable: true })
  verified_at?: string;
  @Expose()
  @ApiProperty({ enum: ['none', 'active'] })
  ssl_status!: string;
  @Expose()
  @ApiPropertyOptional({ nullable: true })
  dns_instructions?: Record<string, string>;
  @Expose() @ApiProperty() created_at!: string;
  @Expose() @ApiProperty() updated_at!: string;
}

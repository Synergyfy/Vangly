import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class ContactEntity {
  @Expose() @ApiProperty() id!: string;
  @Expose() @ApiProperty() organization_id!: string;
  @Expose()
  @ApiPropertyOptional({ nullable: true })
  location_id?: string;
  @Expose()
  @ApiPropertyOptional({ nullable: true })
  owner_user_id?: string;
  @Expose()
  @ApiPropertyOptional({ nullable: true })
  source_user_id?: string;
  @Expose() @ApiProperty() name!: string;
  @Expose() @ApiProperty() phone!: string;
  @Expose()
  @ApiPropertyOptional({ nullable: true })
  email?: string;
  @Expose()
  @ApiPropertyOptional({ nullable: true })
  note?: string;
  @Expose()
  @ApiProperty({ enum: ['invited', 'attended', 'lost'] })
  status!: string;
  @Expose() @ApiProperty() source_kind!: string;
  @Expose()
  @ApiPropertyOptional({ nullable: true })
  last_messaged_at?: string;
  @Expose() @ApiProperty() created_at!: string;
  @Expose() @ApiProperty() updated_at!: string;
}

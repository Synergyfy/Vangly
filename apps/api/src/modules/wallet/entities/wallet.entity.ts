import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class WalletBalanceEntity {
  @Expose() @ApiProperty() owner_type!: 'user' | 'location';
  @Expose()
  @ApiPropertyOptional({ nullable: true })
  owner_id?: string;
  @Expose() @ApiProperty() balance!: number;
  @Expose() @ApiProperty() currency!: string;
}

@Exclude()
export class WalletTransactionEntity {
  @Expose() @ApiProperty() id!: string;
  @Expose() @ApiProperty() organization_id!: string;
  @Expose()
  @ApiProperty({ enum: ['user', 'location'] })
  owner_type!: string;
  @Expose()
  @ApiPropertyOptional({ nullable: true })
  owner_user_id?: string;
  @Expose()
  @ApiPropertyOptional({ nullable: true })
  owner_location_id?: string;
  @Expose() @ApiProperty() delta!: number;
  @Expose() @ApiProperty() balance_after!: number;
  @Expose() @ApiProperty() kind!: string;
  @Expose()
  @ApiPropertyOptional({ nullable: true })
  ref_id?: string;
  @Expose()
  @ApiPropertyOptional({ nullable: true })
  location_id?: string;
  @Expose()
  @ApiPropertyOptional({ nullable: true })
  actor_user_id?: string;
  @Expose()
  @ApiPropertyOptional({ nullable: true })
  description?: string;
  @Expose() @ApiProperty() created_at!: string;
}

@Exclude()
export class WalletLedgerEntity {
  @Expose()
  @ApiProperty({ type: [WalletTransactionEntity] })
  @Type(() => WalletTransactionEntity)
  data!: WalletTransactionEntity[];
  @Expose() @ApiProperty() total!: number;
  @Expose() @ApiProperty() page!: number;
  @Expose() @ApiProperty() page_size!: number;
  @Expose() @ApiProperty() total_pages!: number;
}

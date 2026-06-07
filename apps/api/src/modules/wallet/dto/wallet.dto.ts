import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export const TXN_KINDS = [
  'topup',
  'purchase_sms',
  'send_sms',
  'refund',
  'promo',
] as const;
export type WalletTxnKind = (typeof TXN_KINDS)[number];

export class TopupWalletDto {
  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  amount!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  ref_id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(280)
  description?: string;

  @ApiProperty({
    enum: ['user', 'location'],
    description: 'Whose wallet to credit',
  })
  @IsIn(['user', 'location'])
  owner_type!: 'user' | 'location';

  @ApiPropertyOptional({ description: 'Required when owner_type=location' })
  @IsOptional()
  @IsString()
  location_id?: string;
}

export class PurchaseSmsDto {
  @ApiProperty({ minimum: 1 })
  @IsInt()
  @Min(1)
  sms_count!: number;

  @ApiProperty()
  @IsString()
  location_id!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(280)
  description?: string;
}

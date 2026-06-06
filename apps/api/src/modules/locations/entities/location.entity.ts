import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class LocationStatsEntity {
  @Expose() @ApiProperty({ example: 4 }) teams!: number;
  @Expose() @ApiProperty({ example: 145 }) members!: number;
  @Expose() @ApiProperty({ example: 87 }) submissions_30d!: number;
}

@Exclude()
export class LocationEntity {
  @Expose() @ApiProperty({ example: 'loc_01H...' }) id!: string;
  @Expose() @ApiProperty({ example: 'org_01H...' }) organization_id!: string;
  @Expose() @ApiProperty({ example: 'HQ Downtown' }) name!: string;
  @Expose()
  @ApiProperty({
    example: '12 Redemption Way',
    required: false,
    nullable: true,
  })
  address?: string;
  @Expose() @ApiProperty({ example: 'Lagos' }) city!: string;
  @Expose()
  @ApiProperty({ example: 'Lagos', required: false, nullable: true })
  state?: string;
  @Expose()
  @ApiProperty({ example: 'NG', required: false, nullable: true })
  country?: string;
  @Expose()
  @ApiProperty({
    example: 'A small satellite for youth outreach.',
    required: false,
    nullable: true,
  })
  description?: string;
  @Expose()
  @ApiProperty({
    example: 'https://cdn.vangly.app/.../photo.webp',
    required: false,
    nullable: true,
  })
  photo_url?: string;
  @Expose() @ApiProperty({ example: true }) is_hq!: boolean;
  @Expose() @ApiProperty({ enum: ['active', 'paused', 'archived'] }) status!:
    | 'active'
    | 'paused'
    | 'archived';
  @Expose()
  @ApiProperty({ enum: ['High', 'Medium', 'Low'] })
  activity!: 'High' | 'Medium' | 'Low';
  @Expose()
  @ApiProperty({ type: LocationStatsEntity })
  @Type(() => LocationStatsEntity)
  stats!: LocationStatsEntity;
  @Expose()
  @ApiProperty({ example: '2025-11-01T09:12:00.000Z' })
  created_at!: string;
  @Expose()
  @ApiProperty({ example: '2025-11-01T09:12:00.000Z' })
  updated_at!: string;

  static fromPrisma(row: Record<string, unknown>): LocationEntity {
    return Object.assign(new LocationEntity(), row);
  }
}

import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class LocationStatsEntity {
  @Expose() @ApiProperty({ example: 4 }) teams!: number;
  @Expose() @ApiProperty({ example: 145 }) members!: number;
  @Expose() @ApiProperty({ example: 87 }) submissions_30d!: number;
}

@Exclude()
export class LocationPhotoEntity {
  @Expose() @ApiProperty() photo_url!: string;

  static fromUrl(photoUrl: string): LocationPhotoEntity {
    return Object.assign(new LocationPhotoEntity(), { photo_url: photoUrl });
  }
}

@Exclude()
export class LocationWithStatsEntity {
  @Expose() @ApiProperty() id!: string;
  @Expose() @ApiProperty() organization_id!: string;
  @Expose() @ApiProperty() name!: string;
  @Expose() @ApiProperty({ required: false, nullable: true }) address?: string;
  @Expose() @ApiProperty() city!: string;
  @Expose() @ApiProperty({ required: false, nullable: true }) state?: string;
  @Expose() @ApiProperty({ required: false, nullable: true }) country?: string;
  @Expose()
  @ApiProperty({ required: false, nullable: true })
  description?: string;
  @Expose()
  @ApiProperty({ required: false, nullable: true })
  photo_url?: string;
  @Expose() @ApiProperty() is_hq!: boolean;
  @Expose() @ApiProperty({ enum: ['active', 'paused', 'archived'] }) status!:
    | 'active'
    | 'paused'
    | 'archived';
  @Expose()
  @ApiProperty({ enum: ['High', 'Medium', 'Low'] })
  activity!: 'High' | 'Medium' | 'Low';
  @Expose()
  @ApiProperty({ type: LocationStatsEntity })
  stats!: LocationStatsEntity;
  @Expose() @ApiProperty() created_at!: string;
  @Expose() @ApiProperty() updated_at!: string;
}

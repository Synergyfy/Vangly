import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, IsUrl } from 'class-validator';

export class LocationPhotoDto {
  @ApiProperty({
    example: 'https://cdn.vangly.app/org_abc/locations/loc_xyz/photo.webp',
  })
  @IsString()
  @IsUrl({ require_tld: false })
  @MaxLength(2000)
  photo_url!: string;
}

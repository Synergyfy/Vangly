import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class MessageTemplateEntity {
  @Expose() @ApiProperty() id!: string;
  @Expose() @ApiProperty() organization_id!: string;
  @Expose()
  @ApiProperty({ enum: ['organization', 'location'] })
  scope!: string;
  @Expose()
  @ApiPropertyOptional({ nullable: true })
  location_id?: string;
  @Expose() @ApiProperty() name!: string;
  @Expose()
  @ApiProperty({ enum: ['sms'] })
  channel!: string;
  @Expose() @ApiProperty() body!: string;
  @Expose()
  @ApiPropertyOptional({ nullable: true })
  variables?: Record<string, string>;
  @Expose()
  @ApiProperty({ enum: ['strict', 'flexible', 'open'] })
  mode!: string;
  @Expose() @ApiProperty() created_by!: string;
  @Expose() @ApiProperty() created_at!: string;
  @Expose() @ApiProperty() updated_at!: string;
}

@Exclude()
export class SendMessageResultEntity {
  @Expose() @ApiProperty() total!: number;
  @Expose() @ApiProperty() sent!: number;
  @Expose() @ApiProperty() failed!: number;
  @Expose()
  @ApiProperty({
    type: 'array',
    items: {
      type: 'object',
      properties: {
        phone: { type: 'string' },
        ok: { type: 'boolean' },
        error: { type: 'string' },
      },
    },
  })
  results!: Array<{ phone: string; ok: boolean; error?: string }>;
}

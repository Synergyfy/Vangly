import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class MemberEntity {
  @Expose() @ApiProperty() id!: string;
  @Expose() @ApiProperty() name!: string;
  @Expose() @ApiProperty() phone!: string;
  @Expose() @ApiProperty({ required: false, nullable: true }) email?: string;
  @Expose()
  @ApiProperty({ enum: ['active', 'inactive', 'suspended'] })
  status!: 'active' | 'inactive' | 'suspended';
  @Expose() @ApiProperty({ type: [String] }) roles!: string[];
  @Expose() @ApiProperty({ type: [String] }) team_admins!: string[];
  @Expose() @ApiProperty() invites_count!: number;
  @Expose() @ApiProperty() created_at!: string;

  static fromRow(row: Record<string, unknown>): MemberEntity {
    return Object.assign(new MemberEntity(), row);
  }
}

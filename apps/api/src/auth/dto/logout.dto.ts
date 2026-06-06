import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class LogoutDto {
  @IsOptional()
  @IsString()
  refresh_token?: string;

  @IsOptional()
  @IsBoolean()
  everywhere?: boolean;
}

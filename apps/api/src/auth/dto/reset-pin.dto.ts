import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class ResetPinDto {
  @IsNotEmpty()
  @IsString()
  onboarding_token!: string;

  @IsNotEmpty()
  @IsString()
  @Length(4, 6)
  @Matches(/^\d+$/, { message: 'pin must be numeric' })
  pin!: string;
}

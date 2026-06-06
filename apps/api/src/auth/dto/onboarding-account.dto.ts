import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class OnboardingAccountDto {
  @IsNotEmpty()
  @IsString()
  onboarding_token!: string;

  @IsNotEmpty()
  @IsString()
  organization_name!: string;

  @IsNotEmpty()
  @IsString()
  admin_name!: string;

  @IsNotEmpty()
  @IsString()
  @Length(4, 6)
  @Matches(/^\d+$/, { message: 'pin must be numeric' })
  pin!: string;
}

import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class OnboardingBrandDto {
  @IsNotEmpty()
  @IsString()
  onboarding_token!: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'primary_color must be a valid hex color starting with #',
  })
  primary_color!: string;
}

import { IsNotEmpty, IsString } from 'class-validator';

export class OnboardingLocationDto {
  @IsNotEmpty()
  @IsString()
  onboarding_token!: string;

  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  address!: string;

  @IsNotEmpty()
  @IsString()
  city!: string;

  @IsNotEmpty()
  @IsString()
  state!: string;

  @IsNotEmpty()
  @IsString()
  country!: string;
}

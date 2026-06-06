import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class OnboardingSubdomainDto {
  @IsNotEmpty()
  @IsString()
  onboarding_token!: string;

  @IsNotEmpty()
  @IsString()
  @Length(3, 30)
  @Matches(/^[a-z0-9-]+$/, {
    message: 'subdomain must be lowercase alphanumeric or hyphens',
  })
  subdomain!: string;
}

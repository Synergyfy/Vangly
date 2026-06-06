import { IsNotEmpty, Matches } from 'class-validator';

export class ForgotPinDto {
  @IsNotEmpty()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'phone must be in E.164 format' })
  phone!: string;
}

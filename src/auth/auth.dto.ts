import { IsEmail, IsString, Length, IsNotEmpty } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class StudentLoginDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @Length(4, 4)
  pin: string;
}

export class RefreshDto {
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

export class ChangePasswordDto {
  @IsString()
  oldPassword: string;

  @IsString()
  newPassword: string;
}

export class ForgotPasswordDto {
  @IsEmail()
  email: string;

  @IsString()
  recoveryCode: string;

  @IsString()
  password: string;
}

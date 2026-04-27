import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @Length(6)
  password: string;
}

export class CreateStudentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @Length(4, 4)
  pin: string;

  @IsMongoId()
  classId: string;
}

export class ResetPinDto {
  @IsString()
  @Length(4, 4)
  pin: string;
}

export class ResetPasswordDto {
  @IsString()
  @Length(6)
  password: string;
}

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;
}

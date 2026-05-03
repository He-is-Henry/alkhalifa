import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsArray,
  IsOptional,
  IsDateString,
} from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  @IsNotEmpty()
  childFullName: string;

  @IsString()
  @IsNotEmpty()
  gender: string;

  @IsDateString()
  @IsNotEmpty()
  dateOfBirth: string;

  @IsString()
  @IsOptional()
  stateOfOrigin?: string;

  @IsString()
  @IsNotEmpty()
  religion: string;

  @IsString()
  @IsOptional()
  previousSchool?: string;

  @IsString()
  @IsNotEmpty()
  parentTitle: string;

  @IsString()
  @IsNotEmpty()
  parentName: string;

  @IsString()
  @IsOptional()
  fatherNationality?: string;

  @IsString()
  @IsOptional()
  fatherStateOfOrigin?: string;

  @IsString()
  @IsOptional()
  fatherOccupation?: string;

  @IsString()
  @IsOptional()
  fatherPhone?: string;

  @IsEmail()
  @IsOptional()
  fatherEmail?: string;

  @IsString()
  @IsOptional()
  motherNationality?: string;

  @IsString()
  @IsOptional()
  motherStateOfOrigin?: string;

  @IsString()
  @IsOptional()
  motherOccupation?: string;

  @IsString()
  @IsOptional()
  motherPhone?: string;

  @IsEmail()
  @IsOptional()
  motherEmail?: string;

  @IsString()
  @IsNotEmpty()
  residentialAddress: string;

  @IsString()
  @IsNotEmpty()
  childLivesWith: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  illnesses?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  inoculations?: string[];

  @IsString()
  @IsOptional()
  otherVaccinations?: string;

  @IsString()
  @IsOptional()
  hospitalAdmissions?: string;

  @IsString()
  @IsOptional()
  surgicalOperations?: string;

  @IsString()
  @IsOptional()
  otherConditions?: string;

  @IsString()
  @IsNotEmpty()
  whyAlkhalifah: string;
}

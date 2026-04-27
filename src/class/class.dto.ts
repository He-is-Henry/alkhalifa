import { IsEnum, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(['lower', 'upper'])
  level: string;

  @IsNumber()
  @Min(1)
  order: number;
}

export class UpdateClassDto {
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsEnum(['lower', 'upper'])
  level?: string;

  @IsNumber()
  @Min(1)
  order?: number;
}

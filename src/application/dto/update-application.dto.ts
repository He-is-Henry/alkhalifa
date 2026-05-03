import { IsNotEmpty, IsString } from 'class-validator';

export class UpdateApplicationDto {
  @IsString()
  @IsNotEmpty()
  status: string;
}

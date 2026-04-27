import { Transform } from 'class-transformer';
import {
  IsArray,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

export class CreateNoteDto {
  @IsMongoId()
  classId: string;

  @IsMongoId()
  subjectId: string;

  @IsNumber()
  @Min(1)
  @Max(3)
  term: number;

  @IsNumber()
  @Min(1)
  @Max(10)
  weekNum: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  objectives?: string[];

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  summary?: string;
}

export class UpdateNoteDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  title?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  objectives?: string[];

  @IsString()
  @IsOptional()
  content?: string;

  @IsString()
  @IsOptional()
  summary?: string;
}

export class NoteQueryDto {
  @IsMongoId()
  classId: string;

  @IsMongoId()
  subjectId: string;

  @Transform(({ value }: { value: string }) => Number(value))
  @IsNumber()
  @Min(1)
  @Max(3)
  term: number;
}

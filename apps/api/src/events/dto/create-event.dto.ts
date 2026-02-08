import {
  IsString,
  IsInt,
  Min,
  MinLength,
  IsISO8601,
} from 'class-validator';

export class CreateEventDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsString()
  @MinLength(1)
  description!: string;

  @IsISO8601()
  dateTime!: string;

  @IsString()
  @MinLength(1)
  location!: string;

  @IsInt()
  @Min(1)
  maxCapacity!: number;
}

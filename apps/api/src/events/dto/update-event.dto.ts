import {
  IsString,
  IsInt,
  Min,
  MinLength,
  IsISO8601,
  IsOptional,
  IsEnum,
} from 'class-validator';
import { EventStatus } from '../../generated/prisma/enums';

export class UpdateEventDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  title?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  description?: string;

  @IsOptional()
  @IsISO8601()
  dateTime?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  location?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxCapacity?: number;

  @IsOptional()
  @IsEnum(EventStatus)
  status?: EventStatus;
}

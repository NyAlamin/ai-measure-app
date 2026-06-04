import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ScanMeasurementDto {
  @IsNotEmpty({ message: 'Height is required.' })
    @Type(() => Number)
    @IsNumber()
    @Min(120, { message: 'Height must be at least 120 cm.' })
    @Max(220, { message: 'Height must be at most 220 cm.' })
    height!: number;

  @IsNotEmpty()
    @IsString()
    garment!: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  weight?: number;
}
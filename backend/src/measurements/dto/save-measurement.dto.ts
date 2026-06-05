import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MeasurementsData {
  @IsNumber()
  shoulder!: number;
  @IsNumber()
  bust!: number;
  @IsNumber()
  waist!: number;
  @IsNumber()
  hip!: number;
  @IsNumber()
  neck!: number;
  @IsNumber()
  sleeve!: number;
  @IsNumber()
  armLength!: number;
  @IsNumber()
  bicep!: number;
  @IsNumber()
  wrist!: number;
  @IsNumber()
  kameezLength!: number;
  @IsNumber() @Min(0) @Max(1)
  confidence!: number;

  @IsOptional()
  @IsNumber()
  bodyHeight?: number;
}

export class BasicInfoData {
  @IsNotEmpty({ message: 'Name is required.' })
  @IsString()
  name!: string;

  @IsNumber()
  @Min(120)
  @Max(220)
  height!: number;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsNumber()
  weight?: number;
}

export class SaveMeasurementDto {
  @IsNotEmpty()
  @IsString()
  garment!: string;

  @ValidateNested()
  @Type(() => BasicInfoData)
  info!: BasicInfoData;

  @ValidateNested()
  @Type(() => MeasurementsData)
  measurements!: MeasurementsData;
}
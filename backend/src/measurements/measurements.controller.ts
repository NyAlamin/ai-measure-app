import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { MeasurementsService } from './measurements.service';
import { ScanMeasurementDto } from './dto/scan-measurement.dto';
import { SaveMeasurementDto } from './dto/save-measurement.dto';

@Controller('measurements')
export class MeasurementsController {
  constructor(private readonly measurementsService: MeasurementsService) {}

  /**
   * POST /measurements/scan
   * Multipart upload: video file + height + garment + optional gender/weight
   * Returns AI-generated measurements. Video is deleted immediately.
   */
  @Post('scan')
  @UseInterceptors(
    FileInterceptor('video', {
      storage: diskStorage({
        destination: process.env.UPLOAD_DIR || './uploads/temp',
        filename: (_req, file, cb) => {
          const uniqueName = `${uuidv4()}${extname(file.originalname) || '.webm'}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: 52428800, // 50 MB
      },
      fileFilter: (_req, file, cb) => {
        const allowed = [
          'video/webm',
          'video/mp4',
          'video/quicktime',
          'video/x-msvideo',
        ];
        if (allowed.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException({
              code: 'upload_failed',
              message: `Invalid file type: ${file.mimetype}`,
            }),
            false,
          );
        }
      },
    }),
  )
  async scan(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: ScanMeasurementDto,
  ) {
    return this.measurementsService.scanVideo(file, dto);
  }

  /**
   * POST /measurements
   * Save reviewed/edited measurements to the database.
   */
  @Post()
  async save(@Body() dto: SaveMeasurementDto) {
    return this.measurementsService.saveMeasurements(dto);
  }

  /**
   * GET /measurements
   * List all saved measurement profiles.
   */
  @Get()
  async findAll() {
    return this.measurementsService.getAllProfiles();
  }

  /**
   * GET /measurements/:id
   * Get a single measurement profile.
   */
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const profile = await this.measurementsService.getProfileById(id);
    if (!profile) {
      throw new NotFoundException({
        code: 'not_found',
        message: 'Measurement profile not found.',
      });
    }
    return profile;
  }
}
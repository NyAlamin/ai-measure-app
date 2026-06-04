import {
  Injectable,
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MeasurementProfile } from './entities/measurement-profile.entity';
import { ScanMeasurementDto } from './dto/scan-measurement.dto';
import { SaveMeasurementDto } from './dto/save-measurement.dto';
import axios from 'axios';
import * as fs from 'fs';
import FormData = require('form-data');

export interface AiMeasurements {  shoulder: number;
  bust: number;
  waist: number;
  hip: number;
  neck: number;
  sleeve: number;
  armLength: number;
  bicep: number;
  wrist: number;
  kameezLength: number;
  confidence: number;
  bodyHeight?: number;
}

@Injectable()
export class MeasurementsService {
  private readonly logger = new Logger(MeasurementsService.name);
  private readonly aiServiceUrl: string;

  constructor(
    @InjectRepository(MeasurementProfile)
    private readonly profileRepo: Repository<MeasurementProfile>,
  ) {
    this.aiServiceUrl =
      process.env.AI_SERVICE_URL || 'http://localhost:8000';
  }

  async scanVideo(
    file: Express.Multer.File,
    dto: ScanMeasurementDto,
  ): Promise<AiMeasurements> {
    if (!file) {
      throw new BadRequestException({
        code: 'upload_failed',
        message: 'No video file was uploaded.',
      });
    }

    const allowedMimes = [
      'video/webm',
      'video/mp4',
      'video/quicktime',
      'video/x-msvideo',
    ];
    if (!allowedMimes.includes(file.mimetype)) {
      this.deleteFile(file.path);
      throw new BadRequestException({
        code: 'upload_failed',
        message: `Invalid file type: ${file.mimetype}. Please upload a video.`,
      });
    }

    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '52428800', 10);
    if (file.size > maxSize) {
      this.deleteFile(file.path);
      throw new BadRequestException({
        code: 'upload_failed',
        message: 'Video is too large. Maximum size is 50 MB.',
      });
    }

    try {
      // Send actual video file to AI service (not just a path)
      const formData = new FormData();
      formData.append('video', fs.createReadStream(file.path), {
        filename: file.originalname || 'scan.webm',
        contentType: file.mimetype,
      });
      formData.append('height', String(dto.height));

      const response = await axios.post<AiMeasurements>(
        `${this.aiServiceUrl}/analyze-video`,
        formData,
        {
          headers: formData.getHeaders(),
          timeout: 120000,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        },
      );

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const data = error.response.data;
        const detail = data.detail || data;
        const code = typeof detail === 'object' ? detail.code : 'unknown';
        const message =
          typeof detail === 'object' ? detail.message : 'AI analysis failed.';
        throw new BadRequestException({
          code: code || 'unknown',
          message: message || 'AI analysis failed.',
        });
      }

      this.logger.error('AI service call failed', error);
      throw new InternalServerErrorException({
        code: 'unknown',
        message: 'Could not analyze the video. Please try again.',
      });
    } finally {
      this.deleteFile(file.path);
    }
  }

  async saveMeasurements(
    dto: SaveMeasurementDto,
  ): Promise<MeasurementProfile> {
    const profile = this.profileRepo.create({
      garment: dto.garment,
      name: dto.info.name,
      height: dto.info.height,
      gender: dto.info.gender,
      weight: dto.info.weight,
      shoulder: dto.measurements.shoulder,
      bust: dto.measurements.bust,
      waist: dto.measurements.waist,
      hip: dto.measurements.hip,
      neck: dto.measurements.neck,
      sleeve: dto.measurements.sleeve,
      armLength: dto.measurements.armLength,
      bicep: dto.measurements.bicep,
      wrist: dto.measurements.wrist,
      kameezLength: dto.measurements.kameezLength,
      confidence: dto.measurements.confidence,
    });

    return this.profileRepo.save(profile);
  }

  async getAllProfiles(): Promise<MeasurementProfile[]> {
    return this.profileRepo.find({
      order: { createdAt: 'DESC' },
    });
  }

  async getProfileById(id: string): Promise<MeasurementProfile | null> {
    return this.profileRepo.findOneBy({ id });
  }

  private deleteFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log(`Deleted temp file: ${filePath}`);
      }
    } catch (err) {
      this.logger.error(`Failed to delete file: ${filePath}`, err);
    }
  }
}
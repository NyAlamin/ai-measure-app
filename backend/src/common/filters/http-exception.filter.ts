import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let body: { code: string; message: string } = {
      code: 'unknown',
      message: 'An unexpected error occurred.',
    };

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exResponse = exception.getResponse();

      if (typeof exResponse === 'object' && exResponse !== null) {
        const obj = exResponse as Record<string, any>;
        body = {
          code: obj.code || 'unknown',
          message: obj.message || exception.message,
        };
        // Handle class-validator errors
        if (Array.isArray(obj.message)) {
          body.message = obj.message[0];
        }
      } else {
        body.message = String(exResponse);
      }
    } else {
      this.logger.error('Unhandled exception', exception);
    }

    response.status(status).json(body);
  }
}
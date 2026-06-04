import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap, catchError, throwError } from 'rxjs';
import * as fs from 'fs';

@Injectable()
export class CleanupInterceptor implements NestInterceptor {
  private readonly logger = new Logger(CleanupInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const file = request.file;

    return next.handle().pipe(
      catchError((err) => {
        // If the handler threw and the file still exists, clean it up
        if (file?.path) {
          this.deleteFile(file.path);
        }
        return throwError(() => err);
      }),
    );
  }

  private deleteFile(filePath: string): void {
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        this.logger.log(`Cleanup interceptor deleted: ${filePath}`);
      }
    } catch (err) {
      this.logger.error(`Cleanup failed: ${filePath}`, err);
    }
  }
}
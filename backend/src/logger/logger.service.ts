// src/logger/logger.service.ts

import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LoggerService {
  private readonly logger: winston.Logger;

  constructor(configService: ConfigService) {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(), // Add timestamp
        winston.format.printf(({ timestamp, ...info }) => {
          // Customize log message format
          return JSON.stringify({ timestamp, ...info }); // Include timestamp as the first property
        }),
      ),
      transports: [
        new winston.transports.Console(),
        new DailyRotateFile({
          filename: 'logs/log-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: configService.get<string>('MAX_LOG_FILESIZE'),
        }),
      ],
    });
  }

  log(message: string, requestId: string) {
    this.logger.log('info', `${requestId} ${message}`);
  }

  error(message: string, trace: string, requestId: string) {
    this.logger.error(`${requestId} ${message}`, trace);
  }

  warn(message: string, requestId: string) {
    this.logger.warn(`${requestId} ${message}`);
  }

  debug(message: string, requestId: string) {
    this.logger.debug(`${requestId} ${message}`);
  }
}

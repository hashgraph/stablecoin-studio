// src/logger/logger.service.ts

import { Injectable } from '@nestjs/common';
import * as winston from 'winston';
import * as DailyRotateFile from 'winston-daily-rotate-file';
import { ConfigService } from '@nestjs/config';
import LogMessageDTO from './dto/log-message.dto.js';

@Injectable()
export class LoggerService {
  private readonly logger: winston.Logger;

  constructor(configService: ConfigService) {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(), // Add timestamp
        winston.format.printf(({ timestamp, level, ...info }) => {
          // Construct log message object with nested properties
          const logMessage = {
            timestamp,
            level,
            ...info,
          };
          return JSON.stringify(logMessage); // Convert log message object to JSON string
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

  log(message: LogMessageDTO) {
    this.logger.log('info', `${JSON.stringify(message)}`);
  }

  error(message: LogMessageDTO) {
    this.logger.error(`${message}`);
  }

  warn(message: LogMessageDTO) {
    this.logger.warn(`${message}`);
  }

  debug(message: LogMessageDTO) {
    this.logger.debug(`${message}`);
  }
}

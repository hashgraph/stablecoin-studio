import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../logger/logger.service';
import LogMessageDTO from '../logger/dto/log-message.dto.js';
import { REQUEST_ID_HTTP_HEADER } from '../common/Constants.js';

@Injectable()
export class OriginGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private readonly loggerService: LoggerService,
  ) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    // Multiple origins can be separated by comma
    const origins = this.configService.get<string>('ORIGIN').split(',');

    const request = context.switchToHttp().getRequest();
    const origin = request.headers['origin'];

    const isAllowed = origins.some((allowedOrigin) => {
      const pattern = new RegExp(`^${allowedOrigin.replace('*', '.*')}$`);
      return pattern.test(origin);
    });

    this.loggerService.log(
      new LogMessageDTO(
        request[REQUEST_ID_HTTP_HEADER],
        'Request allowed',
        isAllowed,
      ),
    );

    return isAllowed;
  }
}

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../logger/logger.service';

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
      `Request allowed : ${isAllowed}`,
      request['requestId'],
    );

    return isAllowed;
  }
}

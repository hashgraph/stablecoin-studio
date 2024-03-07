import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OriginGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

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

    return isAllowed;
  }
}

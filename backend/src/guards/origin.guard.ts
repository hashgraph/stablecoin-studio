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
    const origin = request.headers['access-control-allow-origin'];

    // Assuming origin is expected to be 'domain.com'
    return origins.includes(origin);
    // If the origin is not as expected, you can choose to throw an error
    // or return false to reject the request
    // throw new Error('Unauthorized origin');
  }
}

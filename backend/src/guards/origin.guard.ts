/*
 *
 * Hedera Stablecoin SDK
 *
 * Copyright (C) 2023 Hedera Hashgraph, LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Observable } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { LoggerService } from '../logger/logger.service';
import LogMessageDTO from '../logger/dto/log-message.dto';
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

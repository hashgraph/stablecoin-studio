import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid'; // Import v4 as uuidv4
import { REQUEST_ID_HTTP_HEADER } from '../common/Constants.js';

// Logger middleware
@Injectable()
export class RequestIDMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const requestId = uuidv4(); // Generate unique request ID
    req[REQUEST_ID_HTTP_HEADER] = requestId; // Attach request ID to request object
    next();
  }
}

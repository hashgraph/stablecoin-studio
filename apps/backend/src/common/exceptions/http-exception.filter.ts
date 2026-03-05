import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import {
  InvalidSignatureException,
  InvalidTransactionUUIDException,
  MessageAlreadySignedException,
  TransactionNotFoundException,
  UnauthorizedKeyException,
} from './domain-exceptions';

@Catch(Error)
@Catch(HttpException)
@Catch(
  HttpException,
  InvalidTransactionUUIDException,
  TransactionNotFoundException,
  MessageAlreadySignedException,
  UnauthorizedKeyException,
  InvalidSignatureException,
)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = exception.message;

    if (exception instanceof InvalidTransactionUUIDException) {
      status = HttpStatus.BAD_REQUEST;
    } else if (exception instanceof TransactionNotFoundException) {
      status = HttpStatus.NOT_FOUND;
    } else if (exception instanceof MessageAlreadySignedException) {
      status = HttpStatus.CONFLICT;
    } else if (exception instanceof UnauthorizedKeyException) {
      status = HttpStatus.UNAUTHORIZED;
    } else if (exception instanceof InvalidSignatureException) {
      status = HttpStatus.BAD_REQUEST;
    }

    response.status(status).json({
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: message,
    });
  }
}

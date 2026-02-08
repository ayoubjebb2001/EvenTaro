import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const { statusCode, message, error } = this.normalizeException(exception);

    this.logger.warn(
      `HTTP ${statusCode} - ${message}${error ? ` (${error})` : ''}`,
    );

    response.status(statusCode).json({
      statusCode,
      message,
      error: error ?? undefined,
    });
  }

  private normalizeException(exception: unknown): ErrorResponse {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const message =
        typeof res === 'object' && res !== null && 'message' in res
          ? (res as { message: string | string[] }).message
          : exception.message;
      return {
        statusCode: status,
        message: Array.isArray(message) ? message[0] : message,
        error: exception.name,
      };
    }

    if (
      typeof exception === 'object' &&
      exception !== null &&
      'code' in exception &&
      (exception as { code: string }).code?.startsWith?.('P')
    ) {
      const prismaError = exception as { code: string };
      switch (prismaError.code) {
        case 'P2002': {
          return {
            statusCode: HttpStatus.CONFLICT,
            message: 'A record with this value already exists.',
            error: 'Conflict',
          };
        }
        case 'P2025':
          return {
            statusCode: HttpStatus.NOT_FOUND,
            message: 'Record not found.',
            error: 'Not Found',
          };
        default:
          return {
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
            message: 'A database error occurred.',
            error: 'Internal Server Error',
          };
      }
    }

    if (
      exception instanceof Error &&
      exception.name === 'PrismaClientValidationError'
    ) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Invalid data provided.',
        error: 'Bad Request',
      };
    }

    if (exception instanceof Error) {
      return {
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message || 'Internal server error',
        error: 'Internal Server Error',
      };
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Internal server error',
      error: 'Internal Server Error',
    };
  }
}

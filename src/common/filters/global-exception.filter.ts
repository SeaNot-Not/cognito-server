import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import { ZodValidationException } from "nestjs-zod";
import { PinoLogger } from "nestjs-pino";
import { HttpResponse } from "src/types/response.types";
import configuration from "src/config/env.config";

@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(GlobalExceptionFilter.name);
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const { nodeEnv } = configuration();

    const isProd = nodeEnv === "PROD";
    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let errors: any = null;

    // Handle Zod validation errors
    if (exception instanceof ZodValidationException) {
      statusCode = HttpStatus.BAD_REQUEST;
      message = "Validation failed";
      const zodResponse = exception.getResponse() as any;

      errors = zodResponse.errors.map((err: any) => ({
        path: err.path.join("."),
        message: err.message,
        code: err.code,
      }));

      this.logger.warn({
        msg: "Validation failed",
        statusCode,
        path: request.url,
        method: request.method,
        errors,
      });
    }

    // Handle JWT errors
    else if (exception instanceof TokenExpiredError) {
      statusCode = HttpStatus.UNAUTHORIZED;
      message = "Access Denied: Session expired";

      this.logger.warn({
        msg: message,
        statusCode,
        path: request.url,
        method: request.method,
      });
    } else if (exception instanceof JsonWebTokenError) {
      statusCode = HttpStatus.UNAUTHORIZED;
      message = "Access Denied: Invalid token";

      this.logger.warn({
        msg: message,
        statusCode,
        path: request.url,
        method: request.method,
      });
    }

    // Handle NestJS HTTP exceptions
    else if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === "string") {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === "object") {
        message = (exceptionResponse as any).message || message;
        errors = (exceptionResponse as any).errors || null;
      }

      if (statusCode >= 500) {
        this.logger.error({
          msg: message,
          statusCode,
          path: request.url,
          method: request.method,
          stack: exception.stack,
        });
      } else if (statusCode >= 400) {
        this.logger.warn({
          msg: message,
          statusCode,
          path: request.url,
          method: request.method,
        });
      }
    }

    // Handle generic errors
    else if (exception instanceof Error) {
      message = isProd ? "Internal server error" : exception.message;

      this.logger.error({
        msg: "Unhandled error",
        error: exception.message,
        statusCode,
        path: request.url,
        method: request.method,
        stack: exception.stack,
      });
    }

    const httpResponse: HttpResponse = {
      success: false,
      data: null,
      message,
      statusCode,
      ...(errors && { errors }),
    };

    response.status(statusCode).json(httpResponse);
  }
}

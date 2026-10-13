import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Injectable,
} from "@nestjs/common";
import { Response, Request } from "express";
import { QueryFailedError } from "typeorm";

@Injectable()
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";

    // Determine the status code and message based on the exception type
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.getResponse() as string;
    } else if (exception instanceof QueryFailedError) {
      if (
        exception.message.includes(
          "duplicate key value violates unique constraint",
        )
      ) {
        status = HttpStatus.CONFLICT;
        message = "Conflict: Duplicate entry detected";
      } else {
        status = HttpStatus.BAD_REQUEST;
        message = "Database error occurred: " + exception.message;
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log the error for debugging purposes
    console.error(`HTTP ${status} Error: ${message}`, exception);

    // Send a response with the error details
    response.status(status).json({
      statusCode: status,
      message: message,
      timestamp: new Date().toISOString(),
      path: request.url,
    });
  }
}

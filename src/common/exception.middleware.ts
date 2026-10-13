import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";

@Injectable()
export class ExceptionHandlingMiddleware implements NestMiddleware {
  private logger = new Logger("ExceptionHandling");
  use(req: Request, res: Response, next: NextFunction): void {
    try {
      next(); // Pass control to the next middleware or route handler
    } catch (err) {
      this.handleException(err, req, res);
    }
  }

  private handleException(err: any, req: Request, res: Response): void {
    const statusCode = err.status || 500;
    const message = err.message || "Internal server error";
    console.log("======", err);
    this.logger.error(`HTTP ${statusCode} Error: ${message}`, err.stack);
    res.status(statusCode).json({
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: req.url,
    });
  }
}

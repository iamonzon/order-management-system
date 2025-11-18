import { Request, Response, NextFunction, Express } from "express";
import { AppError } from "../types/app-error";
import { StatusCodes } from "http-status-codes";

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);

  const isDev = process.env.NODE_ENV?.toLowerCase() !== 'production';

  // Known application errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      ...(err.details && { details: err.details }),
      ...(isDev && { stack: err.stack?.split('\n').map(line => line.trim()) })
    });
  }

  // Unknown errors (database crashes, syntax errors, etc.)
  res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
    error: isDev ? err.message : 'Internal server error',
    ...(isDev && { stack: err.stack?.split('\n').map(line => line.trim()) })
  });
};
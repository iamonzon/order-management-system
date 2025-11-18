import { StatusCodes } from "http-status-codes";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id: string) {
    super(StatusCodes.NOT_FOUND, `${resource} [${id}] not found`)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(StatusCodes.BAD_REQUEST, message, details)
  }
}

export class UnprocessableEntityError extends AppError {
  constructor(message: string, details?: any) {
    super(StatusCodes.UNPROCESSABLE_ENTITY, message, details)
  }
}
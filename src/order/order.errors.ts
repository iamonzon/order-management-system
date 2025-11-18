import { StatusCodes } from "http-status-codes";
import { AppError } from "../types/app-error";

export class OrderNotFoundError extends AppError {
  constructor(public readonly orderId: number) {
    super(
      StatusCodes.NOT_FOUND,
      `Order with id ${orderId} not found`
    );
  }
}

export class InvalidOrderDataError extends AppError {
  constructor(message: string, details?: any) {
    super(StatusCodes.BAD_REQUEST, message, details);
  }
}
import { StatusCodes } from "http-status-codes";
import { AppError } from "../types/app-error";

export class ProductNotFoundError extends AppError {
  constructor(public readonly productId: number) {
    super(
      StatusCodes.NOT_FOUND,
      `Product with id ${productId} not found`
    )
  }
}

export class NegativeProductPriceError extends AppError {
  constructor(
    public readonly productName: string,
    public readonly price: number) {
    super(
      StatusCodes.BAD_REQUEST,
      `Product with name ${productName} is not price positive: ${price}`
    )
  }
}

export class NegativeProductStock extends AppError {
  constructor(
   public readonly productName: string,
    public readonly stock_quantity: number) {
    super(
      StatusCodes.BAD_REQUEST,
      `Product with name ${productName} is not stock_quantity positive: ${stock_quantity}`
    )
  }
}


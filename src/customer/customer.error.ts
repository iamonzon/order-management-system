import { AppError } from '../types/app-error';
import { StatusCodes } from 'http-status-codes';

export class CustomerNotFoundError extends AppError {
  constructor(public readonly customerId: number) {
    super(
      StatusCodes.NOT_FOUND,
      `Customer with id ${customerId} not found`
    );
  }
}

export class DuplicateCustomerError extends AppError {
  constructor(public readonly email: string) {
    super(
      StatusCodes.UNPROCESSABLE_ENTITY,
      `Customer with email ${email} already exists`
    );
  }
}
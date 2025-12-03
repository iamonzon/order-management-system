import { Request, Response } from "express";
import { CustomerService } from "./customer.service";
import { StatusCodes } from "http-status-codes";
import { parsePaginationParams } from "../types/pagination";

export class CustomerController {
  constructor(private customerService: CustomerService) { }

  async createCustomer(req: Request, res: Response): Promise<void> {
    const customer = await this.customerService.createCustomer(req.body);
    res.status(StatusCodes.CREATED).json(customer);
  }

  async findCustomer(req: Request, res: Response): Promise<void> {
    const customer = await this.customerService.findById(Number(req.params.id));
    res.status(StatusCodes.OK).json(customer);
  }

  async listCustomers(req: Request, res: Response): Promise<void> {
    const pagination = parsePaginationParams(req.query as { page?: string; limit?: string });
    const result = await this.customerService.list(pagination);
    res.status(StatusCodes.OK).json(result);
  }
}
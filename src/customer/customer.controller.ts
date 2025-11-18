import { Request, Response } from "express";
import { CustomerService } from "./customer.service";
import { StatusCodes } from "http-status-codes";

export class CustomerController {
  constructor(private customerService: CustomerService){}

  async createCustomer(req: Request, res: Response) {
    const customer = this.customerService.createCustomer(req.body)
    res.status(StatusCodes.CREATED).json(customer)
  }
}
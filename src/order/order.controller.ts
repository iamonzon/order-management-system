import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { OrderService } from "./order.service";

export class OrderController {
  constructor(private orderService: OrderService) { }

  async findOrder(req: Request, res: Response): Promise<void> {
    const order = await this.orderService.findOrder(req.params.id);
    res.status(StatusCodes.OK).json(order)
  }

  async createOrder(req: Request, res: Response): Promise<void> {
    const order = await this.orderService.createOrder(req.body);
    res.status(StatusCodes.CREATED).json(order)
  }
}

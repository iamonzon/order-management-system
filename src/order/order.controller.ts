import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { OrderService } from "./order.service";
import { parsePaginationParams } from "../types/pagination";

export class OrderController {
  constructor(private orderService: OrderService) { }

  async findOrder(req: Request, res: Response): Promise<void> {
    const order = await this.orderService.findOrder(Number(req.params.id));
    res.status(StatusCodes.OK).json(order);
  }

  async listOrders(req: Request, res: Response): Promise<void> {
    const pagination = parsePaginationParams(req.query as { page?: string; limit?: string });
    const result = await this.orderService.list(pagination);
    res.status(StatusCodes.OK).json(result);
  }

  async createOrder(req: Request, res: Response): Promise<void> {
    const order = await this.orderService.createOrder(req.body);
    res.status(StatusCodes.CREATED).json(order);
  }
}

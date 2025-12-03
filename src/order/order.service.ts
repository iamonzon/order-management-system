import { CreateOrderDTO } from "./order.dto";
import { Order } from "./order";
import { OrderRepository } from "./order.repository";
import { PaginatedResult, PaginationParams } from "../types/pagination";

export class OrderService {
  constructor(private repository: OrderRepository) { }

  async createOrder(orderData: CreateOrderDTO): Promise<Order> {
    return this.repository.createOrder({
      customer_id: orderData.customer_id,
      items: orderData.items,
    });
  }

  async findOrder(id: number): Promise<Order> {
    return this.repository.findOrder(id);
  }

  async list(params: PaginationParams): Promise<PaginatedResult<Order>> {
    return this.repository.findAll(params.page, params.limit);
  }
}
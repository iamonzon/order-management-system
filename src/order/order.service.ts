import { CreateOrderDTO } from "./order.dto";
import { Order } from "./order";
import { OrderRepository } from "./order.repository";

export class OrderService {
  constructor(private repository: OrderRepository) { }

  async createOrder(orderData: CreateOrderDTO): Promise<Order> {
    return this.repository.createOrder({
      customer_id: orderData.customer_id,
      items: orderData.items,
    });
  }

  async findOrder(id: number): Promise<Order> {
    return this.repository.findOrder(id)
  }
}
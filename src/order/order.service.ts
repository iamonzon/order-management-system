import { CreateOrderDTO } from "./order.dto";
import { Order, OrderItem } from "./order";
import { OrderRepository } from "./order.repository";

export class OrderService {
  constructor(private repository: OrderRepository) { }

  async createOrder(orderData: CreateOrderDTO): Promise<Order> {
    const total = this.calculateTotal(orderData.items)

    return this.repository.createOrder({
      customer_id: orderData.customer_id,
      items: orderData.items,
      total
    })
  }

  async findOrder(id: number): Promise<Order> {
    return this.repository.findOrder(id)
  }

  private calculateTotal(items: OrderItem[]): number {
    return items.reduce((sum: number, item: OrderItem) =>
      sum + (item.price * item.quantity), 0
    )
  }
}
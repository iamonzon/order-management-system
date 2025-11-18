import { z } from 'zod';
import { OrderItem } from './order';

export const CreateOrderItemsSchema: z.ZodType<OrderItem> = z.object({
  product_name: z.string().min(1).max(255),
  quantity: z.number().int().positive().max(1000),
  price: z.number().positive(),
})

export const CreateOrderSchema = z.object({
  customer_id: z.int(),
  items: z.array(CreateOrderItemsSchema).min(1, "Order must have at least 1 item")
})

export type CreateOrderDTO = z.infer<typeof CreateOrderSchema>


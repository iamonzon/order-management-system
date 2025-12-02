import { z } from 'zod';
import { OrderItem } from './order';

export const CreateOrderItemsSchema: z.ZodType<OrderItem> = z.object({
  product_id: z.number().int().positive(),
  quantity: z.number().int().positive().max(1000),
})

export const CreateOrderSchema = z.object({
  customer_id: z.number().int().positive(),
  items: z.array(CreateOrderItemsSchema).min(1, "Order must have at least 1 item")
})

export type CreateOrderDTO = z.infer<typeof CreateOrderSchema>


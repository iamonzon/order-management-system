import { z } from 'zod';


export const CreateProductSchema = z.object({
  name: z.string().min(1).max(255),
  price: z.number().positive(),
  stock_quantity: z.number().int().nonnegative(),
});

export type CreateProductDTO = z.infer<typeof CreateProductSchema>;

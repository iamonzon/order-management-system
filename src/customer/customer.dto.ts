import {z} from 'zod';

const CreateCustomerSchema = z.object({
  email: z.email().max(255),
  name: z.string().max(255)
})

export type CreateCustomerDTO = z.infer<typeof CreateCustomerSchema>
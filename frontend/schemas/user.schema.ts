import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  surname: z.string().min(1, 'Surname is required').max(255),
  gender: z.enum(['male', 'female', 'other'], {
    message: 'Please select a gender',
  }),
  isTrusted: z.boolean().default(false),
});

export const userResponseSchema = createUserSchema.extend({
  id: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;

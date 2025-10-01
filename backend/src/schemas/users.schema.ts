import { z } from 'zod';

// Request/Response schemas for users endpoint

// GET /api/users - Query parameters
export const getUsersQuerySchema = z
  .object({
    limit: z.string().regex(/^\d+$/).transform(Number).optional(),
    offset: z.string().regex(/^\d+$/).transform(Number).optional(),
  })
  .optional();

// POST /api/users - Request body
export const createUserBodySchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  surname: z.string().min(1, 'Surname is required').max(255),
  gender: z.enum(['male', 'female', 'other'], {
    errorMap: () => ({ message: 'Gender must be male, female, or other' }),
  }),
  isTrusted: z.boolean().default(false),
});

// GET /api/users/:id - Path parameters
export const getUserParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

// PUT /api/users/:id - Request body
export const updateUserBodySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  surname: z.string().min(1).max(255).optional(),
  gender: z.enum(['male', 'female', 'other']).optional(),
  isTrusted: z.boolean().optional(),
});

// DELETE /api/users/:id - Path parameters
export const deleteUserParamSchema = z.object({
  id: z.string().regex(/^\d+$/, 'ID must be a number').transform(Number),
});

// Response schemas
export const userResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  surname: z.string(),
  gender: z.enum(['male', 'female', 'other']),
  isTrusted: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const usersListResponseSchema = z.array(userResponseSchema);

export const errorResponseSchema = z.object({
  error: z.string(),
  details: z.any().optional(),
});

export const deleteSuccessResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

// Type exports
export type GetUsersQuery = z.infer<typeof getUsersQuerySchema>;
export type CreateUserBody = z.infer<typeof createUserBodySchema>;
export type GetUserParam = z.infer<typeof getUserParamSchema>;
export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;
export type DeleteUserParam = z.infer<typeof deleteUserParamSchema>;
export type UserResponse = z.infer<typeof userResponseSchema>;
export type UsersListResponse = z.infer<typeof usersListResponseSchema>;
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export type DeleteSuccessResponse = z.infer<typeof deleteSuccessResponseSchema>;
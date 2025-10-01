// JSON Schema definitions for Swagger documentation
// These mirror the Zod schemas in users.schema.ts

export const userSchema = {
  type: 'object',
  properties: {
    id: { type: 'number' },
    name: { type: 'string' },
    surname: { type: 'string' },
    gender: { type: 'string', enum: ['male', 'female', 'other'] },
    isTrusted: { type: 'boolean' },
    createdAt: { type: 'string', format: 'date-time' },
    updatedAt: { type: 'string', format: 'date-time' },
  },
} as const;

export const createUserSchema = {
  type: 'object',
  required: ['name', 'surname', 'gender'],
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 255 },
    surname: { type: 'string', minLength: 1, maxLength: 255 },
    gender: { type: 'string', enum: ['male', 'female', 'other'] },
    isTrusted: { type: 'boolean', default: false },
  },
} as const;

export const updateUserSchema = {
  type: 'object',
  properties: {
    name: { type: 'string', minLength: 1, maxLength: 255 },
    surname: { type: 'string', minLength: 1, maxLength: 255 },
    gender: { type: 'string', enum: ['male', 'female', 'other'] },
    isTrusted: { type: 'boolean' },
  },
} as const;

export const userIdParamSchema = {
  type: 'object',
  required: ['id'],
  properties: {
    id: { type: 'string', pattern: '^\\d+$' },
  },
} as const;

export const errorSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
  },
} as const;

export const validationErrorSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
    details: { type: 'array' },
  },
} as const;

export const deleteSuccessSchema = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    message: { type: 'string' },
  },
} as const;
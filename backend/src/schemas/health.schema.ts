import { z } from 'zod';

// Health check response schema
export const healthResponseSchema = z.object({
  status: z.enum(['ok', 'error']),
  timestamp: z.string(),
  uptime: z.number(),
});

export type HealthResponse = z.infer<typeof healthResponseSchema>;

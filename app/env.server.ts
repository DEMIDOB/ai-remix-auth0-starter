// app/env.server.ts
import { z } from 'zod'

const envSchema = z
  .object({
    SUPER_ADMIN_EMAIL: z.string().email().optional(),
    DB_HOST: z.string().optional(),
    DB_PORT: z.coerce.number().optional(),
    DB_USER: z.string().optional(),
    DB_PASSWORD: z.string().optional(),
    DB_NAME: z.string().optional()
  })
  .passthrough()

export const env = envSchema.parse(process.env)

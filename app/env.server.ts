// app/env.server.ts
import { z } from 'zod'

const envSchema = z.object({
  SUPER_ADMIN_EMAIL: z.string().email().optional()
})

export const env = envSchema.parse(process.env)

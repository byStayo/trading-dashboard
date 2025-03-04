import { z } from 'zod'

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.enum(['user', 'admin']),
  permissions: z.array(z.string()).default([])
})

export type User = z.infer<typeof UserSchema> 
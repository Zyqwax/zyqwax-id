import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  OAUTH_LOGIN_URL: z.string().url().optional(),
  DEVELOPER_PORTAL_CLIENT_ID: z.string().min(1).optional(),
}).refine((values) => values.JWT_ACCESS_SECRET !== values.JWT_REFRESH_SECRET, {
  message: 'JWT access ve refresh secret farklı olmalıdır',
});

let cached: z.infer<typeof envSchema> | null = null;

/** Server-only configuration; never import this module from a client component. */
export function getServerEnv() {
  if (!cached) {
    const result = envSchema.safeParse(process.env);
    if (!result.success) throw new Error('Sunucu ortamı yapılandırması geçersiz');
    cached = result.data;
  }
  return cached;
}

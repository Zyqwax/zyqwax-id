import { z } from 'zod';

const reservedUsernames = new Set(['admin', 'api', 'root', 'support', 'help', 'null', 'undefined']);

// Kullanıcı adını tek biçime indirir ve rezervli/tehlikeli adları reddeder.
export const usernameSchema = z.string().trim().toLowerCase()
  .min(3, 'Kullanıcı adı en az 3 karakter olmalı.')
  .max(20, 'Kullanıcı adı en fazla 20 karakter olmalı.')
  .regex(/^[a-z][a-z0-9_]*$/, 'Kullanıcı adı küçük harfle başlamalı; yalnızca küçük harf, rakam ve alt çizgi içermeli.')
  .refine((value) => !value.includes('__'), 'Kullanıcı adında ardışık alt çizgi kullanılamaz.')
  .refine((value) => !reservedUsernames.has(value), 'Bu kullanıcı adı rezerve edilmiş.');

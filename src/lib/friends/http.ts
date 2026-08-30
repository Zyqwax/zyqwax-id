import { NextResponse } from 'next/server';
import type { User } from '@prisma/client';

// Arkadaşlık yanıtlarında yalnızca herkese açık profil alanlarını döndürür.
export function publicFriend(user: Pick<User, 'id' | 'username' | 'name' | 'avatarUrl'>) {
  return { id: user.id, username: user.username, name: user.name, avatarUrl: user.avatarUrl };
}

export function ok(message = 'işlem başarılı') {
  return NextResponse.json({ message });
}

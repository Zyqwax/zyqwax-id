import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getUserFromRefreshToken, ServiceError } from './auth-service';
import { requirePerm } from './roles';

export async function requireAdminPage(): Promise<void> {
  try {
    const token = (await cookies()).get('refreshToken')?.value;
    if (!token) throw new ServiceError(401, 'oturum gerekli');
    const user = await getUserFromRefreshToken(token);
    await requirePerm(user.id, 'admin.access');
  } catch (error) {
    if (error instanceof ServiceError && error.status === 403) redirect('/dashboard');
    redirect('/login?next=%2Fadmin');
  }
}

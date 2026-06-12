import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from './auth';

type SessionUser = { id?: string; email?: string | null; role?: string };

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  return (session?.user as SessionUser) ?? null;
}

const STAFF = ['ADMIN', 'EMPLOYEE'];

// For admin pages/layouts: bounce non-staff to login.
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/admin');
  if (!STAFF.includes(user.role ?? '')) redirect('/account');
  return user;
}

// For admin server actions / mutating routes: throw if not staff.
export async function assertAdmin() {
  const user = await getCurrentUser();
  if (!user || !STAFF.includes(user.role ?? '')) {
    throw new Error('Unauthorized');
  }
  return user;
}

// For the client account area: must be logged in (any role).
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?next=/account');
  return user;
}

// Where a given role should land after login.
export function homeForRole(role?: string): string {
  return role === 'ADMIN' || role === 'EMPLOYEE' ? '/admin' : '/account';
}

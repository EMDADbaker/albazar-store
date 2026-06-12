import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from './auth';
import { prisma } from './prisma';

type SessionUser = { id?: string; email?: string | null; role?: string };

export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  const user = (session?.user as SessionUser) ?? null;
  if (!user) return null;
  // Older session cookies (pre-User-model) lack id/role — backfill from the DB
  // by email so the session keeps working without forcing a re-login.
  if ((!user.id || !user.role) && user.email) {
    try {
      const db = await prisma.user.findUnique({
        where: { email: user.email.toLowerCase() },
        select: { id: true, role: true },
      });
      if (db) return { id: db.id, email: user.email, role: db.role };
    } catch {
      /* fall through to whatever the session had */
    }
  }
  return user;
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

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from './auth';

// For pages/layouts: bounce to login if not authenticated.
export async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/admin/login');
  return session;
}

// For server actions / mutating routes: throw (server-side check on every
// mutating endpoint — Hard rule 10).
export async function assertAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session;
}

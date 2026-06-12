import { redirect } from 'next/navigation';

// Auth is unified at /login (redirects staff to /admin by role).
export default function AdminLoginRedirect() {
  redirect('/login?next=/admin');
}

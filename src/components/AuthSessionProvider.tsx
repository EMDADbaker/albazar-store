'use client';

import { SessionProvider } from 'next-auth/react';
import type { ReactNode } from 'react';

// Client-side session context. Mounting this (instead of reading the session
// in server components like Nav) keeps the public pages free of any cookie
// read, so they render fully static and serve from the CDN edge. The session
// is fetched client-side from /api/auth/session after hydration.
export default function AuthSessionProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

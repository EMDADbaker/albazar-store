'use client';

import { signOut } from 'next-auth/react';

export default function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/admin/login' })}
      className="font-mono text-[10px] tracking-wide uppercase text-ink/40 hover:text-ink transition-colors"
    >
      Sign out
    </button>
  );
}

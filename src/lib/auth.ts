import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';
import { normalizeSaudiPhone } from './phone';

// Unified credential auth for all roles (ADMIN / EMPLOYEE / CLIENT).
// JWT sessions carry the role + user id so pages can gate by role and the
// login can redirect to the right place.
export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' },
  providers: [
    CredentialsProvider({
      name: 'Albazar',
      // Log in with EITHER email or Saudi phone number + password.
      credentials: {
        identifier: { label: 'Email or phone', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const id = credentials?.identifier?.trim();
        if (!id || !credentials?.password) return null;

        // Email if it looks like one, otherwise treat as a Saudi phone.
        const user = id.includes('@')
          ? await prisma.user.findUnique({ where: { email: id.toLowerCase() } })
          : await (async () => {
              const phone = normalizeSaudiPhone(id);
              return phone ? prisma.user.findUnique({ where: { phone } }) : null;
            })();

        if (!user) return null;
        const ok = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!ok) return null;
        return {
          id: user.id,
          email: user.email ?? undefined,
          name: user.name ?? undefined,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? 'CLIENT';
        token.uid = (user as { id?: string }).id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { id?: string }).id = token.uid as string;
      }
      return session;
    },
  },
};

export type SessionRole = 'ADMIN' | 'EMPLOYEE' | 'CLIENT';

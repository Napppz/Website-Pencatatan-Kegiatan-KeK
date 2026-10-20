import { UserRole } from '@prisma/client';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      biroId: string;
      biroCode?: string;
      biroName?: string;
      teamId?: string | null;
      teamCode?: string | null;
      teamName?: string | null;
      teams?: { id: string; code: string; name: string }[];
    } & DefaultSession['user'];
  }

  interface User {
    id?: string;
    role?: UserRole;
    biroId?: string;
    biroCode?: string;
    biroName?: string;
    teamId?: string | null;
    teamCode?: string | null;
    teamName?: string | null;
    teams?: { id: string; code: string; name: string }[];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    role?: UserRole;
    biroId?: string;
    biroCode?: string;
    biroName?: string;
    teamId?: string | null;
    teamCode?: string | null;
    teamName?: string | null;
    teams?: { id: string; code: string; name: string }[];
  }
}

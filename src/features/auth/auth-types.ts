import type { UserRole } from '@/db/schema/users';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  displayName: string;
  role: UserRole;
}

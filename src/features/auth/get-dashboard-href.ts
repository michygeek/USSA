import type { UserRole } from '@/db/schema/users';

// Where each role lands after sign-in, and what "your dashboard" means when signed-in chrome
// (the site header, the homepage redirect) needs to point somewhere.
export function getDashboardHref(role: UserRole): string {
  return role === 'instructor' || role === 'admin' ? '/instructor/courses' : '/dashboard';
}

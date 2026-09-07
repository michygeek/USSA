import { ApiError } from '@/api-response/api-error';
import { API_ERROR_CODE } from '@/api-response/api-error-codes';
import type { UserRole } from '@/db/schema/users';
import type { AuthenticatedUser } from './auth-types';

export function requireRole(authenticatedUser: AuthenticatedUser, allowedRoles: UserRole[]): void {
  if (!allowedRoles.includes(authenticatedUser.role)) {
    throw new ApiError(403, API_ERROR_CODE.FORBIDDEN_ROLE, 'Your role does not permit this action.');
  }
}

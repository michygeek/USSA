import { ApiError } from '@/api-response/api-error';
import { API_ERROR_CODE } from '@/api-response/api-error-codes';
import { getAuthenticatedUser, getAuthenticatedUserFromSession } from './get-authenticated-user';
import type { AuthenticatedUser } from './auth-types';

export async function requireAuthenticatedUser(request: Request): Promise<AuthenticatedUser> {
  const authenticatedUser = await getAuthenticatedUser(request);
  if (!authenticatedUser) {
    throw new ApiError(401, API_ERROR_CODE.UNAUTHENTICATED, 'Sign in required.');
  }
  return authenticatedUser;
}

// For Server Actions (instructor/admin screens), which have no Request object to pass through.
export async function requireAuthenticatedUserFromSession(): Promise<AuthenticatedUser> {
  const authenticatedUser = await getAuthenticatedUserFromSession();
  if (!authenticatedUser) {
    throw new ApiError(401, API_ERROR_CODE.UNAUTHENTICATED, 'Sign in required.');
  }
  return authenticatedUser;
}

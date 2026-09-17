'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { users, type UserRole } from '@/db/schema/users';
import { ApiError } from '@/api-response/api-error';
import { API_ERROR_CODE } from '@/api-response/api-error-codes';
import { requireAuthenticatedUserFromSession } from '@/features/auth/require-authenticated-user';
import { requireRole } from '@/features/auth/require-role';
import { getUserById } from './user-queries';

export async function updateUserRole(userId: string, newRole: UserRole) {
  const authenticatedUser = await requireAuthenticatedUserFromSession();
  requireRole(authenticatedUser, ['admin']);

  if (userId === authenticatedUser.userId) {
    throw new ApiError(400, API_ERROR_CODE.CANNOT_CHANGE_OWN_ROLE, 'You cannot change your own role.');
  }

  const targetUser = await getUserById(userId);
  if (!targetUser) {
    throw new ApiError(404, API_ERROR_CODE.USER_NOT_FOUND, 'User not found.');
  }

  const [updatedUser] = await db.update(users).set({ role: newRole }).where(eq(users.id, userId)).returning();
  revalidatePath('/admin/users');
  return updatedUser;
}

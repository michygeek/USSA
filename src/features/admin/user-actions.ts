'use server';

import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { users, courses, type UserRole } from '@/db/schema';
import { ApiError } from '@/api-response/api-error';
import { API_ERROR_CODE } from '@/api-response/api-error-codes';
import { requireAuthenticatedUserFromSession } from '@/features/auth/require-authenticated-user';
import { requireRole } from '@/features/auth/require-role';
import { getSupabaseAdminClient } from '@/supabase/admin-client';
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

export async function deleteUser(userId: string) {
  const authenticatedUser = await requireAuthenticatedUserFromSession();
  requireRole(authenticatedUser, ['admin']);

  if (userId === authenticatedUser.userId) {
    throw new ApiError(400, API_ERROR_CODE.CANNOT_DELETE_OWN_ACCOUNT, 'You cannot delete your own account.');
  }

  const targetUser = await getUserById(userId);
  if (!targetUser) {
    throw new ApiError(404, API_ERROR_CODE.USER_NOT_FOUND, 'User not found.');
  }

  const [ownedCourse] = await db.select({ id: courses.id }).from(courses).where(eq(courses.ownerId, userId)).limit(1);
  if (ownedCourse) {
    throw new ApiError(
      400,
      API_ERROR_CODE.USER_OWNS_COURSES,
      'This user owns courses. Reassign or delete their courses before deleting their account.',
    );
  }

  // Auth account first — if this fails we stop before touching our own data. If our row-delete
  // below fails after this succeeds, the person simply can't sign in again to be re-provisioned.
  const { error: deleteAuthUserError } = await getSupabaseAdminClient().auth.admin.deleteUser(userId);
  if (deleteAuthUserError) {
    throw new ApiError(500, API_ERROR_CODE.INTERNAL_ERROR, `Failed to delete auth account: ${deleteAuthUserError.message}`);
  }

  await db.delete(users).where(eq(users.id, userId));
  revalidatePath('/admin/users');
}

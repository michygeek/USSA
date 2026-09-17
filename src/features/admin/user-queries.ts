import { and, eq, ilike, or } from 'drizzle-orm';
import { db } from '@/db/client';
import { courses, enrollments, users } from '@/db/schema';

export async function listAllUsers(searchQuery?: string) {
  const conditions = searchQuery
    ? [or(ilike(users.email, `%${searchQuery}%`), ilike(users.displayName, `%${searchQuery}%`))]
    : [];
  return db
    .select()
    .from(users)
    .where(and(...conditions))
    .orderBy(users.createdAt);
}

export async function getUserById(userId: string) {
  const [userRecord] = await db.select().from(users).where(eq(users.id, userId));
  return userRecord ?? null;
}

export interface PlatformStats {
  totalUsers: number;
  totalInstructors: number;
  totalAdmins: number;
  totalCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
}

export async function getPlatformStats(): Promise<PlatformStats> {
  const [allUsers, allCourses, allEnrollments] = await Promise.all([
    db.select({ role: users.role }).from(users),
    db.select({ status: courses.status }).from(courses),
    db.select({ id: enrollments.id }).from(enrollments),
  ]);

  return {
    totalUsers: allUsers.length,
    totalInstructors: allUsers.filter((userRow) => userRow.role === 'instructor').length,
    totalAdmins: allUsers.filter((userRow) => userRow.role === 'admin').length,
    totalCourses: allCourses.length,
    publishedCourses: allCourses.filter((courseRow) => courseRow.status === 'published').length,
    totalEnrollments: allEnrollments.length,
  };
}

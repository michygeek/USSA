import { asc, eq } from 'drizzle-orm';
import { db } from '@/db/client';
import { modules } from '@/db/schema';

export async function listModulesByCourse(courseId: string) {
  return db.select().from(modules).where(eq(modules.courseId, courseId)).orderBy(asc(modules.position));
}

export async function getModuleById(moduleId: string) {
  const [moduleRecord] = await db.select().from(modules).where(eq(modules.id, moduleId));
  return moduleRecord ?? null;
}

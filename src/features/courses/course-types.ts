import type { courses } from '@/db/schema';

export type Course = typeof courses.$inferSelect;
export type NewCourse = typeof courses.$inferInsert;

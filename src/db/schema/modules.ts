import { pgTable, uuid, text, integer, timestamp, index } from 'drizzle-orm/pg-core';
import { courses } from './courses';

export const modules = pgTable(
  'modules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    position: integer('position').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    courseIdIndex: index('modules_course_id_index').on(table.courseId),
  }),
);

export type Module = typeof modules.$inferSelect;

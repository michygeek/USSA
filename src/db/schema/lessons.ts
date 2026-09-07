import { pgTable, uuid, text, integer, boolean, timestamp, pgEnum, uniqueIndex } from 'drizzle-orm/pg-core';
import { modules } from './modules';

export const lessonContentTypeEnum = pgEnum('lesson_content_type', ['video', 'pdf']);
export type LessonContentType = (typeof lessonContentTypeEnum.enumValues)[number];

export const lessons = pgTable(
  'lessons',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    moduleId: uuid('module_id').notNull().references(() => modules.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    position: integer('position').notNull(),
    contentType: lessonContentTypeEnum('content_type').notNull().default('video'),
    cloudflareStreamVideoId: text('cloudflare_stream_video_id'),
    durationSeconds: integer('duration_seconds'),
    pdfStoragePath: text('pdf_storage_path'),
    isPreview: boolean('is_preview').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    moduleIdSlugUnique: uniqueIndex('lessons_module_id_slug_unique').on(table.moduleId, table.slug),
  }),
);

export type Lesson = typeof lessons.$inferSelect;

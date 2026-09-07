import { pgTable, uuid, text, integer, timestamp, pgEnum, index } from 'drizzle-orm/pg-core';
import { users } from './users';

export const courseStatusEnum = pgEnum('course_status', ['draft', 'published', 'archived']);

export const courses = pgTable(
  'courses',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ownerId: uuid('owner_id').notNull().references(() => users.id),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    summary: text('summary'),
    thumbnailUrl: text('thumbnail_url'),
    priceAmountMinor: integer('price_amount_minor').notNull().default(0),
    currency: text('currency').notNull(),
    status: courseStatusEnum('status').notNull().default('draft'),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    ownerIdIndex: index('courses_owner_id_index').on(table.ownerId),
  }),
);

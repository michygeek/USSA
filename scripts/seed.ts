import './load-local-env';
import { createClient } from '@supabase/supabase-js';
import { eq } from 'drizzle-orm';
import WebSocket from 'ws';
import { db } from '../src/db/client';
import { users, courses, modules, lessons } from '../src/db/schema';
import { env } from '../env';

const SEED_PASSWORD = 'ChangeMe123!';

// Node 20 has no native WebSocket global; supabase-js's realtime client needs one even though this script never uses realtime.
const supabaseAdmin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  realtime: { transport: WebSocket as unknown as typeof globalThis.WebSocket },
});

async function findOrCreateAuthUser(email: string): Promise<string> {
  const { data: userList, error: listError } = await supabaseAdmin.auth.admin.listUsers();
  if (listError) throw new Error(`Failed to list auth users: ${listError.message}`);

  const existingAuthUser = userList.users.find((authUser) => authUser.email === email);
  if (existingAuthUser) return existingAuthUser.id;

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: SEED_PASSWORD,
    email_confirm: true,
  });
  if (error || !data.user) throw new Error(`Failed to create auth user ${email}: ${error?.message}`);
  return data.user.id;
}

async function seedUser(
  email: string,
  displayName: string,
  role: 'admin' | 'instructor' | 'learner',
): Promise<string> {
  const userId = await findOrCreateAuthUser(email);
  await db
    .insert(users)
    .values({ id: userId, email, displayName, role })
    .onConflictDoUpdate({ target: users.id, set: { displayName, role } });
  return userId;
}

async function upsertCourse(input: {
  ownerId: string;
  slug: string;
  title: string;
  summary: string;
  priceAmountMinor: number;
  currency: string;
}) {
  const [existingCourse] = await db.select().from(courses).where(eq(courses.slug, input.slug));
  if (existingCourse) return existingCourse;

  const [createdCourse] = await db
    .insert(courses)
    .values({ ...input, status: 'published', publishedAt: new Date() })
    .returning();
  if (!createdCourse) throw new Error(`Failed to create course ${input.slug}`);
  return createdCourse;
}

async function upsertModuleWithLesson(
  courseId: string,
  moduleTitle: string,
  lessonTitle: string,
  lessonSlug: string,
  isPreview: boolean,
) {
  const [existingModule] = await db.select().from(modules).where(eq(modules.courseId, courseId));
  const moduleRecord =
    existingModule ??
    (await db.insert(modules).values({ courseId, title: moduleTitle, position: 10 }).returning())[0];
  if (!moduleRecord) throw new Error(`Failed to create module for course ${courseId}`);

  const [existingLesson] = await db.select().from(lessons).where(eq(lessons.moduleId, moduleRecord.id));
  if (existingLesson) return;

  await db.insert(lessons).values({
    moduleId: moduleRecord.id,
    title: lessonTitle,
    slug: lessonSlug,
    position: 10,
    isPreview,
  });
}

async function main() {
  console.log('Seeding admin and instructor accounts...');
  await seedUser('admin@ussa-academy.com', 'USSA Admin', 'admin');
  const instructorId = await seedUser('instructor@ussa-academy.com', 'Sample Instructor', 'instructor');

  console.log('Seeding courses...');

  const freeCourse = await upsertCourse({
    ownerId: instructorId,
    slug: 'intro-to-corrections-safety',
    title: 'Intro to Corrections Safety',
    summary: 'A free introduction to core corrections safety practices.',
    priceAmountMinor: 0,
    currency: 'USD',
  });
  await upsertModuleWithLesson(
    freeCourse.id,
    'Getting Started',
    'Welcome & Safety Overview',
    'welcome-safety-overview',
    true,
  );

  const ngnCourse = await upsertCourse({
    ownerId: instructorId,
    slug: 'law-enforcement-use-of-force',
    title: 'Law Enforcement Use of Force',
    summary: 'Use-of-force fundamentals for law enforcement officers.',
    priceAmountMinor: 500000,
    currency: 'NGN',
  });
  await upsertModuleWithLesson(ngnCourse.id, 'Foundations', 'Legal Framework', 'legal-framework', false);

  const usdCourse = await upsertCourse({
    ownerId: instructorId,
    slug: 'security-officer-certification',
    title: 'Security Officer Certification',
    summary: 'Certification training for security officers.',
    priceAmountMinor: 9900,
    currency: 'USD',
  });
  await upsertModuleWithLesson(usdCourse.id, 'Core Concepts', 'Access Control Basics', 'access-control-basics', false);

  console.log('Seed complete.');
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

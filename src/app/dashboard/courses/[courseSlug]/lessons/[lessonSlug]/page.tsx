import { LessonDetailContent } from '@/features/lessons/lesson-detail-content';

export default async function DashboardLessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}) {
  const { courseSlug, lessonSlug } = await params;

  return (
    <main className="py-8">
      <LessonDetailContent courseSlug={courseSlug} lessonSlug={lessonSlug} basePath="/dashboard/courses" />
    </main>
  );
}

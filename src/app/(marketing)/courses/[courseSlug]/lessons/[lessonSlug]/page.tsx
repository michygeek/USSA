import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { getAuthenticatedUserFromSession } from '@/features/auth/get-authenticated-user';
import { getCourseBySlug } from '@/features/courses/course-queries';
import { getCourseContentTree } from '@/features/modules/get-course-content-tree';
import { getLessonBySlugInCourse } from '@/features/lessons/lesson-queries';
import { requireLessonAccess } from '@/features/lessons/require-lesson-access';
import { isUserEnrolledInCourse } from '@/features/enrollments/enrollment-queries';
import { getCourseModuleProgress, getCompletedLessonIds } from '@/features/progress/course-progress-queries';
import { createLessonPdfViewUrl } from '@/features/pdf/pdf-storage-client';
import { ApiError } from '@/api-response/api-error';
import { PdfViewer } from '@/features/lessons/pdf-viewer-lazy';
import { MarkDoneButton } from '@/features/progress/mark-done-button';
import { CourseContentSidebar } from '@/features/courses/course-content-sidebar';

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseSlug: string; lessonSlug: string }>;
}) {
  const { courseSlug, lessonSlug } = await params;

  const authenticatedUser = await getAuthenticatedUserFromSession();
  if (!authenticatedUser) redirect('/sign-in');

  const courseRecord = await getCourseBySlug(courseSlug);
  if (!courseRecord) notFound();

  const lessonRecord = await getLessonBySlugInCourse(courseRecord.id, lessonSlug);
  if (!lessonRecord) notFound();

  try {
    await requireLessonAccess(authenticatedUser, lessonRecord, courseRecord.id);
  } catch (error) {
    if (error instanceof ApiError) redirect(`/courses/${courseRecord.slug}`);
    throw error;
  }

  const isOwnerOrAdmin = authenticatedUser.role === 'admin' || authenticatedUser.userId === courseRecord.ownerId;
  const isEnrolled = await isUserEnrolledInCourse(authenticatedUser.userId, courseRecord.id);
  const hasFullAccess = isOwnerOrAdmin || isEnrolled;

  const [modulesWithLessons, progress, completedLessonIds] = await Promise.all([
    getCourseContentTree(courseRecord.id),
    getCourseModuleProgress(authenticatedUser.userId, courseRecord.id),
    getCompletedLessonIds(authenticatedUser.userId, courseRecord.id),
  ]);
  const isCompleted = completedLessonIds.has(lessonRecord.id);

  const pdfViewUrl = lessonRecord.contentType === 'pdf' && lessonRecord.pdfStoragePath
    ? await createLessonPdfViewUrl(lessonRecord.pdfStoragePath)
    : null;

  return (
    <section className="bg-slate-50 py-10">
      <div className="mx-auto max-w-6xl px-4">
        <Link href={`/courses/${courseRecord.slug}`} className="text-xs font-semibold uppercase tracking-wide text-navy-800 hover:underline">
          &larr; {courseRecord.title}
        </Link>

        <div className="mt-4 grid gap-6 lg:grid-cols-[320px_1fr]">
          <CourseContentSidebar
            courseSlug={courseRecord.slug}
            modulesWithLessons={modulesWithLessons}
            completedLessonIds={completedLessonIds}
            hasFullAccess={hasFullAccess}
            currentLessonId={lessonRecord.id}
            progress={progress}
          />

          <div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h1 className="text-2xl font-bold text-slate-900">{lessonRecord.title}</h1>
              <MarkDoneButton lessonId={lessonRecord.id} isCompleted={isCompleted} />
            </div>

            <div className="mt-6">
              {lessonRecord.contentType === 'pdf' ? (
                pdfViewUrl ? (
                  <PdfViewer fileUrl={pdfViewUrl} />
                ) : (
                  <p className="text-sm text-slate-500">This lesson&apos;s document has not been uploaded yet.</p>
                )
              ) : (
                <div className="flex aspect-video items-center justify-center rounded-lg bg-navy-950 text-sm text-slate-300">
                  Video playback is coming soon.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

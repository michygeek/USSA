import { notFound, redirect } from 'next/navigation';
import { getAuthenticatedUserFromSession } from '@/features/auth/get-authenticated-user';
import { getLessonById } from '@/features/lessons/lesson-queries';
import { getModuleById } from '@/features/modules/module-queries';
import { getCourseById } from '@/features/courses/course-queries';
import { LessonVideoUploader } from '@/features/lessons/lesson-video-uploader';
import { LessonPdfUploader } from '@/features/pdf/lesson-pdf-uploader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default async function InstructorLessonEditorPage({
  params,
}: {
  params: Promise<{ courseSlug: string; moduleId: string; lessonId: string }>;
}) {
  const { lessonId } = await params;
  const authenticatedUser = await getAuthenticatedUserFromSession();
  if (!authenticatedUser) redirect('/sign-in');

  const lessonRecord = await getLessonById(lessonId);
  if (!lessonRecord) notFound();

  const moduleRecord = await getModuleById(lessonRecord.moduleId);
  if (!moduleRecord) notFound();

  const courseRecord = await getCourseById(moduleRecord.courseId);
  if (!courseRecord) notFound();
  if (authenticatedUser.role !== 'admin' && courseRecord.ownerId !== authenticatedUser.userId) notFound();

  const videoStatusText = lessonRecord.durationSeconds
    ? `Ready — ${Math.round(lessonRecord.durationSeconds / 60)} min`
    : lessonRecord.cloudflareStreamVideoId
      ? 'Processing...'
      : 'No video uploaded yet.';

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{courseRecord.title}</p>
      <div className="mt-1 flex items-center gap-2">
        <h1 className="text-2xl font-semibold text-slate-900">{lessonRecord.title}</h1>
        {lessonRecord.isPreview && <Badge>preview</Badge>}
      </div>

      <div className="mt-6">
        {lessonRecord.contentType === 'pdf' ? (
          <Card>
            <h2 className="text-sm font-bold text-slate-900">PDF document</h2>
            <p className="mt-1 text-xs text-slate-500">
              {lessonRecord.pdfStoragePath ? 'A PDF has been uploaded.' : 'No PDF uploaded yet.'}
            </p>
            <div className="mt-4">
              <LessonPdfUploader lessonId={lessonRecord.id} hasExistingPdf={!!lessonRecord.pdfStoragePath} />
            </div>
          </Card>
        ) : (
          <Card>
            <h2 className="text-sm font-bold text-slate-900">Video</h2>
            <p className="mt-1 text-xs text-slate-500">{videoStatusText}</p>
            <div className="mt-4">
              <LessonVideoUploader lessonId={lessonRecord.id} hasExistingVideo={!!lessonRecord.cloudflareStreamVideoId} />
            </div>
          </Card>
        )}
      </div>
    </main>
  );
}

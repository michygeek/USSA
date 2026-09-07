import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getAuthenticatedUserFromSession } from '@/features/auth/get-authenticated-user';
import { getCourseBySlug } from '@/features/courses/course-queries';
import { getCourseContentTree } from '@/features/modules/get-course-content-tree';
import { isUserEnrolledInCourse } from '@/features/enrollments/enrollment-queries';
import { getCourseModuleProgress, getCompletedLessonIds } from '@/features/progress/course-progress-queries';
import { PageBanner } from '@/components/layout/page-banner';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { ProgressBar } from '@/components/ui/progress-bar';
import { EnrollButton } from '@/features/enrollments/enroll-button';

function formatCoursePrice(priceAmountMinor: number, currency: string): string {
  if (priceAmountMinor === 0) return 'Free';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(priceAmountMinor / 100);
}

export default async function CourseDetailPage({ params }: { params: Promise<{ courseSlug: string }> }) {
  const { courseSlug } = await params;
  const authenticatedUser = await getAuthenticatedUserFromSession();

  const courseRecord = await getCourseBySlug(courseSlug);
  if (!courseRecord) notFound();

  const isOwnerOrAdmin =
    !!authenticatedUser && (authenticatedUser.role === 'admin' || authenticatedUser.userId === courseRecord.ownerId);
  if (courseRecord.status !== 'published' && !isOwnerOrAdmin) notFound();

  const modulesWithLessons = await getCourseContentTree(courseRecord.id);

  const isEnrolled = authenticatedUser ? await isUserEnrolledInCourse(authenticatedUser.userId, courseRecord.id) : false;
  const hasFullAccess = isOwnerOrAdmin || isEnrolled;

  const progress = authenticatedUser
    ? await getCourseModuleProgress(authenticatedUser.userId, courseRecord.id)
    : { totalLessons: 0, completedLessons: 0 };
  const completedLessonIds = authenticatedUser
    ? await getCompletedLessonIds(authenticatedUser.userId, courseRecord.id)
    : new Set<string>();

  const isFree = courseRecord.priceAmountMinor === 0;

  return (
    <>
      <PageBanner title={courseRecord.title} subtitle={courseRecord.summary ?? ''} />

      <section className="bg-slate-50 py-12">
        <div className="mx-auto grid max-w-5xl gap-8 px-4 lg:grid-cols-[2fr_1fr]">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Course content</h2>
            <div className="mt-4 flex flex-col gap-4">
              {modulesWithLessons.map(({ moduleRecord, moduleLessons }) => (
                <Card key={moduleRecord.id}>
                  <h3 className="font-semibold text-slate-900">{moduleRecord.title}</h3>
                  <ul className="mt-3 flex flex-col gap-1">
                    {moduleLessons.map((lessonRecord) => {
                      const canAccess = lessonRecord.isPreview || hasFullAccess;
                      const isCompleted = completedLessonIds.has(lessonRecord.id);
                      const actionLabel = lessonRecord.contentType === 'pdf' ? 'View PDF' : 'Watch video';

                      return (
                        <li
                          key={lessonRecord.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                        >
                          <span className="flex items-center gap-2">
                            <Icon
                              name={isCompleted ? 'checkCircle' : 'document'}
                              className={`h-4 w-4 shrink-0 ${isCompleted ? 'text-gold-600' : 'text-slate-400'}`}
                            />
                            <span className={canAccess ? '' : 'text-slate-400'}>{lessonRecord.title}</span>
                            {lessonRecord.isPreview && <Badge>preview</Badge>}
                            {!canAccess && <Badge>locked</Badge>}
                          </span>
                          {canAccess && (
                            <Link
                              href={`/courses/${courseRecord.slug}/lessons/${lessonRecord.slug}`}
                              className="inline-flex items-center gap-1 rounded-md border border-navy-800 px-3 py-1 text-xs font-bold text-navy-800 hover:bg-navy-900 hover:text-white"
                            >
                              {isCompleted ? 'Review' : actionLabel} <span aria-hidden>&rarr;</span>
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </Card>
              ))}
              {modulesWithLessons.length === 0 && (
                <p className="text-sm text-slate-500">Course content is coming soon.</p>
              )}
            </div>
          </div>

          <div>
            <Card>
              <p className="text-2xl font-bold text-slate-900">
                {formatCoursePrice(courseRecord.priceAmountMinor, courseRecord.currency)}
              </p>

              {authenticatedUser ? (
                hasFullAccess ? (
                  <div className="mt-4">
                    <ProgressBar completed={progress.completedLessons} total={progress.totalLessons} />
                  </div>
                ) : isFree ? (
                  <div className="mt-4">
                    <EnrollButton courseSlug={courseRecord.slug} />
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">
                    Paid checkout is coming soon. Contact us to enroll in this program.
                  </p>
                )
              ) : (
                <Link
                  href="/sign-in"
                  className="mt-4 inline-flex w-full items-center justify-center rounded-md bg-gold-500 px-4 py-2 text-sm font-medium text-navy-950 hover:bg-gold-400"
                >
                  Sign in to enroll
                </Link>
              )}
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}

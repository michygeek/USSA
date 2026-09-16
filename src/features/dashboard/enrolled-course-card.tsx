import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { RadialProgress } from '@/components/ui/radial-progress';
import type { EnrolledCourseSummary } from './dashboard-queries';

export function EnrolledCourseCard({ course, progress, nextLessonSlug }: EnrolledCourseSummary) {
  const isCompleted = progress.completedAt !== null;
  const continueHref = nextLessonSlug
    ? `/dashboard/courses/${course.slug}/lessons/${nextLessonSlug}`
    : `/dashboard/courses/${course.slug}`;
  const percentage = progress.totalLessons === 0 ? 0 : Math.round((progress.completedLessons / progress.totalLessons) * 100);

  return (
    <Link href={continueHref} className="block overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="aspect-video w-full bg-navy-900">
        {course.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- external Supabase Storage URL
          <img src={course.thumbnailUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy-900 to-navy-950">
            <Icon name="bookOpen" className="h-10 w-10 text-gold-400/60" />
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="line-clamp-2 font-bold text-navy-900">{course.title}</p>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="flex flex-col gap-1.5 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <Icon name="document" className="h-3.5 w-3.5" />
              {progress.totalLessons} lesson{progress.totalLessons === 1 ? '' : 's'}
            </span>
            <span className="flex items-center gap-1.5">
              <Icon name="checkCircle" className="h-3.5 w-3.5" />
              {progress.completedLessons} completed
            </span>
          </div>
          <RadialProgress percentage={percentage} size={52} strokeWidth={4} />
        </div>

        <p
          className={`mt-3 rounded-full px-3 py-1.5 text-center text-xs font-semibold ${
            isCompleted ? 'bg-gold-500/10 text-gold-600' : 'bg-slate-100 text-slate-600'
          }`}
        >
          {isCompleted ? 'Certificate earned' : progress.completedLessons > 0 ? 'Continue learning' : 'Start course'}
        </p>
      </div>
    </Link>
  );
}

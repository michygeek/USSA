import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import type { Course } from './course-types';

function formatCoursePrice(priceAmountMinor: number, currency: string): string {
  if (priceAmountMinor === 0) return 'Free';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(priceAmountMinor / 100);
}

export function CourseCard({ course }: { course: Course }) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="aspect-video w-full bg-navy-900">
        {course.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- external Supabase Storage URL, not a static asset
          <img src={course.thumbnailUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy-900 to-navy-950">
            <Icon name="bookOpen" className="h-10 w-10 text-gold-400/60" />
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-lg font-semibold text-slate-900">{course.title}</h3>
          <Badge>{course.status}</Badge>
        </div>
        {course.summary && <p className="mt-1 text-sm text-slate-600">{course.summary}</p>}
        <p className="mt-3 text-sm font-medium text-slate-900">
          {formatCoursePrice(course.priceAmountMinor, course.currency)}
        </p>
      </div>
    </div>
  );
}

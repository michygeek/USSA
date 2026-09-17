import { Badge } from '@/components/ui/badge';
import { Icon } from '@/components/ui/icon';
import { COURSE_CATEGORY_META } from './course-category';
import type { Course } from './course-types';

function formatCoursePrice(priceAmountMinor: number, currency: string): string {
  if (priceAmountMinor === 0) return 'Free';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(priceAmountMinor / 100);
}

export function CourseCard({ course }: { course: Course }) {
  const categoryMeta = COURSE_CATEGORY_META[course.category];

  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-lg">
      <div className="relative aspect-video w-full bg-navy-900">
        {course.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- external Supabase Storage URL, not a static asset
          <img src={course.thumbnailUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-navy-900 to-navy-950">
            <Icon name={categoryMeta.icon} className="h-10 w-10 text-gold-400/60" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-navy-950/0 to-navy-950/0" />

        <span className="absolute bottom-3 left-3 flex items-center gap-1.5 rounded-full bg-navy-900/90 py-1 pl-1.5 pr-3 text-[11px] font-bold uppercase tracking-wide text-gold-400 ring-1 ring-white/20">
          <Icon name={categoryMeta.icon} className="h-3.5 w-3.5" />
          {categoryMeta.label}
        </span>

        {course.status !== 'published' && (
          <span className="absolute right-3 top-3">
            <Badge>{course.status}</Badge>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-2 font-bold text-navy-900">{course.title}</h3>
        {course.summary && <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-slate-600">{course.summary}</p>}

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="font-bold text-navy-900">{formatCoursePrice(course.priceAmountMinor, course.currency)}</span>
          <span className="flex items-center gap-1 text-xs font-bold text-navy-800">
            View course <span aria-hidden>&rarr;</span>
          </span>
        </div>
      </div>
    </div>
  );
}

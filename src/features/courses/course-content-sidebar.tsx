import Link from 'next/link';
import { Icon } from '@/components/ui/icon';
import { ProgressBar } from '@/components/ui/progress-bar';
import type { Lesson } from '@/db/schema/lessons';
import type { Module } from '@/db/schema/modules';

interface CourseContentSidebarProps {
  courseSlug: string;
  modulesWithLessons: { moduleRecord: Module; moduleLessons: Lesson[] }[];
  completedLessonIds: Set<string>;
  hasFullAccess: boolean;
  currentLessonId: string;
  progress: { completedLessons: number; totalLessons: number };
}

export function CourseContentSidebar({
  courseSlug,
  modulesWithLessons,
  completedLessonIds,
  hasFullAccess,
  currentLessonId,
  progress,
}: CourseContentSidebarProps) {
  return (
    <details open className="lg:sticky lg:top-6 lg:self-start">
      <summary className="cursor-pointer list-none rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-bold text-navy-900 lg:cursor-default">
        <span className="inline-flex w-full items-center justify-between">
          Course content
          <Icon name="chevronDown" className="h-4 w-4 text-slate-400 lg:hidden" />
        </span>
      </summary>

      <div className="mt-2 max-h-[75vh] overflow-y-auto rounded-lg border border-slate-200 bg-white p-3 lg:mt-0 lg:rounded-t-none lg:border-t-0">
        <div className="border-b border-slate-100 px-1 pb-3">
          <ProgressBar completed={progress.completedLessons} total={progress.totalLessons} />
        </div>

        <div className="mt-3 flex flex-col gap-4">
          {modulesWithLessons.map(({ moduleRecord, moduleLessons }) => (
            <div key={moduleRecord.id}>
              <p className="px-1 text-xs font-bold uppercase tracking-wide text-slate-500">{moduleRecord.title}</p>
              <ul className="mt-1 flex flex-col gap-0.5">
                {moduleLessons.map((lessonRecord) => {
                  const canAccess = lessonRecord.isPreview || hasFullAccess;
                  const isCompleted = completedLessonIds.has(lessonRecord.id);
                  const isCurrent = lessonRecord.id === currentLessonId;

                  const rowContent = (
                    <>
                      <Icon
                        name={isCompleted ? 'checkCircle' : canAccess ? 'play' : 'lock'}
                        className={`h-4 w-4 shrink-0 ${isCompleted ? 'text-gold-600' : isCurrent ? 'text-navy-900' : 'text-slate-400'}`}
                      />
                      <span className="truncate">{lessonRecord.title}</span>
                    </>
                  );

                  const rowClassName = `flex items-center gap-2 rounded-md px-2 py-2 text-sm ${
                    isCurrent
                      ? 'bg-navy-900 font-semibold text-white'
                      : canAccess
                        ? 'text-slate-700 hover:bg-slate-50'
                        : 'text-slate-400'
                  }`;

                  return (
                    <li key={lessonRecord.id}>
                      {canAccess ? (
                        <Link href={`/courses/${courseSlug}/lessons/${lessonRecord.slug}`} className={rowClassName}>
                          {rowContent}
                        </Link>
                      ) : (
                        <span className={rowClassName}>{rowContent}</span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
}

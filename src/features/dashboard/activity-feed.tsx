import Link from 'next/link';
import { Icon, type IconName } from '@/components/ui/icon';
import type { ActivityEvent } from './dashboard-queries';

const ACTIVITY_ICON: Record<ActivityEvent['type'], IconName> = {
  enrolled: 'bookOpen',
  lesson_completed: 'checkCircle',
  certificate_earned: 'award',
};

function formatActivityLabel(event: ActivityEvent): { text: string; href: string } {
  switch (event.type) {
    case 'enrolled':
      return { text: `Enrolled in ${event.courseTitle}`, href: `/dashboard/courses/${event.courseSlug}` };
    case 'lesson_completed':
      return {
        text: `Completed "${event.lessonTitle}" in ${event.courseTitle}`,
        href: `/dashboard/courses/${event.courseSlug}/lessons/${event.lessonSlug}`,
      };
    case 'certificate_earned':
      return { text: `Earned a certificate for ${event.courseTitle}`, href: `/dashboard/certificates/${event.courseSlug}` };
  }
}

function formatRelativeTime(timestamp: Date): string {
  const diffMs = Date.now() - timestamp.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  if (diffDays < 30) return `${diffDays}d ago`;
  return timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function ActivityFeed({ events }: { events: ActivityEvent[] }) {
  if (events.length === 0) {
    return <p className="text-sm text-slate-500">No activity yet — enroll in a course to get started.</p>;
  }

  return (
    <ul className="flex flex-col gap-1">
      {events.map((event, index) => {
        const { text, href } = formatActivityLabel(event);
        return (
          <li key={`${event.type}-${event.courseSlug}-${index}`}>
            <Link href={href} className="flex items-start gap-3 rounded-md px-2 py-2 hover:bg-slate-50">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy-900/5 text-navy-800">
                <Icon name={ACTIVITY_ICON[event.type]} className="h-4 w-4" />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm text-slate-700">{text}</span>
                <span className="text-xs text-slate-400">{formatRelativeTime(event.timestamp)}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

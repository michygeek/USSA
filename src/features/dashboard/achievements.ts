import type { IconName } from '@/components/ui/icon';
import type { EnrolledCourseSummary, EarnedCertificate } from './dashboard-queries';

export interface Achievement {
  id: string;
  label: string;
  description: string;
  icon: IconName;
  isEarned: boolean;
}

// Purely derived from enrollment/progress data already on hand — no achievements table.
export function computeAchievements(enrolledCourses: EnrolledCourseSummary[], certificates: EarnedCertificate[]): Achievement[] {
  const totalLessonsCompleted = enrolledCourses.reduce((sum, entry) => sum + entry.progress.completedLessons, 0);

  return [
    {
      id: 'first-enrollment',
      label: 'Getting Started',
      description: 'Enroll in your first course',
      icon: 'bookOpen',
      isEarned: enrolledCourses.length >= 1,
    },
    {
      id: 'first-lesson',
      label: 'First Steps',
      description: 'Complete your first lesson',
      icon: 'checkCircle',
      isEarned: totalLessonsCompleted >= 1,
    },
    {
      id: 'first-certificate',
      label: 'Certified',
      description: 'Earn your first certificate',
      icon: 'award',
      isEarned: certificates.length >= 1,
    },
    {
      id: 'dedicated-learner',
      label: 'Dedicated Learner',
      description: 'Complete 10 lessons',
      icon: 'shieldCheck',
      isEarned: totalLessonsCompleted >= 10,
    },
  ];
}

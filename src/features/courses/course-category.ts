import type { IconName } from '@/components/ui/icon';
import type { CourseCategory } from './course-types';

export const COURSE_CATEGORIES: CourseCategory[] = ['military', 'lawEnforcement', 'corrections', 'security', 'safety'];

export const COURSE_CATEGORY_META: Record<CourseCategory, { label: string; icon: IconName }> = {
  military: { label: 'Military', icon: 'military' },
  lawEnforcement: { label: 'Law Enforcement', icon: 'lawEnforcement' },
  corrections: { label: 'Corrections', icon: 'corrections' },
  security: { label: 'Security', icon: 'security' },
  safety: { label: 'Safety', icon: 'safety' },
};

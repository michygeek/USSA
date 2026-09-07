import { describe, expect, it, vi } from 'vitest';
import { requireCourseOwnership } from '@/features/courses/require-course-ownership';
import type { AuthenticatedUser } from '@/features/auth/auth-types';

const mockCourseRow = {
  id: 'course-1',
  ownerId: 'instructor-a',
  slug: 'test-course',
  title: 'Test Course',
  summary: null,
  priceAmountMinor: 0,
  currency: 'USD',
  status: 'draft' as const,
  publishedAt: null,
  createdAt: new Date(),
};

vi.mock('@/db/client', () => ({
  db: {
    select: () => ({
      from: () => ({
        where: () => Promise.resolve([mockCourseRow]),
      }),
    }),
  },
}));

function buildAuthenticatedUser(overrides: Partial<AuthenticatedUser>): AuthenticatedUser {
  return {
    userId: 'instructor-a',
    email: 'user@example.com',
    displayName: 'Test User',
    role: 'instructor',
    ...overrides,
  };
}

describe('requireCourseOwnership', () => {
  it('allows the owning instructor', async () => {
    const owningInstructor = buildAuthenticatedUser({ userId: 'instructor-a', role: 'instructor' });
    await expect(requireCourseOwnership(owningInstructor, 'course-1')).resolves.toBeUndefined();
  });

  it('rejects a non-owning instructor with 403 COURSE_NOT_OWNED', async () => {
    const otherInstructor = buildAuthenticatedUser({ userId: 'instructor-b', role: 'instructor' });
    await expect(requireCourseOwnership(otherInstructor, 'course-1')).rejects.toMatchObject({
      httpStatus: 403,
      code: 'COURSE_NOT_OWNED',
    });
  });

  it('allows an admin regardless of ownership', async () => {
    const admin = buildAuthenticatedUser({ userId: 'admin-1', role: 'admin' });
    await expect(requireCourseOwnership(admin, 'course-1')).resolves.toBeUndefined();
  });
});

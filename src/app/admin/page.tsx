import { getPlatformStats } from '@/features/admin/user-queries';
import { StatCard } from '@/components/ui/stat-card';

export default async function AdminOverviewPage() {
  const stats = await getPlatformStats();

  return (
    <main className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="text-2xl font-extrabold tracking-wide text-navy-900">PLATFORM OVERVIEW</h1>
      <p className="mt-1 text-sm text-slate-500">Site-wide numbers across every instructor&apos;s courses, not just your own.</p>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="Total users" value={stats.totalUsers} icon="users" />
        <StatCard label="Instructors" value={stats.totalInstructors} icon="instructor" />
        <StatCard label="Admins" value={stats.totalAdmins} icon="shieldCheck" />
        <StatCard label="Total courses" value={stats.totalCourses} icon="bookOpen" />
        <StatCard label="Published courses" value={stats.publishedCourses} icon="checkCircle" />
        <StatCard label="Total enrollments" value={stats.totalEnrollments} icon="document" />
      </div>
    </main>
  );
}

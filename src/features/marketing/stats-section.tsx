import { Icon, type IconName } from '@/components/ui/icon';

const STATS: { icon: IconName; value: string; label: string }[] = [
  { icon: 'users', value: '500+', label: 'Graduates Certified' },
  { icon: 'award', value: '15+', label: 'Years of Training Excellence' },
  { icon: 'globe', value: '50', label: 'States & International Reach' },
  { icon: 'checkCircle', value: '98%', label: 'Certification Pass Rate' },
];

export function StatsSection() {
  return (
    <section className="bg-white py-16">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => (
          <div key={stat.label} className="flex flex-col items-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-navy-900 text-gold-400">
              <Icon name={stat.icon} className="h-6 w-6" />
            </span>
            <p className="mt-4 text-3xl font-extrabold text-navy-900">{stat.value}</p>
            <p className="mt-1 text-sm text-slate-600">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

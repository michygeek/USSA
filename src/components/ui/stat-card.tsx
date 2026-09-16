import { Card } from './card';
import { Icon, type IconName } from './icon';

export function StatCard({ label, value, icon }: { label: string; value: string | number; icon?: IconName }) {
  return (
    <Card>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-1 text-2xl font-extrabold text-navy-900">{value}</p>
        </div>
        {icon && (
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gold-500/10 text-gold-600">
            <Icon name={icon} className="h-5 w-5" />
          </span>
        )}
      </div>
    </Card>
  );
}

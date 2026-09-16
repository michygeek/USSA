import { Icon } from '@/components/ui/icon';
import type { Achievement } from './achievements';

export function AchievementBadge({ achievement }: { achievement: Achievement }) {
  return (
    <div className="flex flex-col items-center gap-2 text-center">
      <span
        className={`flex h-14 w-14 items-center justify-center rounded-full border-2 ${
          achievement.isEarned ? 'border-gold-500 bg-gold-500/10 text-gold-600' : 'border-slate-200 bg-slate-50 text-slate-300'
        }`}
      >
        <Icon name={achievement.icon} className="h-6 w-6" />
      </span>
      <div>
        <p className={`text-xs font-bold ${achievement.isEarned ? 'text-navy-900' : 'text-slate-400'}`}>{achievement.label}</p>
        <p className="text-[11px] text-slate-400">{achievement.description}</p>
      </div>
    </div>
  );
}

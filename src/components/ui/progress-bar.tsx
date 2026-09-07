export function ProgressBar({ completed, total }: { completed: number; total: number }) {
  const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);

  return (
    <div>
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>
          {completed} of {total} lessons complete
        </span>
        <span>{percentage}%</span>
      </div>
      <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-gold-500 transition-all" style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
}

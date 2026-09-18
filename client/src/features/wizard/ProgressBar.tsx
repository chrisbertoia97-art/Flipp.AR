interface Props {
  current: number;
  total: number;
  title: string;
}

export default function ProgressBar({ current, total, title }: Props) {
  const pct = Math.round((current / total) * 100);
  return (
    <div className="mb-8">
      <div className="flex items-baseline justify-between mb-2">
        <span className="text-xs uppercase tracking-wide text-neutral-400">
          Paso {current} de {total}
        </span>
        <span className="text-xs text-neutral-500">{pct}%</span>
      </div>
      <h2 className="text-xl font-semibold text-neutral-50 mb-3">{title}</h2>
      <div className="h-2 w-full rounded-full bg-neutral-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-amber-400 transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

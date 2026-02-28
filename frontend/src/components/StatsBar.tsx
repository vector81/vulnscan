interface Props {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export function StatsBar({ critical, high, medium, low }: Props) {
  const total = critical + high + medium + low;
  if (total === 0) return null;

  const segments = [
    { count: critical, color: "bg-red-500", label: "Critical" },
    { count: high, color: "bg-orange-500", label: "High" },
    { count: medium, color: "bg-yellow-500", label: "Medium" },
    { count: low, color: "bg-blue-500", label: "Low" },
  ];

  return (
    <div className="space-y-2">
      <div className="flex h-3 rounded-full overflow-hidden bg-gray-800">
        {segments.map(
          (s) =>
            s.count > 0 && (
              <div
                key={s.label}
                className={`${s.color} transition-all`}
                style={{ width: `${(s.count / total) * 100}%` }}
                title={`${s.label}: ${s.count} (${Math.round((s.count / total) * 100)}%)`}
              />
            )
        )}
      </div>
      <div className="flex gap-4 text-xs text-gray-400">
        {segments.map(
          (s) =>
            s.count > 0 && (
              <span key={s.label}>
                <span className={`inline-block w-2 h-2 rounded-full ${s.color} mr-1`} />
                {s.count} {s.label}
              </span>
            )
        )}
      </div>
    </div>
  );
}

type LineChartProps = {
  series: {
    label: string;
    color: string;
    points: { x: string; y: number }[];
  }[];
  title?: string;
  unit?: string;
};

export function LineChart({ series, title, unit = "%" }: LineChartProps) {
  const width = 500;
  const height = 200;
  const padding = { top: 20, right: 20, bottom: 40, left: 40 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const allY = series.flatMap((s) => s.points.map((p) => p.y));
  const minY = Math.min(...allY) * 0.9;
  const maxY = Math.max(...allY) * 1.1;
  const pointCount = series[0]?.points.length ?? 0;

  function toX(i: number) {
    return padding.left + (i / Math.max(pointCount - 1, 1)) * chartW;
  }
  function toY(y: number) {
    return padding.top + chartH - ((y - minY) / (maxY - minY)) * chartH;
  }

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      {title && (
        <h3 className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {title}
        </h3>
      )}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        role="img"
        aria-label={title ?? "Gráfico de linhas"}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = padding.top + chartH * (1 - t);
          const val = minY + (maxY - minY) * t;
          return (
            <g key={t}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="currentColor"
                className="text-zinc-100 dark:text-zinc-800"
                strokeWidth={1}
              />
              <text
                x={padding.left - 6}
                y={y + 4}
                textAnchor="end"
                className="fill-zinc-400 text-[9px]"
                style={{ fontSize: 9 }}
              >
                {val.toFixed(0)}
                {unit}
              </text>
            </g>
          );
        })}

        {series.map((s) => {
          const pathD = s.points
            .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i)} ${toY(p.y)}`)
            .join(" ");
          return (
            <g key={s.label}>
              <path
                d={pathD}
                fill="none"
                stroke={s.color}
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {s.points.map((p, i) => (
                <circle
                  key={`${s.label}-${p.x}`}
                  cx={toX(i)}
                  cy={toY(p.y)}
                  r={3}
                  fill={s.color}
                />
              ))}
            </g>
          );
        })}

        {series[0]?.points.map((p, i) => (
          <text
            key={p.x}
            x={toX(i)}
            y={height - 8}
            textAnchor="middle"
            className="fill-zinc-500 text-[9px]"
            style={{ fontSize: 9 }}
          >
            {p.x}
          </text>
        ))}
      </svg>

      <div className="mt-3 flex flex-wrap gap-4">
        {series.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: s.color }}
            />
            {s.label}
          </div>
        ))}
      </div>
    </div>
  );
}

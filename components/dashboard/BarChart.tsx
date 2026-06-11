type BarChartProps = {
  data: { label: string; value: number; color?: string }[];
  title?: string;
  unit?: string;
  maxValue?: number;
};

const defaultColors = [
  "#3b82f6",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
];

export function BarChart({ data, title, unit = "", maxValue }: BarChartProps) {
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);
  const chartHeight = 200;
  const barWidth = Math.min(48, Math.floor(400 / data.length) - 8);
  const svgWidth = data.length * (barWidth + 16) + 40;

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
      {title && (
        <h3 className="mb-4 text-sm font-medium text-zinc-700 dark:text-zinc-300">
          {title}
        </h3>
      )}
      <svg
        viewBox={`0 0 ${svgWidth} ${chartHeight + 50}`}
        className="w-full"
        role="img"
        aria-label={title ?? "Gráfico de barras"}
      >
        {data.map((item, i) => {
          const barHeight = (item.value / max) * chartHeight;
          const x = 30 + i * (barWidth + 16);
          const y = chartHeight - barHeight + 10;
          const color = item.color ?? defaultColors[i % defaultColors.length];

          return (
            <g key={item.label}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                rx={4}
                fill={color}
                opacity={0.85}
              />
              <text
                x={x + barWidth / 2}
                y={y - 6}
                textAnchor="middle"
                className="fill-zinc-600 text-[10px] dark:fill-zinc-400"
                style={{ fontSize: 10 }}
              >
                {item.value}
                {unit}
              </text>
              <text
                x={x + barWidth / 2}
                y={chartHeight + 28}
                textAnchor="middle"
                className="fill-zinc-500 text-[9px] dark:fill-zinc-500"
                style={{ fontSize: 9 }}
              >
                {item.label.length > 12
                  ? `${item.label.slice(0, 10)}…`
                  : item.label}
              </text>
            </g>
          );
        })}
        <line
          x1={20}
          y1={chartHeight + 10}
          x2={svgWidth - 10}
          y2={chartHeight + 10}
          stroke="currentColor"
          className="text-zinc-200 dark:text-zinc-700"
          strokeWidth={1}
        />
      </svg>
    </div>
  );
}

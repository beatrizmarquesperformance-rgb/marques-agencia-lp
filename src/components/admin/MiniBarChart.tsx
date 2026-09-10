/** Tiny dependency-free bar chart for the dashboard (server component). */
export function MiniBarChart({
  data,
  height = 120,
}: {
  data: { date: string; count: number }[];
  height?: number;
}) {
  const max = Math.max(1, ...data.map((d) => d.count));
  const barW = 100 / data.length;

  return (
    <div>
      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
        role="img"
        aria-label="Leads por dia nos últimos 14 dias"
      >
        {data.map((d, i) => {
          const h = (d.count / max) * (height - 28);
          return (
            <g key={d.date}>
              <rect
                x={i * barW + barW * 0.15}
                y={height - h - 12}
                width={barW * 0.7}
                height={Math.max(h, d.count > 0 ? 2 : 0)}
                rx={0.6}
                className="fill-white/80"
              />
              {d.count > 0 && (
                <text
                  x={i * barW + barW / 2}
                  y={height - h - 14}
                  textAnchor="middle"
                  className="fill-neutral-400"
                  style={{ fontSize: 5 }}
                >
                  {d.count}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className="mt-1 flex justify-between text-[10px] text-neutral-600">
        <span>
          {new Date(data[0]?.date ?? Date.now()).toLocaleDateString("pt-PT", {
            day: "2-digit",
            month: "2-digit",
          })}
        </span>
        <span>hoje</span>
      </div>
    </div>
  );
}

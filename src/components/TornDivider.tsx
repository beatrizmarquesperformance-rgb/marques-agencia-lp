/**
 * A torn-paper edge. Renders as an SVG band whose bottom is a solid fill
 * (the panel colour) and whose top is a ragged deckle edge, plus a thin
 * white "paper" lip like the reference PDF.
 *
 * Pass `color2` to split the fill vertically at the midpoint (Pimba à Bruta's
 * green/red panel).
 *
 * Deterministic per `seed` so SSR and client markup match.
 */
export function TornDivider({
  color,
  color2,
  seed = 1,
  height = 90,
  flip = false,
  className = "",
}: {
  color: string;
  color2?: string;
  seed?: number;
  height?: number;
  flip?: boolean;
  className?: string;
}) {
  const W = 1200;
  const steps = 46;
  let s = seed * 9301 + 49297;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  const ys: number[] = [];
  for (let i = 0; i <= steps; i++) ys.push(6 + rand() * (height * 0.55));

  const pts = ys.map((y, i) => `${((i / steps) * W).toFixed(1)},${y.toFixed(1)}`);
  const fillPath = `M0,${height} L0,${ys[0].toFixed(1)} L${pts.join(" L")} L${W},${height} Z`;
  const lipPath = `M0,${height} L0,${(ys[0] + 5).toFixed(1)} ${ys
    .map((y, i) => `L${((i / steps) * W).toFixed(1)},${(y + 5).toFixed(1)}`)
    .join(" ")} L${W},${height} Z`;

  const clipId = `torn-${seed}`;

  return (
    <svg
      className={className}
      viewBox={`0 0 ${W} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{
        display: "block",
        width: "100%",
        height,
        transform: flip ? "scaleY(-1)" : undefined,
      }}
    >
      <path d={lipPath} fill="#f2efe9" />
      {color2 ? (
        <>
          <clipPath id={clipId}>
            <path d={fillPath} />
          </clipPath>
          <g clipPath={`url(#${clipId})`}>
            <rect x="0" y="0" width={W / 2} height={height} fill={color} />
            <rect x={W / 2} y="0" width={W / 2} height={height} fill={color2} />
          </g>
        </>
      ) : (
        <path d={fillPath} fill={color} />
      )}
    </svg>
  );
}

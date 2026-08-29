/**
 * A torn-paper edge. Renders as an SVG band whose bottom is a solid fill
 * (the panel colour) and whose top is a ragged deckle edge, plus a thin
 * white "paper" lip like the reference PDF.
 *
 * Deterministic per `seed` so SSR and client markup match.
 */
export function TornDivider({
  color,
  seed = 1,
  height = 90,
  flip = false,
  className = "",
}: {
  color: string;
  seed?: number;
  height?: number;
  flip?: boolean;
  className?: string;
}) {
  const W = 1200;
  const steps = 46;
  // simple deterministic PRNG
  let s = seed * 9301 + 49297;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const x = (i / steps) * W;
    const y = 6 + rand() * (height * 0.55);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const paper = `M0,${height} L0,${pts[0].split(",")[1]} L${pts.join(" L")} L${W},${height} Z`;
  // white lip sits just above the fill
  const lip = `M0,${height} L0,${(+pts[0].split(",")[1] + 5).toFixed(1)} ${pts
    .map((p) => {
      const [x, y] = p.split(",");
      return `L${x},${(+y + 5).toFixed(1)}`;
    })
    .join(" ")} L${W},${height} Z`;

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
      <path d={lip} fill="#f2efe9" />
      <path d={paper} fill={color} />
    </svg>
  );
}

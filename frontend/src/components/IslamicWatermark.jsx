// Subtle animated Islamic geometric-star watermark, sits fixed behind all
// content. Uses only generic, traditional geometric motifs (no branded or
// copyrighted artwork). Respects prefers-reduced-motion.

function EightPointStar({ size = 60 }) {
  // A classic 8-point "khatam" star built from two overlapping squares.
  const s = size;
  const c = s / 2;
  return (
    <g>
      <rect x={c - s * 0.32} y={c - s * 0.32} width={s * 0.64} height={s * 0.64}
        transform={`rotate(0 ${c} ${c})`} fill="none" stroke="currentColor" strokeWidth="1" />
      <rect x={c - s * 0.32} y={c - s * 0.32} width={s * 0.64} height={s * 0.64}
        transform={`rotate(45 ${c} ${c})`} fill="none" stroke="currentColor" strokeWidth="1" />
    </g>
  );
}

export default function IslamicWatermark() {
  const tileId = "faraid-star-tile";

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none bg-[#f4f7f5]"
    >
      {/* Tiled geometric star pattern, very low opacity for texture */}
      <svg className="absolute inset-0 w-full h-full text-brand-700 opacity-[0.05]">
        <defs>
          <pattern id={tileId} x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
            <EightPointStar size={80} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${tileId})`} />
      </svg>

      {/* Large slow-rotating motifs for ambient depth */}
      <svg
        className="absolute text-brand-600 opacity-[0.06] animate-[spin_180s_linear_infinite] motion-reduce:animate-none"
        style={{ top: "-10%", left: "-12%", width: "55vmin", height: "55vmin" }}
        viewBox="0 0 200 200"
      >
        <RosettePattern />
      </svg>
      <svg
        className="absolute text-brand-700 opacity-[0.05] animate-[spin_240s_linear_infinite_reverse] motion-reduce:animate-none"
        style={{ bottom: "-15%", right: "-10%", width: "60vmin", height: "60vmin" }}
        viewBox="0 0 200 200"
      >
        <RosettePattern />
      </svg>
    </div>
  );
}

function RosettePattern() {
  // 12-point rosette made from repeated arcs — a common motif in Islamic
  // architectural ornament (mosque domes, mihrab borders).
  const points = Array.from({ length: 12 }, (_, i) => i * 30);
  return (
    <g fill="none" stroke="currentColor" strokeWidth="1">
      <circle cx="100" cy="100" r="90" />
      <circle cx="100" cy="100" r="70" />
      {points.map((deg) => (
        <line
          key={deg}
          x1="100"
          y1="10"
          x2="100"
          y2="30"
          transform={`rotate(${deg} 100 100)`}
        />
      ))}
      {points.map((deg) => (
        <g key={`star-${deg}`} transform={`rotate(${deg} 100 100)`}>
          <path d="M100,100 L100,20 L112,32 Z" />
        </g>
      ))}
    </g>
  );
}

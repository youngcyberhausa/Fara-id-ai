export default function Logo({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className="shrink-0"
      role="img"
      aria-label="Fara'id AI"
    >
      <defs>
        <linearGradient id="faraidGoldGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f3d98a" />
          <stop offset="50%" stopColor="#d9b65c" />
          <stop offset="100%" stopColor="#b8892f" />
        </linearGradient>
        <linearGradient id="faraidGreenGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#146b3a" />
          <stop offset="100%" stopColor="#0c5f2f" />
        </linearGradient>
        <radialGradient id="faraidSheen" cx="35%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer rosette star */}
      <polygon
        points="32.00,2.00 39.65,13.52 53.21,10.79 50.48,24.35 62.00,32.00 50.48,39.65 53.21,53.21 39.65,50.48 32.00,62.00 24.35,50.48 10.79,53.21 13.52,39.65 2.00,32.00 13.52,24.35 10.79,10.79 24.35,13.52"
        fill="url(#faraidGreenGrad)"
        stroke="url(#faraidGoldGrad)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />

      {/* Middle accent star, rotated */}
      <polygon
        points="41.76,8.44 44.73,19.27 55.56,22.24 50.00,32.00 55.56,41.76 44.73,44.73 41.76,55.56 32.00,50.00 22.24,55.56 19.27,44.73 8.44,41.76 14.00,32.00 8.44,22.24 19.27,19.27 22.24,8.44 32.00,14.00"
        fill="none"
        stroke="url(#faraidGoldGrad)"
        strokeWidth="0.9"
        opacity="0.85"
      />

      {/* Center medallion */}
      <circle cx="32" cy="32" r="15.5" fill="url(#faraidGreenGrad)" stroke="url(#faraidGoldGrad)" strokeWidth="1.8" />
      <circle cx="32" cy="32" r="15.5" fill="url(#faraidSheen)" />
      <circle cx="32" cy="32" r="12.3" fill="none" stroke="#d9b65c" strokeWidth="0.5" opacity="0.55" />

      {/* Faux-3D F */}
      <text
        x="32.6"
        y="38.3"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="18"
        fontWeight="700"
        fill="#04200f"
        opacity="0.55"
      >
        F
      </text>
      <text
        x="32"
        y="37.6"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="18"
        fontWeight="700"
        fill="url(#faraidGoldGrad)"
      >
        F
      </text>
    </svg>
  );
}

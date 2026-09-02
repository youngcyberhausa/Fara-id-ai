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
        <linearGradient id="faraidBgGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#146b3a" />
          <stop offset="55%" stopColor="#0c5f2f" />
          <stop offset="100%" stopColor="#063c22" />
        </linearGradient>
        <linearGradient id="faraidGoldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f3d98a" />
          <stop offset="50%" stopColor="#d9b65c" />
          <stop offset="100%" stopColor="#b8892f" />
        </linearGradient>
        <radialGradient id="faraidSheen" cx="35%" cy="25%" r="70%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
        </radialGradient>
      </defs>

      <circle cx="32" cy="32" r="31" fill="url(#faraidBgGrad)" stroke="url(#faraidGoldGrad)" strokeWidth="2" />
      <circle cx="32" cy="32" r="31" fill="url(#faraidSheen)" />
      <circle cx="32" cy="32" r="25.5" fill="none" stroke="#d9b65c" strokeWidth="0.6" opacity="0.5" />

      {/* Faux-3D "F": dark offset shadow layer + gold face */}
      <text
        x="32.8"
        y="45"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="36"
        fontWeight="700"
        fill="#04200f"
        opacity="0.55"
      >
        F
      </text>
      <text
        x="32"
        y="44"
        textAnchor="middle"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="36"
        fontWeight="700"
        fill="url(#faraidGoldGrad)"
      >
        F
      </text>
    </svg>
  );
}

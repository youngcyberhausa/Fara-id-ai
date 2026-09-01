export default function Logo({ size = 40 }) {
  return (
    <svg
      width={size}
      height={size * 1.2}
      viewBox="0 0 100 120"
      className="shrink-0"
      role="img"
      aria-label="Fara'id AI"
    >
      <defs>
        <linearGradient id="faraidShieldGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#146b3a" />
          <stop offset="100%" stopColor="#0c5f2f" />
        </linearGradient>
      </defs>

      {/* Shield / crest badge */}
      <path
        d="M50,4 C68,4 82,16 82,34 L82,74 C82,96 68,110 50,116 C32,110 18,96 18,74 L18,34 C18,16 32,4 50,4 Z"
        fill="url(#faraidShieldGrad)"
        stroke="#d4af37"
        strokeWidth="2.5"
      />
      <path
        d="M50,9 C65,9 77,19.5 77,34.5 L77,73 C77,92.5 65,104.5 50,110.5 C35,104.5 23,92.5 23,73 L23,34.5 C23,19.5 35,9 50,9 Z"
        fill="none"
        stroke="#d4af37"
        strokeWidth="0.75"
        opacity="0.6"
      />

      {/* Minarets */}
      <rect x="29" y="52" width="4" height="24" rx="1" fill="#ffffff" />
      <circle cx="31" cy="50" r="2.6" fill="#d4af37" />
      <rect x="67" y="52" width="4" height="24" rx="1" fill="#ffffff" />
      <circle cx="69" cy="50" r="2.6" fill="#d4af37" />

      {/* Dome */}
      <path d="M37,58 A13,13 0 0 1 63,58 L63,62 L37,62 Z" fill="#ffffff" />
      <circle cx="50" cy="43" r="2.2" fill="#d4af37" />
      <line x1="50" y1="45.2" x2="50" y2="50" stroke="#ffffff" strokeWidth="1.4" />

      {/* Mosque base */}
      <rect x="35" y="62" width="30" height="15" fill="#ffffff" />
      <path d="M46,77 L46,70 A4,4 0 0 1 54,70 L54,77 Z" fill="#0c5f2f" />

      {/* Open book */}
      <path d="M27,84 Q39,79 50,84 L50,98 Q39,93 27,98 Z" fill="#ffffff" />
      <path d="M73,84 Q61,79 50,84 L50,98 Q61,93 73,98 Z" fill="#ffffff" />
      <line x1="50" y1="84" x2="50" y2="98" stroke="#d4af37" strokeWidth="1" />
      <line x1="31" y1="87" x2="45" y2="84.5" stroke="#0c5f2f" strokeWidth="0.6" opacity="0.4" />
      <line x1="31" y1="91" x2="45" y2="88.5" stroke="#0c5f2f" strokeWidth="0.6" opacity="0.4" />
      <line x1="69" y1="87" x2="55" y2="84.5" stroke="#0c5f2f" strokeWidth="0.6" opacity="0.4" />
      <line x1="69" y1="91" x2="55" y2="88.5" stroke="#0c5f2f" strokeWidth="0.6" opacity="0.4" />
    </svg>
  );
}

import { useEffect, useState } from "react";

const SPLASH_DURATION_MS = 4000;
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)"; // smooth "expo-out" — premium, no bounce

const OUTER_STAR =
  "32.00,2.00 39.65,13.52 53.21,10.79 50.48,24.35 62.00,32.00 50.48,39.65 53.21,53.21 39.65,50.48 32.00,62.00 24.35,50.48 10.79,53.21 13.52,39.65 2.00,32.00 13.52,24.35 10.79,10.79 24.35,13.52";
const INNER_STAR =
  "41.76,8.44 44.73,19.27 55.56,22.24 50.00,32.00 55.56,41.76 44.73,44.73 41.76,55.56 32.00,50.00 22.24,55.56 19.27,44.73 8.44,41.76 14.00,32.00 8.44,22.24 19.27,19.27 22.24,8.44 32.00,14.00";
const GEMS = [
  "32.00,2.40 34.60,5.00 32.00,7.60 29.40,5.00",
  "51.09,10.31 53.69,12.91 51.09,15.51 48.49,12.91",
  "59.00,29.40 61.60,32.00 59.00,34.60 56.40,32.00",
  "51.09,48.49 53.69,51.09 51.09,53.69 48.49,51.09",
  "32.00,56.40 34.60,59.00 32.00,61.60 29.40,59.00",
  "12.91,48.49 15.51,51.09 12.91,53.69 10.31,51.09",
  "5.00,29.40 7.60,32.00 5.00,34.60 2.40,32.00",
  "12.91,10.31 15.51,12.91 12.91,15.51 10.31,12.91",
];

const PARTICLES = Array.from({ length: 8 }, (_, i) => ({
  left: `${12 + ((i * 41) % 76)}%`,
  top: `${10 + ((i * 59) % 80)}%`,
  size: 2 + (i % 3),
  delay: (i % 5) * 0.6,
  duration: 6 + (i % 3) * 1.5,
}));

export default function IntroSplash({ onFinish }) {
  const [fadingOut, setFadingOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadingOut(true), SPLASH_DURATION_MS - 600);
    const finishTimer = setTimeout(() => onFinish(), SPLASH_DURATION_MS);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(finishTimer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden transition-opacity duration-700"
      style={{
        opacity: fadingOut ? 0 : 1,
        background:
          "radial-gradient(circle at 50% 40%, #0d3f28 0%, #062616 55%, #020806 100%)",
      }}
    >
      <style>{`
        @keyframes faraidEntrance {
          from { opacity: 0; transform: scale(0.93); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes faraidDraw { from { stroke-dashoffset: 1; } to { stroke-dashoffset: 0; } }
        @keyframes faraidFillIn { from { fill-opacity: 0; } to { fill-opacity: 1; } }
        @keyframes faraidGemsIn {
          from { opacity: 0; transform: scale(0.55); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes faraidMedallionIn {
          from { opacity: 0; transform: scale(0.88); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes faraidSheen {
          from { transform: translate(-34px, -34px) rotate(20deg); }
          to   { transform: translate(34px, 34px) rotate(20deg); }
        }
        @keyframes faraidGlowPulse {
          0%, 100% { opacity: 0.28; transform: scale(1); }
          50%      { opacity: 0.5; transform: scale(1.05); }
        }
        @keyframes faraidFloat {
          0%, 100% { transform: translateY(0); opacity: 0.35; }
          50%      { transform: translateY(-10px); opacity: 0.6; }
        }
        @keyframes faraidDivider {
          from { opacity: 0; transform: scaleX(0); }
          to   { opacity: 1; transform: scaleX(1); }
        }
        @keyframes faraidTitleIn {
          from { opacity: 0; letter-spacing: 11px; transform: translateY(6px); }
          to   { opacity: 1; letter-spacing: 6px; transform: translateY(0); }
        }
        @keyframes faraidSubtitleIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 0.65; transform: translateY(0); }
        }
      `}</style>

      {/* Sparse bokeh particles */}
      {PARTICLES.map((p, i) => (
        <span
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: p.left,
            top: p.top,
            width: p.size,
            height: p.size,
            background: i % 2 === 0 ? "#4cffb0" : "#f3d98a",
            opacity: 0,
            filter: "blur(0.3px)",
            animation: `faraidFloat ${p.duration}s ease-in-out ${p.delay}s infinite`,
          }}
        />
      ))}

      {/* Soft breathing glow behind the medallion */}
      <div
        className="absolute rounded-full pointer-events-none"
        style={{
          width: 320,
          height: 320,
          background: "radial-gradient(circle, rgba(76,255,176,0.28) 0%, rgba(76,255,176,0) 70%)",
          animation: "faraidGlowPulse 3.2s ease-in-out 1.2s infinite",
        }}
      />

      <svg
        viewBox="0 0 64 64"
        className="w-52 h-52 sm:w-64 sm:h-64 relative"
        role="img"
        aria-label="Fara'id AI"
        style={{
          opacity: 0,
          transformOrigin: "32px 32px",
          animation: `faraidEntrance 1s ${EASE} 0.05s forwards`,
        }}
      >
        <defs>
          <linearGradient id="splashGold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#f3d98a" />
            <stop offset="50%" stopColor="#d9b65c" />
            <stop offset="100%" stopColor="#b8892f" />
          </linearGradient>
          <linearGradient id="splashGreen" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#146b3a" />
            <stop offset="100%" stopColor="#0c5f2f" />
          </linearGradient>
          <radialGradient id="splashSheen" cx="35%" cy="25%" r="70%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.3" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="splashHighlight" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </linearGradient>
          <clipPath id="medallionClip">
            <circle cx="32" cy="32" r="15.5" />
          </clipPath>
        </defs>

        <polygon
          points={OUTER_STAR}
          fill="url(#splashGreen)"
          stroke="url(#splashGold)"
          strokeWidth="1.2"
          strokeLinejoin="round"
          pathLength="1"
          style={{
            fillOpacity: 0,
            strokeDasharray: 1,
            strokeDashoffset: 1,
            animation: `faraidDraw 1.3s ${EASE} 0.15s forwards, faraidFillIn 0.9s ${EASE} 1.15s forwards`,
          }}
        />

        <polygon
          points={INNER_STAR}
          fill="none"
          stroke="url(#splashGold)"
          strokeWidth="0.75"
          pathLength="1"
          style={{
            opacity: 0.8,
            strokeDasharray: 1,
            strokeDashoffset: 1,
            animation: `faraidDraw 1.1s ${EASE} 0.45s forwards`,
          }}
        />

        <g
          style={{
            opacity: 0,
            transformOrigin: "32px 32px",
            animation: `faraidGemsIn 0.7s ${EASE} 1.35s forwards`,
          }}
        >
          {GEMS.map((pts, i) => (
            <polygon key={i} points={pts} fill="url(#splashGold)" stroke="#8a6a1f" strokeWidth="0.3" />
          ))}
        </g>

        <g
          style={{
            opacity: 0,
            transformOrigin: "32px 32px",
            animation: `faraidMedallionIn 0.8s ${EASE} 1.55s forwards`,
          }}
        >
          <circle cx="32" cy="32" r="18.5" fill="none" stroke="url(#splashGold)" strokeWidth="0.5" opacity="0.65" />
          <circle cx="32" cy="32" r="15.5" fill="url(#splashGreen)" stroke="url(#splashGold)" strokeWidth="1.6" />
          <circle cx="32" cy="32" r="15.5" fill="url(#splashSheen)" />
          <circle cx="32" cy="32" r="12.3" fill="none" stroke="#d9b65c" strokeWidth="0.4" opacity="0.5" />
          <text x="32.6" y="38.3" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize="18" fontWeight="700" fill="#04200f" opacity="0.5">
            F
          </text>
          <text x="32" y="37.6" textAnchor="middle" fontFamily="Georgia, 'Times New Roman', serif" fontSize="18" fontWeight="700" fill="url(#splashGold)">
            F
          </text>

          <g clipPath="url(#medallionClip)">
            <rect
              x="18"
              y="-10"
              width="10"
              height="84"
              fill="url(#splashHighlight)"
              style={{ animation: `faraidSheen 1.3s ${EASE} 2.15s forwards` }}
            />
          </g>
        </g>
      </svg>

      <div className="mt-7 text-center pointer-events-none">
        <h1
          className="m-0 text-2xl sm:text-4xl font-semibold"
          style={{
            color: "#e7c976",
            opacity: 0,
            animation: `faraidTitleIn 0.8s ${EASE} 2.15s forwards`,
          }}
        >
          FARA'ID AI
        </h1>
        <div
          className="h-px mx-auto mt-3 mb-3"
          style={{
            width: 46,
            background: "linear-gradient(90deg, transparent, #d9b65c, transparent)",
            opacity: 0,
            transform: "scaleX(0)",
            animation: `faraidDivider 0.7s ${EASE} 2.5s forwards`,
          }}
        />
        <p
          className="text-white text-[10.5px]"
          style={{
            letterSpacing: "3px",
            opacity: 0,
            animation: `faraidSubtitleIn 0.7s ${EASE} 2.7s forwards`,
          }}
        >
          ISLAMIC INHERITANCE INTELLIGENCE
        </p>
      </div>

      <button
        onClick={onFinish}
        className="fixed bottom-9 right-1/2 translate-x-1/2 sm:right-7 sm:translate-x-0 text-[10px] text-white/50 hover:text-white/80 border border-white/20 rounded-full px-4 py-2 transition-colors"
        style={{ letterSpacing: "2px" }}
      >
        SKIP
      </button>
    </div>
  );
}

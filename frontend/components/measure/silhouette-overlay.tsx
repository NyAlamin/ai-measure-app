"use client";

export function SilhouetteOverlay() {
  return (
    <svg
      viewBox="0 0 300 600"
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
    >
      <defs>
        <linearGradient id="bodyFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(168,130,255,0.22)" />
          <stop offset="100%" stopColor="rgba(168,130,255,0.06)" />
        </linearGradient>
        <linearGradient id="bodyStroke" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="100%" stopColor="rgba(200,180,255,0.7)" />
        </linearGradient>
      </defs>

      {/* filled professional human body silhouette */}
      <path
        d="M150 48
           c-15 0 -27 12 -27 27
           c0 11 6 20 15 25
           c-10 4 -17 11 -20 22
           l-14 52
           c-2 8 -10 11 -16 9
           c-5 -2 -7 -8 -5 -14
           M150 48
           c15 0 27 12 27 27
           c0 11 -6 20 -15 25
           c10 4 17 11 20 22
           l14 52
           c2 8 10 11 16 9
           c5 -2 7 -8 5 -14
           M123 122
           c8 -4 18 -6 27 -6
           c9 0 19 2 27 6
           c6 28 8 56 6 84
           c-1 14 -3 28 -6 42
           c8 50 9 100 6 150
           c-1 16 -3 32 -6 48
           c-2 10 -12 14 -20 12
           c-7 -2 -10 -9 -9 -17
           c2 -40 2 -80 -2 -120
           c-4 40 -4 80 -2 120
           c1 8 -2 15 -9 17
           c-8 2 -18 -2 -20 -12
           c-3 -16 -5 -32 -6 -48
           c-3 -50 -2 -100 6 -150
           c-3 -14 -5 -28 -6 -42
           c-2 -28 0 -56 6 -84 Z"
        fill="url(#bodyFill)"
        stroke="url(#bodyStroke)"
        strokeWidth="2"
        strokeLinejoin="round"
        strokeDasharray="7 6"
      />

      {/* center posture line */}
      <line
        x1="150" y1="78" x2="150" y2="520"
        stroke="rgba(255,255,255,0.18)"
        strokeWidth="1.5"
        strokeDasharray="3 9"
      />

      {/* rotation ring at feet */}
      <ellipse
        cx="150" cy="548" rx="95" ry="20"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="3"
        strokeDasharray="6 8"
        strokeLinecap="round"
        opacity="0.9"
      />
      <circle cx="245" cy="548" r="6" fill="var(--color-primary)" />
      <path
        d="M239 539 L247 546 L255 539"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
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
        <linearGradient id="guideGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.15)" />
        </linearGradient>
      </defs>

      {/* professional body silhouette */}
      <g
        fill="none"
        stroke="url(#guideGlow)"
        strokeWidth="1.8"
        strokeDasharray="8 6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* head */}
        <ellipse cx="150" cy="72" rx="22" ry="26" />

        {/* neck */}
        <path d="M141 96 L141 108 M159 96 L159 108" />

        {/* shoulders */}
        <path d="M141 108 C135 108 118 112 108 118" />
        <path d="M159 108 C165 108 182 112 192 118" />

        {/* arms - left */}
        <path d="M108 118 C104 135 100 160 98 180" />
        <path d="M98 180 C96 200 94 220 92 240" />

        {/* arms - right */}
        <path d="M192 118 C196 135 200 160 202 180" />
        <path d="M202 180 C204 200 206 220 208 240" />

        {/* torso */}
        <path d="M108 118 C110 150 112 170 118 200" />
        <path d="M192 118 C190 150 188 170 182 200" />

        {/* waist curve */}
        <path d="M118 200 C122 210 130 218 134 222" />
        <path d="M182 200 C178 210 170 218 166 222" />

        {/* hips */}
        <path d="M134 222 C130 235 126 250 124 265" />
        <path d="M166 222 C170 235 174 250 176 265" />

        {/* legs - left */}
        <path d="M124 265 C122 310 120 360 118 410" />
        <path d="M118 410 C117 440 116 470 115 500" />

        {/* legs - right */}
        <path d="M176 265 C178 310 180 360 182 410" />
        <path d="M182 410 C183 440 184 470 185 500" />

        {/* feet */}
        <path d="M115 500 C112 505 108 508 104 510" />
        <path d="M185 500 C188 505 192 508 196 510" />
      </g>

      {/* center line (posture guide) */}
      <line
        x1="150" y1="50" x2="150" y2="520"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="1"
        strokeDasharray="4 12"
      />

      {/* rotation ellipse at the feet */}
      <ellipse
        cx="150"
        cy="535"
        rx="90"
        ry="20"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="2.5"
        strokeDasharray="6 8"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* direction dot on the ellipse */}
      <circle cx="240" cy="535" r="5" fill="var(--color-primary)" opacity="0.9" />

      {/* small arrow showing rotation direction */}
      <path
        d="M236 527 L242 533 L248 527"
        fill="none"
        stroke="var(--color-primary)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
      />
    </svg>
  );
}
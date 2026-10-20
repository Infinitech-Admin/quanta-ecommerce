// components/products-background.tsx
// Full-page background: cream glow (top-left) fading to green (bottom-right)
// with a large translucent calligraphic "Q" anchored bottom-right.
// The Q is sized to the viewport HEIGHT ("meet"), so the whole letter
// (ring, curl and tail) stays visible on any screen. Pure CSS + SVG.
export function ProductsBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{
        backgroundImage: [
          "radial-gradient(ellipse 60% 70% at 5% 3%, rgba(253,253,238,0.95), rgba(253,253,238,0) 70%)",
          "linear-gradient(135deg, #f3f8dc 0%, #d3edb8 28%, #8fcf98 60%, #349a63 100%)",
        ].join(", "),
      }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 447 410"
        preserveAspectRatio="xMaxYMax meet"
      >
        <defs>
          <linearGradient
            id="pb-q"
            gradientUnits="userSpaceOnUse"
            x1="60"
            y1="0"
            x2="470"
            y2="400"
          >
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.62" />
            <stop offset="0.55" stopColor="#ffffff" stopOpacity="0.32" />
            <stop offset="1" stopColor="#ffffff" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {/* Q drawn as a solid mask, so overlaps (tail over ring) don't double up */}
        <mask
          id="pb-qmask"
          maskUnits="userSpaceOnUse"
          x="-200"
          y="-200"
          width="900"
          height="900"
        >
          <g fill="#fff">
            {/* Ring: thick on the left/top-left, thin on the right/bottom */}
            <g transform="rotate(14 265 190)">
              <path
                fillRule="evenodd"
                d="M60 190 A205 175 0 1 0 470 190 A205 175 0 1 0 60 190 Z
                   M138 195 A152 135 0 1 0 442 195 A152 135 0 1 0 138 195 Z"
              />
            </g>
            {/* Small hairline curl at the top of the Q */}
            <path
              d="M262 18 C288 4 318 18 312 48 C309 62 298 66 292 61"
              fill="none"
              stroke="#fff"
              strokeWidth="9"
              strokeLinecap="round"
            />
            {/* Tail: rounded diagonal bar crossing the bottom-right of the ring */}
            <rect
              x="295"
              y="302"
              width="190"
              height="46"
              rx="23"
              transform="rotate(48 390 325)"
            />
          </g>
        </mask>
        <rect
          x="-200"
          y="-200"
          width="900"
          height="900"
          fill="url(#pb-q)"
          mask="url(#pb-qmask)"
        />
      </svg>
    </div>
  );
}

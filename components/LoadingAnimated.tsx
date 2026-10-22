"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/* Everything is drawn in the coordinate space of the reference image
   (587 x 289). The ribbon is generated from a centerline plus a width
   profile: it starts hidden inside the roll, dips below it, then sweeps
   up and over to a diagonal-cut tail. */
const PTS: [number, number][] = [
  [110, 150],
  [165, 178],
  [240, 187],
  [310, 153],
  [375, 122],
  [440, 122],
  [500, 150],
  [540, 168],
];
const WID = [60, 62, 64, 66, 66, 66, 68, 70];

/* Perforation positions along the ribbon (0..1) */
const PERFS = [0.16, 0.34, 0.52, 0.7, 0.88];
/* Embossed motif positions (0..1) and scale: one per sheet */
const MOTIFS: [number, number][] = [
  [0.25, 1],
  [0.43, 1],
  [0.61, 1],
  [0.79, 1],
  [0.94, 0.8],
];

function buildRibbon() {
  const seg = PTS.length - 1;
  const N = 120;
  const P = (j: number) => PTS[Math.max(0, Math.min(seg, j))];
  const W = (j: number) => WID[Math.max(0, Math.min(seg, j))];
  const cr = (a: number, b: number, c: number, d: number, t: number) =>
    0.5 *
    (2 * b +
      (-a + c) * t +
      (2 * a - 5 * b + 4 * c - d) * t * t +
      (-a + 3 * b - 3 * c + d) * t * t * t);

  const c: [number, number][] = [];
  const w: number[] = [];
  for (let i = 0; i <= N; i++) {
    const u = (i / N) * seg;
    const k = Math.min(Math.floor(u), seg - 1);
    const t = u - k;
    c.push([
      cr(P(k - 1)[0], P(k)[0], P(k + 1)[0], P(k + 2)[0], t),
      cr(P(k - 1)[1], P(k)[1], P(k + 1)[1], P(k + 2)[1], t),
    ]);
    w.push(cr(W(k - 1), W(k), W(k + 1), W(k + 2), t));
  }

  const top: [number, number][] = [];
  const bottom: [number, number][] = [];
  const angle: number[] = [];
  for (let i = 0; i <= N; i++) {
    const a = c[Math.max(i - 1, 0)];
    const b = c[Math.min(i + 1, N)];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;
    angle.push((Math.atan2(dy, dx) * 180) / Math.PI);
    top.push([c[i][0] - (nx * w[i]) / 2, c[i][1] - (ny * w[i]) / 2]);
    bottom.push([c[i][0] + (nx * w[i]) / 2, c[i][1] + (ny * w[i]) / 2]);
  }

  const f = ([x, y]: [number, number]) => `${x.toFixed(1)} ${y.toFixed(1)}`;
  const line = (pts: [number, number][]) => pts.map(f).join(" L ");

  const perfs = PERFS.map((p) => {
    const i = Math.round(p * N);
    const lerp = (t: number) => ({
      x: top[i][0] + (bottom[i][0] - top[i][0]) * t,
      y: top[i][1] + (bottom[i][1] - top[i][1]) * t,
    });
    const a = lerp(0.06);
    const b = lerp(0.94);
    return { x1: a.x, y1: a.y, x2: b.x, y2: b.y };
  });

  const motifs = MOTIFS.map(([p, s]) => {
    const i = Math.round(p * N);
    return { x: c[i][0], y: c[i][1], a: angle[i], s };
  });

  return {
    shape: `M ${line(top)} L ${line([...bottom].reverse())} Z`,
    edge: `M ${line(bottom)}`,
    center: `M ${line(c)}`,
    perfs,
    motifs,
  };
}

const RIBBON = buildRibbon();
const RIBBON_D = RIBBON.shape;
const CENTER_D = RIBBON.center;
const EDGE_D = RIBBON.edge;

export default function LoadingAnimated({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => setReady(true), []);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setMounted(true), 500);
      return () => clearTimeout(t);
    }
  }, [loading]);

  return (
    <>
      {ready &&
        !mounted &&
        createPortal(
          <div
            role="status"
            aria-label="Loading"
            className={cn(
              "fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#008548] transition-opacity duration-500",
              loading ? "opacity-100" : "opacity-0 pointer-events-none",
            )}
          >
            <div className="flex flex-col items-center px-6">
              <svg
                viewBox="0 0 587 289"
                className="stage h-auto w-[min(90vw,500px)] overflow-visible"
                aria-hidden="true"
              >
                <defs>
                  {/* ---------- roll ---------- */}
                  <linearGradient id="qp-body" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="0.55" stopColor="#f6f8f6" />
                    <stop offset="1" stopColor="#d3dad5" />
                  </linearGradient>
                  <linearGradient id="qp-body-side" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#8a9a90" stopOpacity="0" />
                    <stop offset="0.65" stopColor="#8a9a90" stopOpacity="0" />
                    <stop offset="1" stopColor="#8a9a90" stopOpacity="0.28" />
                  </linearGradient>
                  <radialGradient id="qp-face" cx="0.38" cy="0.3" r="0.95">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="1" stopColor="#e6ebe8" />
                  </radialGradient>
                  <linearGradient id="qp-core" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#d2ab7e" />
                    <stop offset="1" stopColor="#9a7449" />
                  </linearGradient>
                  {/* inside of the tube: dark on the left, lit wall on the right */}
                  <linearGradient id="qp-hole" x1="0" y1="0" x2="1" y2="0.6">
                    <stop offset="0" stopColor="#3b2818" />
                    <stop offset="0.5" stopColor="#6e4f31" />
                    <stop offset="1" stopColor="#a17b52" />
                  </linearGradient>

                  {/* ---------- ribbon ---------- */}
                  <linearGradient id="qp-ribbon" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stopColor="#e3e8e4" />
                    <stop offset="0.14" stopColor="#ffffff" />
                    <stop offset="0.4" stopColor="#f3f5f3" />
                    <stop offset="0.58" stopColor="#ffffff" />
                    <stop offset="0.8" stopColor="#eaeeeb" />
                    <stop offset="1" stopColor="#fbfcfb" />
                  </linearGradient>
                  <linearGradient
                    id="qp-ribbon-shade"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0" stopColor="#ffffff" stopOpacity="0.45" />
                    <stop offset="0.55" stopColor="#ffffff" stopOpacity="0" />
                    <stop offset="1" stopColor="#9aa89f" stopOpacity="0.3" />
                  </linearGradient>

                  {/* Very subtle tissue grain, multiplied over the paper */}
                  <filter
                    id="qp-tissue"
                    x="-3%"
                    y="-3%"
                    width="106%"
                    height="106%"
                    colorInterpolationFilters="sRGB"
                  >
                    <feTurbulence
                      type="fractalNoise"
                      baseFrequency="0.45"
                      numOctaves="2"
                      seed="7"
                      result="noise"
                    />
                    <feDiffuseLighting
                      in="noise"
                      lightingColor="#ffffff"
                      surfaceScale="0.35"
                      diffuseConstant="1.04"
                      result="lit"
                    >
                      <feDistantLight azimuth="225" elevation="68" />
                    </feDiffuseLighting>
                    <feComposite
                      in="lit"
                      in2="SourceAlpha"
                      operator="in"
                      result="litClip"
                    />
                    <feBlend in="SourceGraphic" in2="litClip" mode="multiply" />
                  </filter>

                  <clipPath id="qp-ribbon-clip">
                    <path d={RIBBON_D} />
                  </clipPath>
                  <filter
                    id="qp-blur"
                    x="-50%"
                    y="-50%"
                    width="200%"
                    height="200%"
                  >
                    <feGaussianBlur stdDeviation="8" />
                  </filter>

                  {/* ---------- embossed leaf motif ---------- */}
                  <path
                    id="qp-leaf"
                    d="M 0 0 C 3 -9 13 -13 22 -7 C 16 0 7 3 0 0 Z"
                  />
                  <g
                    id="qp-motif"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    {[45, 135, 225, 315].map((a) => (
                      <use key={a} href="#qp-leaf" transform={`rotate(${a})`} />
                    ))}
                    <circle r="3.4" />
                    <circle cx="29" cy="0" r="1.8" />
                    <circle cx="-29" cy="0" r="1.8" />
                    <circle cx="0" cy="29" r="1.8" />
                    <circle cx="0" cy="-29" r="1.8" />
                  </g>

                  {/* Reveal mask that follows the ribbon's centerline */}
                  <mask
                    id="qp-reveal"
                    maskUnits="userSpaceOnUse"
                    x="0"
                    y="-40"
                    width="600"
                    height="360"
                  >
                    <path
                      className="reveal"
                      d={CENTER_D}
                      pathLength={1}
                      fill="none"
                      stroke="#fff"
                      strokeWidth="150"
                    />
                  </mask>
                </defs>

                {/* ribbon, drawn first so the roll sits on top */}
                <g mask="url(#qp-reveal)">
                  <g filter="url(#qp-tissue)">
                    <path d={RIBBON_D} fill="url(#qp-ribbon)" />
                    <path d={RIBBON_D} fill="url(#qp-ribbon-shade)" />
                  </g>

                  {/* perforations */}
                  {RIBBON.perfs.map((p, i) => (
                    <line
                      key={i}
                      x1={p.x1}
                      y1={p.y1}
                      x2={p.x2}
                      y2={p.y2}
                      stroke="#a9b5ae"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeDasharray="0.1 4"
                    />
                  ))}

                  {/* embossed motifs: light offset + soft shadow line */}
                  {RIBBON.motifs.map((m, i) => (
                    <g
                      key={i}
                      transform={`translate(${m.x.toFixed(1)} ${m.y.toFixed(
                        1,
                      )}) rotate(${m.a.toFixed(1)}) scale(${m.s})`}
                    >
                      <use
                        href="#qp-motif"
                        transform="translate(0.9 0.9)"
                        stroke="#ffffff"
                        strokeOpacity="0.95"
                        strokeWidth="1.5"
                      />
                      <use
                        href="#qp-motif"
                        stroke="#a7b3ac"
                        strokeOpacity="0.7"
                        strokeWidth="1.1"
                      />
                    </g>
                  ))}

                  {/* shadow cast by the roll onto the paper */}
                  <g clipPath="url(#qp-ribbon-clip)">
                    <ellipse
                      cx="150"
                      cy="172"
                      rx="62"
                      ry="14"
                      fill="#2d3b33"
                      opacity="0.26"
                      filter="url(#qp-blur)"
                    />
                  </g>

                  {/* crisp lower edge so the paper has thickness */}
                  <path
                    d={EDGE_D}
                    fill="none"
                    stroke="#b9c3bc"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </g>

                {/* roll (slightly tilted, like the reference) */}
                <g className="roll">
                  <g transform="rotate(-8 84 112)">
                    <path
                      d="M 84 36 H 158 A 52 76 0 0 1 158 188 H 84 Z"
                      fill="url(#qp-body)"
                      filter="url(#qp-tissue)"
                    />
                    <path
                      d="M 84 36 H 158 A 52 76 0 0 1 158 188 H 84 Z"
                      fill="url(#qp-body-side)"
                    />

                    {/* end face */}
                    <ellipse
                      cx="84"
                      cy="112"
                      rx="52"
                      ry="76"
                      fill="url(#qp-face)"
                      stroke="#d3dad5"
                      strokeWidth="1.4"
                      filter="url(#qp-tissue)"
                    />
                    <ellipse
                      cx="84"
                      cy="112"
                      rx="44"
                      ry="64"
                      fill="none"
                      stroke="#e1e6e2"
                      strokeWidth="1.5"
                    />
                    <ellipse
                      cx="84"
                      cy="112"
                      rx="36"
                      ry="52"
                      fill="none"
                      stroke="#e7ebe8"
                      strokeWidth="1.5"
                    />

                    {/* cardboard core */}
                    <ellipse
                      cx="84"
                      cy="112"
                      rx="27"
                      ry="37"
                      fill="url(#qp-core)"
                    />
                    <ellipse
                      cx="85"
                      cy="113"
                      rx="23"
                      ry="32"
                      fill="url(#qp-hole)"
                    />
                    <path
                      d="M 66 134 A 23 32 0 0 0 104 134"
                      fill="none"
                      stroke="#ffffff"
                      strokeOpacity="0.28"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </g>
                </g>
              </svg>

              <p className="brand mt-6 whitespace-nowrap font-serif text-sm tracking-[0.3em] text-white/90">
                QUANTA&nbsp;PAPER
              </p>
            </div>
          </div>,
          document.body,
        )}

      <div
        className={cn(
          "transition-opacity duration-700",
          mounted ? "opacity-100" : "opacity-0",
          className,
        )}
      >
        {children}
      </div>

      <style jsx>{`
        .stage {
          filter: drop-shadow(0 14px 14px rgba(0, 51, 28, 0.35));
          animation: float 2.6s ease-in-out 2000ms infinite;
        }

        /* Paper pays out from under the roll along the curve. */
        .reveal {
          stroke-dasharray: 1;
          stroke-dashoffset: 1;
          animation: unroll 1.7s cubic-bezier(0.25, 0.8, 0.3, 1) 300ms forwards;
        }

        /* Roll settles in as the paper leaves it. */
        .roll {
          transform-box: fill-box;
          transform-origin: center;
          animation: nudge 1.7s cubic-bezier(0.22, 1, 0.36, 1) 300ms both;
        }

        .brand {
          opacity: 0;
          animation: fade-in 700ms ease-out 1100ms forwards;
        }

        @keyframes unroll {
          to {
            stroke-dashoffset: 0;
          }
        }
        @keyframes nudge {
          0% {
            transform: translateX(-10px) rotate(-6deg);
          }
          100% {
            transform: translateX(0) rotate(0deg);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-5px);
          }
        }
        @keyframes fade-in {
          to {
            opacity: 1;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .reveal,
          .roll,
          .stage,
          .brand {
            animation: none;
          }
          .reveal {
            stroke-dashoffset: 0;
          }
          .brand {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

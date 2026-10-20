"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

const DUR = 2.4; // seconds per loop
const FRAMES = 16;

// A point along the tissue sheet (t = 0 at the roll, 1 at the tail)
function ribbonPoint(t: number, phase: number) {
  const env = Math.min(1, t * 2.5);
  const yc = 146 + env * (18 + 16 * Math.sin(2 * Math.PI * (1.15 * t - phase)));
  const h = 30 + 10 * t;
  const x = 118 + 322 * t;
  return { xt: x, yt: yc - h / 2, xb: x - 16 * t, yb: yc + h / 2 };
}

const f = (n: number) => n.toFixed(1);

function ribbonPath(phase: number) {
  const n = 30;
  const top: string[] = [];
  const bot: string[] = [];
  for (let i = 0; i <= n; i++) {
    const p = ribbonPoint(i / n, phase);
    top.push(`${f(p.xt)},${f(p.yt)}`);
    bot.unshift(`${f(p.xb)},${f(p.yb)}`);
  }
  return `M${top.join(" L")} L${bot.join(" L")} Z`;
}

function perforationPath(phase: number) {
  return [0.42, 0.58, 0.74, 0.9]
    .map((t) => {
      const p = ribbonPoint(t, phase);
      return `M${f(p.xt)},${f(p.yt)} L${f(p.xb)},${f(p.yb)}`;
    })
    .join(" ");
}

// wound tissue layers on the roll face (drawn as a circle, squashed by the group scale)
function spiralPath() {
  const turns = 4;
  const steps = turns * 28;
  const pts: string[] = [];
  for (let i = 0; i <= steps; i++) {
    const k = i / steps;
    const a = k * turns * 2 * Math.PI;
    const r = 36 + 22 * k;
    pts.push(`${f(r * Math.cos(a))},${f(r * Math.sin(a))}`);
  }
  return `M${pts.join(" L")}`;
}

const frames = (fn: (phase: number) => string) =>
  Array.from({ length: FRAMES + 1 }, (_, i) => fn(i / FRAMES)).join(";");

const RIBBON_VALUES = frames(ribbonPath);
const PERF_VALUES = frames(perforationPath);
const SPIRAL = spiralPath();

export default function LoadingAnimated({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setReduceMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
    const t = setTimeout(() => setLoading(false), 2200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setMounted(true), 500);
      return () => clearTimeout(t);
    }
  }, [loading]);

  const dur = `${DUR}s`;
  const anim = !reduceMotion;

  return (
    <>
      {!mounted && (
        <div
          className={cn(
            "fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 overflow-hidden bg-[#008a4b] transition-opacity duration-500",
            loading ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          {/* Tissue roll: the roll spins while the sheet unrolls and waves */}
          <svg
            viewBox="16 10 480 240"
            className="block h-auto w-[min(88vw,480px)] overflow-visible"
            role="img"
            aria-label="Loading"
          >
            <defs>
              <radialGradient id="tp-face" cx="0.35" cy="0.3" r="0.85">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="0.75" stopColor="#f3f3f0" />
                <stop offset="1" stopColor="#dededa" />
              </radialGradient>
              <linearGradient id="tp-body" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0" stopColor="#f7f7f4" />
                <stop offset="1" stopColor="#d9d9d4" />
              </linearGradient>
              <linearGradient id="tp-sheet" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="#ffffff" />
                <stop offset="1" stopColor="#e4e4e0" />
              </linearGradient>
              <radialGradient id="tp-core" cx="0.5" cy="0.4" r="0.7">
                <stop offset="0" stopColor="#6d4629" />
                <stop offset="1" stopColor="#3f2815" />
              </radialGradient>
            </defs>

            {/* ground shadow */}
            <ellipse
              cx="256"
              cy="224"
              rx="132"
              ry="8"
              fill="#00391f"
              opacity="0.28"
            >
              {anim && (
                <>
                  <animate
                    attributeName="rx"
                    values="132;118;132"
                    keyTimes="0;0.5;1"
                    calcMode="spline"
                    keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
                    dur={dur}
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.28;0.18;0.28"
                    keyTimes="0;0.5;1"
                    dur={dur}
                    repeatCount="indefinite"
                  />
                </>
              )}
            </ellipse>

            <g>
              {anim && (
                <animateTransform
                  attributeName="transform"
                  type="translate"
                  values="0 0;0 -9;0 0"
                  keyTimes="0;0.5;1"
                  calcMode="spline"
                  keySplines="0.45 0 0.55 1;0.45 0 0.55 1"
                  dur={dur}
                  repeatCount="indefinite"
                />
              )}

              {/* tissue sheet (behind the roll so it comes out from under it) */}
              <path
                d={ribbonPath(0)}
                fill="url(#tp-sheet)"
                stroke="#d6d6d1"
                strokeWidth="0.8"
                strokeLinejoin="round"
              >
                {anim && (
                  <animate
                    attributeName="d"
                    values={RIBBON_VALUES}
                    dur={dur}
                    repeatCount="indefinite"
                  />
                )}
              </path>
              <path
                d={perforationPath(0)}
                fill="none"
                stroke="#c9c9c4"
                strokeWidth="1.2"
                strokeDasharray="2 3"
                strokeLinecap="round"
              >
                {anim && (
                  <animate
                    attributeName="d"
                    values={PERF_VALUES}
                    dur={dur}
                    repeatCount="indefinite"
                  />
                )}
              </path>

              {/* roll body */}
              <ellipse cx="172" cy="100" rx="46" ry="60" fill="#d9d9d4" />
              <path
                d="M112 40 L172 40 L172 160 L112 160 Z"
                fill="url(#tp-body)"
              />

              {/* front face */}
              <ellipse
                cx="112"
                cy="100"
                rx="46"
                ry="60"
                fill="url(#tp-face)"
                stroke="#d2d2cd"
                strokeWidth="1"
              />

              {/* wound layers, spinning */}
              <g transform="translate(112 100) scale(0.767 1)">
                <path
                  d={SPIRAL}
                  fill="none"
                  stroke="#cbcbc6"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {anim && (
                    <animateTransform
                      attributeName="transform"
                      type="rotate"
                      from="0 0 0"
                      to="360 0 0"
                      dur={dur}
                      repeatCount="indefinite"
                    />
                  )}
                </path>
              </g>

              {/* cardboard core */}
              <ellipse cx="112" cy="100" rx="26" ry="34" fill="#a9754a" />
              <ellipse cx="112" cy="100" rx="18" ry="24" fill="url(#tp-core)" />
              <ellipse
                cx="112"
                cy="100"
                rx="18"
                ry="24"
                fill="none"
                stroke="#3a2412"
                strokeWidth="1.4"
                opacity="0.6"
              />
            </g>
          </svg>

          <div className="flex flex-col items-center gap-3">
            <p className="whitespace-nowrap font-serif text-sm tracking-[0.3em] text-white">
              QUANTA&nbsp;PAPER
            </p>
            <div className="flex gap-1.5" aria-hidden="true">
              <span className="dot" style={{ animationDelay: "0ms" }} />
              <span className="dot" style={{ animationDelay: "180ms" }} />
              <span className="dot" style={{ animationDelay: "360ms" }} />
            </div>
          </div>
        </div>
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
        .dot {
          display: block;
          height: 6px;
          width: 6px;
          border-radius: 9999px;
          background: #ffffff;
          opacity: 0.35;
          animation: pulse 1s ease-in-out infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.35;
            transform: translateY(0);
          }
          50% {
            opacity: 1;
            transform: translateY(-3px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .dot {
            animation: none;
            opacity: 0.7;
          }
        }
      `}</style>
    </>
  );
}

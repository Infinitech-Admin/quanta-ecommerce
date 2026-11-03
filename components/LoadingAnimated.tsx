"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

/* Rolling-tissue loader, redrawn to match the reference video:
   a round roll (back disc offset up-left, light blue-grey body) rolls left
   to right, peeling a flat perforated strip onto the ground behind it.

   Speed-ups vs. the old version:
   - shorter animation (about 1.9s instead of 3.8s + 0.5s)
   - plays once per browser session, not on every page load / refresh
   - skipped for people who prefer reduced motion
   - the page renders underneath the overlay, so it is never kept waiting */
const CYCLE_MS = 1500;
/* logo appears as the roll finishes and stays until the page shows */
const LOGO_DELAY_MS = 900;
const TOTAL_MS = 1900;
const FADE_OUT_MS = 300;
const SEEN_KEY = "qp-loader-seen";

const R = 50; // face radius
const BX = -20; // back disc offset (up-left of the face)
const BY = -10.5;
const FACE_Y = 133; // face centre y
const START_X = 155; // face centre x at start / end of the roll
const END_X = 335;
const TRAVEL = END_X - START_X;
const STRIP_LEFT = 30;
const RAMP = 66; // length of the part of the strip lifting into the roll
const FLAT_MAX = END_X - RAMP - STRIP_LEFT;
const FLAT_START = (START_X - RAMP - STRIP_LEFT) / FLAT_MAX;
const SPIN_DEG = Math.round((TRAVEL / R) * (180 / Math.PI));
const TICKS = [0.17, 0.34, 0.51, 0.68, 0.85].map(
  (p) => STRIP_LEFT + p * FLAT_MAX,
);

/* tangent points joining the back disc to the face */
const len = Math.hypot(BX, BY);
const nx = -BY / len;
const ny = BX / len;
const T = [
  [nx * R, ny * R], // face, one side
  [BX + nx * R, BY + ny * R], // back, same side
  [BX - nx * R, BY - ny * R], // back, other side
  [-nx * R, -ny * R], // face, other side
];

function arc(r: number, a0: number, a1: number) {
  const p = (a: number) => {
    const t = (a * Math.PI) / 180;
    return `${(Math.cos(t) * r).toFixed(2)} ${(Math.sin(t) * r).toFixed(2)}`;
  };
  return `M ${p(a0)} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${p(a1)}`;
}

type Phase = "pending" | "play" | "done";

export default function LoadingAnimated({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [phase, setPhase] = useState<Phase>("pending");
  const [fading, setFading] = useState(false);

  // Decide once on mount whether the loader should play at all.
  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
      /* storage blocked: just play it */
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (seen || reduceMotion) {
      setPhase("done");
      return;
    }

    try {
      sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* ignore */
    }
    setPhase("play");
  }, []);

  // Run the timers only while the loader is playing.
  useEffect(() => {
    if (phase !== "play") return;

    const fadeTimer = setTimeout(() => setFading(true), TOTAL_MS);
    const doneTimer = setTimeout(
      () => setPhase("done"),
      TOTAL_MS + FADE_OUT_MS,
    );

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(doneTimer);
    };
  }, [phase]);

  return (
    <>
      {phase === "play" &&
        createPortal(
          <div
            role="status"
            aria-label="Loading"
            className={cn(
              "fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#f6f9fb] transition-opacity duration-300",
              fading ? "opacity-0 pointer-events-none" : "opacity-100",
            )}
          >
            <div className="flex flex-col items-center px-6">
              <svg
                viewBox="0 40 480 180"
                className="h-auto w-[min(92vw,560px)] overflow-visible"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="qp-face" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#ffffff" />
                    <stop offset="1" stopColor="#f3f6f9" />
                  </linearGradient>
                  <linearGradient id="qp-strip" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#e9eff6" />
                    <stop offset="1" stopColor="#d9e2ec" />
                  </linearGradient>
                  <linearGradient id="qp-core" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0" stopColor="#c3a97f" />
                    <stop offset="1" stopColor="#a98d63" />
                  </linearGradient>
                  <filter
                    id="qp-blur"
                    x="-50%"
                    y="-300%"
                    width="200%"
                    height="700%"
                  >
                    <feGaussianBlur stdDeviation="5" />
                  </filter>
                  <clipPath id="qp-strip-clip">
                    <rect
                      className="strip-clip"
                      x={STRIP_LEFT}
                      y={FACE_Y}
                      width={FLAT_MAX}
                      height={80}
                    />
                  </clipPath>
                </defs>

                <g className="cycle">
                  {/* soft shadow, offset to the right like the reference */}
                  <g transform={`translate(${START_X} ${FACE_Y})`}>
                    <g className="move">
                      <ellipse
                        cx={14}
                        cy={R + 8}
                        rx={68}
                        ry={8}
                        fill="#7a8a9c"
                        opacity={0.3}
                        filter="url(#qp-blur)"
                      />
                    </g>
                  </g>

                  {/* flat part of the strip, revealed as the roll advances */}
                  <g clipPath="url(#qp-strip-clip)">
                    <rect
                      x={STRIP_LEFT}
                      y={FACE_Y + R - 1}
                      width={FLAT_MAX}
                      height={6}
                      fill="url(#qp-strip)"
                    />
                    <line
                      x1={STRIP_LEFT}
                      x2={STRIP_LEFT + FLAT_MAX}
                      y1={FACE_Y + R - 0.5}
                      y2={FACE_Y + R - 0.5}
                      stroke="#f4f7fb"
                      strokeWidth={1}
                    />
                    {TICKS.map((x) => (
                      <line
                        key={x}
                        x1={x}
                        x2={x}
                        y1={FACE_Y + R - 1}
                        y2={FACE_Y + R + 5}
                        stroke="#c3d0de"
                        strokeWidth={0.8}
                        strokeDasharray="1 1"
                      />
                    ))}
                  </g>

                  <g transform={`translate(${START_X} ${FACE_Y})`}>
                    <g className="move">
                      {/* strip lifting into the bottom of the roll */}
                      <polygon
                        points={`${-RAMP},${R - 1} -4,${R - 10} 8,${R - 10} 8,${
                          R - 4
                        } -4,${R - 4} ${-RAMP},${R + 5}`}
                        fill="url(#qp-strip)"
                      />
                      <polyline
                        points={`${-RAMP},${R - 1} -4,${R - 10}`}
                        fill="none"
                        stroke="#f4f7fb"
                        strokeWidth={1}
                      />

                      {/* back disc + body */}
                      <circle
                        cx={BX}
                        cy={BY}
                        r={R}
                        fill="#dde6f0"
                        stroke="#bccbdb"
                        strokeWidth={0.9}
                      />
                      <polygon
                        points={T.map((p) => p.join(",")).join(" ")}
                        fill="#dde6f0"
                      />
                      <line
                        x1={T[0][0]}
                        y1={T[0][1]}
                        x2={T[1][0]}
                        y2={T[1][1]}
                        stroke="#bccbdb"
                        strokeWidth={0.9}
                      />
                      <line
                        x1={T[2][0]}
                        y1={T[2][1]}
                        x2={T[3][0]}
                        y2={T[3][1]}
                        stroke="#bccbdb"
                        strokeWidth={0.9}
                      />
                      {/* tail flap at the top of the roll */}
                      <polygon
                        points={`${BX},${BY - R} ${BX + 48},${BY - R + 10.5} ${BX},${
                          BY - R + 10.5
                        }`}
                        fill="#eef3f9"
                      />
                      <line
                        x1={BX}
                        y1={BY - R}
                        x2={BX}
                        y2={BY - R + 10.5}
                        stroke="#d3deea"
                        strokeWidth={0.8}
                      />

                      {/* front face */}
                      <circle
                        r={R}
                        fill="url(#qp-face)"
                        stroke="#c9d6e3"
                        strokeWidth={1}
                      />
                      <circle
                        r={R - 3}
                        fill="none"
                        stroke="#e6edf4"
                        strokeWidth={1.2}
                      />

                      {/* layers that turn as the roll rolls */}
                      <g className="spin">
                        <circle
                          r={R * 0.78}
                          fill="none"
                          stroke="#e8eef4"
                          strokeWidth={0.9}
                        />
                        <path
                          d={arc(R * 0.86, 100, 330)}
                          fill="none"
                          stroke="#d7e1ea"
                          strokeWidth={0.9}
                          strokeLinecap="round"
                        />
                        <path
                          d={arc(R * 0.66, 200, 450)}
                          fill="none"
                          stroke="#dbe4ed"
                          strokeWidth={0.9}
                          strokeLinecap="round"
                        />
                        <path
                          d={arc(R * 0.52, 20, 140)}
                          fill="none"
                          stroke="#e3eaf1"
                          strokeWidth={0.8}
                          strokeLinecap="round"
                        />
                      </g>

                      {/* cardboard core */}
                      <circle
                        r={18.3}
                        fill="url(#qp-core)"
                        stroke="#9d8359"
                        strokeWidth={0.6}
                      />
                      <circle r={14.6} fill="#4b4b4b" />
                      <path
                        d="M -10 9 A 12.5 12.5 0 0 0 11 8"
                        fill="none"
                        stroke="#a58a60"
                        strokeWidth={1.4}
                        strokeLinecap="round"
                      />
                      <path
                        d="M 1 -14.6 L 1 -11.5 L 6 -12.8"
                        fill="none"
                        stroke="#b59b72"
                        strokeWidth={1.2}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  </g>
                </g>
              </svg>

              <div className="brand mt-6">
                <Image
                  src="/quanta-logo-square.png"
                  alt="Quanta Paper Corporation"
                  width={160}
                  height={160}
                  priority
                  className="h-20 w-auto sm:h-24"
                />
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Hidden only for the instant before we know whether to play the
          loader. Otherwise the page is always rendered under the overlay. */}
      <div
        className={cn(
          "transition-opacity duration-300",
          phase === "pending" ? "opacity-0" : "opacity-100",
          className,
        )}
      >
        {children}
      </div>

      <style jsx>{`
        .cycle {
          animation: fade ${CYCLE_MS}ms ease-in-out forwards;
        }
        .move {
          animation: travel ${CYCLE_MS}ms cubic-bezier(0.4, 0, 0.6, 1) forwards;
        }
        /* rotation = distance / radius, so it rolls without slipping */
        .spin {
          transform-origin: 0 0;
          animation: turn ${CYCLE_MS}ms cubic-bezier(0.4, 0, 0.6, 1) forwards;
        }
        .strip-clip {
          transform-origin: ${STRIP_LEFT}px 0;
          animation: lay ${CYCLE_MS}ms cubic-bezier(0.4, 0, 0.6, 1) forwards;
        }
        .brand {
          opacity: 0;
          animation: fade-in 500ms ease-out ${LOGO_DELAY_MS}ms forwards;
        }

        @keyframes travel {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(${TRAVEL}px);
          }
        }
        @keyframes turn {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(${SPIN_DEG}deg);
          }
        }
        @keyframes lay {
          from {
            transform: scaleX(${FLAT_START.toFixed(4)});
          }
          to {
            transform: scaleX(1);
          }
        }
        @keyframes fade {
          0% {
            opacity: 0;
          }
          8% {
            opacity: 1;
          }
          92% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        @keyframes fade-in {
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}

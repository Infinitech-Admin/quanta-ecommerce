"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function LoadingAnimated({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 2200);
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
      {!mounted && (
        <div
          className={cn(
            "fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-500",
            loading ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
          style={{
            background: "linear-gradient(180deg, #8ccf8f 0%, #4a9d5b 100%)",
          }}
        >
          <div className="relative flex flex-col items-center">
            {/* wall-mount rod, sits behind the roll */}
            <span className="rod absolute left-1/2 top-[42px] h-[6px] w-[112px] -translate-x-1/2 -translate-y-1/2 rounded-full" />

            {/* the roll — spins as the sheet below unrolls */}
            <div className="roll relative h-[84px] w-[84px] rounded-full">
              <span className="roll-tube absolute left-1/2 top-1/2 h-[26px] w-[26px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
            </div>

            {/* the unrolling sheet — height grows from 0, naturally
                revealing what's printed on it as it pays out */}
            <div className="sheet relative w-[210px] overflow-hidden">
              <span
                className="perf-line absolute inset-x-4"
                style={{ top: 88 }}
              />
              <span
                className="perf-line absolute inset-x-4"
                style={{ top: 168 }}
              />

              <div className="flex flex-col items-center pt-6">
                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7 text-[#1fb85e]"
                  fill="currentColor"
                >
                  <path d="M12 2C7 2 3 6 3 11c0 5 4 9 9 11 5-2 9-6 9-11 0-5-4-9-9-9zm0 3.2c.8 3 2.7 5.4 5.4 6.7-2.8.3-5.2 2-6.4 4.4-1-2.6-3-4.6-5.6-5.2 3-1 5-3.2 6.6-5.9z" />
                </svg>
                <p className="mt-2.5 whitespace-nowrap font-serif text-sm tracking-[0.2em] text-[#0f3a1a]">
                  QUANTA&nbsp;PAPER
                </p>
              </div>
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
        .rod {
          background: #0f3a1a;
          opacity: 0.55;
        }

        .roll {
          background: repeating-radial-gradient(
            circle at center,
            #dcefc0 0px 4px,
            #c7e2a5 4px 8px
          );
          box-shadow:
            inset 0 -6px 10px rgba(15, 58, 26, 0.22),
            0 8px 14px rgba(15, 58, 26, 0.28);
          animation: spin 1.6s cubic-bezier(0.22, 1, 0.36, 1) 300ms both;
        }
        .roll-tube {
          background: #2f6b3f;
          box-shadow: inset 0 2px 3px rgba(0, 0, 0, 0.25);
        }
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(620deg);
          }
        }

        .sheet {
          background-color: #dcefc0;
          background-image:
            repeating-linear-gradient(
              45deg,
              rgba(15, 58, 26, 0.045) 0px,
              rgba(15, 58, 26, 0.045) 1px,
              transparent 1px,
              transparent 9px
            ),
            repeating-linear-gradient(
              -45deg,
              rgba(15, 58, 26, 0.045) 0px,
              rgba(15, 58, 26, 0.045) 1px,
              transparent 1px,
              transparent 9px
            );
          clip-path: polygon(
            0% 0%,
            100% 0%,
            100% 92%,
            92% 100%,
            84% 91%,
            76% 100%,
            68% 91%,
            60% 100%,
            52% 91%,
            44% 100%,
            36% 91%,
            28% 100%,
            20% 91%,
            12% 100%,
            4% 91%,
            0% 100%
          );
          filter: drop-shadow(0 10px 14px rgba(15, 58, 26, 0.22));
          animation:
            grow 1.6s cubic-bezier(0.22, 1, 0.36, 1) 300ms both,
            sway 1.4s ease-in-out 2100ms infinite;
          transform-origin: top center;
        }
        @keyframes grow {
          from {
            height: 0px;
          }
          to {
            height: 216px;
          }
        }
        @keyframes sway {
          0%,
          100% {
            transform: rotate(-1.5deg);
          }
          50% {
            transform: rotate(1.5deg);
          }
        }

        .perf-line {
          border-top: 2px dashed rgba(15, 58, 26, 0.28);
        }
      `}</style>
    </>
  );
}

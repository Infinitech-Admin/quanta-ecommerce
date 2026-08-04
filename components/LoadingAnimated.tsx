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
          style={{ backgroundColor: "#dcefc0" }}
        >
          {/* bottom moss-green field with the curved divider from the brand screenshot */}
          <svg
            className="absolute inset-x-0 bottom-0 h-[45%] w-full"
            viewBox="0 0 500 200"
            preserveAspectRatio="none"
          >
            <path
              d="M0,40 C120,75 320,0 500,30 L500,200 L0,200 Z"
              fill="#74c37e"
            />
          </svg>

          {/* stacked paper sheets */}
          <div className="relative z-10 h-20 w-24">
            <div className="sheet absolute inset-x-0 bottom-0 h-16 w-24 rounded-md bg-white shadow-md" />
            <div
              className="sheet absolute inset-x-0 bottom-0 h-16 w-24 rounded-md bg-white/95 shadow-md"
              style={{ animationDelay: "200ms" }}
            />
            <div
              className="sheet absolute inset-x-0 bottom-0 h-16 w-24 rounded-md bg-white/90 shadow-md"
              style={{ animationDelay: "400ms" }}
            />
            {/* leaf mark on the top sheet */}
            <svg
              className="absolute bottom-5 left-1/2 h-6 w-6 -translate-x-1/2 text-[#1fb85e]"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C7 2 3 6 3 11c0 5 4 9 9 11 5-2 9-6 9-11 0-5-4-9-9-9zm0 3.2c.8 3 2.7 5.4 5.4 6.7-2.8.3-5.2 2-6.4 4.4-1-2.6-3-4.6-5.6-5.2 3-1 5-3.2 6.6-5.9z" />
            </svg>
          </div>

          <div className="relative z-10 mt-8 overflow-hidden">
            <p className="wordmark font-serif text-lg tracking-[0.35em] text-[#0f3a1a] drop-shadow-sm">
              QUANTA&nbsp;PAPER
            </p>
          </div>

          <div className="relative z-10 mt-4 h-[2px] w-32 overflow-hidden rounded-full bg-[#0f3a1a]/15">
            <div className="track h-full w-1/3 rounded-full bg-[#1fb85e]" />
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
        .sheet {
          transform-origin: bottom center;
          animation: stack 1.6s cubic-bezier(0.65, 0, 0.35, 1) infinite;
        }
        @keyframes stack {
          0% {
            transform: translateY(10px) scale(0.94);
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          55% {
            transform: translateY(-6px) scale(1);
            opacity: 1;
          }
          80% {
            transform: translateY(-14px) scale(0.98);
            opacity: 0;
          }
          100% {
            transform: translateY(-14px) scale(0.98);
            opacity: 0;
          }
        }
        .wordmark {
          animation: reveal 900ms ease-out 200ms both;
        }
        @keyframes reveal {
          from {
            opacity: 0;
            letter-spacing: 0.6em;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            letter-spacing: 0.35em;
            transform: translateY(0);
          }
        }
        .track {
          animation: load 1.8s ease-in-out infinite;
        }
        @keyframes load {
          0% {
            transform: translateX(-100%);
          }
          50% {
            transform: translateX(150%);
          }
          100% {
            transform: translateX(-100%);
          }
        }
      `}</style>
    </>
  );
}

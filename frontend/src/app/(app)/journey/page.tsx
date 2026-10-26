"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePraxism, useIsHydrated } from "@/store/usePraxism";

function getHexagonPoints(cx: number, cy: number, r: number): string {
  const points: string[] = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 6;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
  }
  return points.join(" ");
}

function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    const months = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
  } catch {
    return isoString;
  }
}

export default function JourneyPage() {
  const router = useRouter();
  const hasHydrated = useIsHydrated();
  const { context, startOver } = usePraxism();
  const [isConfirmingStartOver, setIsConfirmingStartOver] = useState(false);

  useEffect(() => {
    document.title = "Journey — Praxism";
  }, []);

  if (!hasHydrated) {
    return (
      <div className="py-12 space-y-4">
        <div className="h-48 rounded-xl bg-slate border border-rule animate-pulse" />
      </div>
    );
  }

  const completedMoves = [...context.history].reverse();
  const count = completedMoves.length;

  if (count === 0) {
    return (
      <div className="space-y-6 py-12 text-left">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-bone font-heading">
            No moves yet. Your first one is waiting.
          </h1>
          <p className="text-ash text-base leading-relaxed">
            {context.idea
              ? `You have an idea in progress: "${context.idea}". Take your next move to start building your journey.`
              : "Describe what you want to make happen and take your first concrete action."}
          </p>
        </header>
        <div className="pt-2">
          <Link
            href="/start"
            className="px-5 py-2.5 bg-bone text-graphite rounded font-medium text-sm transition-opacity hover:opacity-90 inline-block select-none"
          >
            Start with your idea
          </Link>
        </div>
      </div>
    );
  }

  // Calculate nested hexagon radii for the progress mark
  const maxRadius = 44;
  const minRadius = Math.max(12, maxRadius - (count - 1) * 7);
  const step = count > 1 ? (maxRadius - minRadius) / (count - 1) : 0;
  const radii = Array.from({ length: count }, (_, i) =>
    count === 1 ? 26 : minRadius + i * step
  );

  const handleConfirmStartOver = () => {
    startOver();
    router.push("/start");
  };

  return (
    <div className="space-y-10 pb-20">
      {/* 1. Progress Mark: SVG Nested Hexagons from Logo Motif + Count in Words */}
      <section className="flex items-center gap-6 pb-8 border-b border-rule">
        <svg
          width="80"
          height="80"
          viewBox="0 0 100 100"
          className="shrink-0"
          aria-hidden="true"
        >
          {radii.map((r, idx) => (
            <polygon
              key={idx}
              points={getHexagonPoints(50, 50, r)}
              fill="none"
              stroke="#ECEAE4"
              strokeWidth="1.75"
              strokeLinejoin="round"
            />
          ))}
        </svg>

        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-bone font-heading leading-tight">
            {count} {count === 1 ? "move made" : "moves made"}
          </h1>
          <p className="text-ash text-sm">
            Execution history and outcomes
          </p>
        </div>
      </section>

      {/* 2. Original Idea and Completed Moves */}
      <div className="space-y-8">
        {context.idea && (
          <div className="p-5 rounded-lg bg-slate border border-rule space-y-1.5">
            <h2 className="text-sm font-medium text-ash">Original idea</h2>
            <p className="text-bone text-base leading-relaxed">
              {context.idea}
            </p>
          </div>
        )}

        <section className="space-y-4">
          <h2 className="text-lg font-bold text-bone font-heading">
            Completed moves
          </h2>
          <div className="space-y-4">
            {completedMoves.map((m, idx) => {
              const outcomeLabel =
                m.outcome === "done"
                  ? "Done"
                  : m.outcome === "partial"
                  ? "Partly done"
                  : "Got stuck";

              return (
                <div
                  key={`${m.action.id}-${m.completedAt}-${idx}`}
                  className="p-5 rounded-lg bg-slate border border-rule space-y-3 text-left"
                >
                  <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                    <h3 className="text-base font-bold text-bone font-heading">
                      {m.action.title}
                    </h3>
                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`px-2.5 py-0.5 rounded text-xs font-medium border select-none ${
                          m.outcome === "done"
                            ? "bg-bone text-graphite border-bone"
                            : m.outcome === "partial"
                            ? "border-ash text-ash bg-graphite"
                            : "border-rule text-ash bg-graphite"
                        }`}
                      >
                        {outcomeLabel}
                      </span>
                      <span className="text-xs text-ash">
                        {formatDate(m.completedAt)}
                      </span>
                    </div>
                  </div>

                  {m.notes && (
                    <div className="pt-2 text-sm text-bone/90 leading-relaxed border-t border-rule/50">
                      <p>{m.notes}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* 3. Start Over Button with Confirmation */}
        <section className="pt-6 border-t border-rule">
          {!isConfirmingStartOver ? (
            <button
              type="button"
              onClick={() => setIsConfirmingStartOver(true)}
              className="px-4 py-2 rounded border border-rule bg-slate text-ash hover:text-bone hover:border-ash text-sm transition-colors select-none"
            >
              Start over
            </button>
          ) : (
            <div className="p-4 rounded-lg bg-slate border border-rule space-y-3 text-left max-w-md">
              <p className="text-bone text-sm leading-relaxed">
                Are you sure you want to start over? This will clear your current session and journey history.
              </p>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleConfirmStartOver}
                  className="px-4 py-2 bg-bone text-graphite rounded text-sm font-medium hover:opacity-90 transition-opacity select-none"
                >
                  Start over
                </button>
                <button
                  type="button"
                  onClick={() => setIsConfirmingStartOver(false)}
                  className="px-4 py-2 border border-rule bg-graphite text-ash hover:text-bone rounded text-sm transition-colors select-none"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

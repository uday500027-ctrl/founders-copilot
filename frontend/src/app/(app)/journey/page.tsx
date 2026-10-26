import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Journey — Praxism",
};

export default function JourneyPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-bone font-heading">
          Journey
        </h1>
        <p className="text-ash text-base">
          The moves you have completed and what you learned.
        </p>
      </header>
      <div className="p-6 rounded-lg bg-slate border border-rule text-ash text-sm">
        Journey log placeholder.
      </div>
    </div>
  );
}

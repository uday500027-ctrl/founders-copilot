import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Your next move — Praxism",
};

export default function MovePage() {
  return (
    <div className="space-y-8">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-bone font-heading">
          Your next move
        </h1>
        <p className="text-ash text-base">
          One concrete step to execute right now.
        </p>
      </header>

      {/* Inversion emphasis: the current next move is bone with graphite text */}
      <section className="p-6 rounded-lg bg-bone text-graphite space-y-4">
        <h2 className="text-xl font-bold font-heading text-graphite">
          Active move placeholder
        </h2>
        <p className="text-graphite/80 text-sm">
          Execution workspace placeholder. Focus on this single move until it is
          done.
        </p>
      </section>
    </div>
  );
}

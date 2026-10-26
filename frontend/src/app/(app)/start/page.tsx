import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Start with your idea — Praxism",
};

export default function StartPage() {
  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight text-bone font-heading">
          Start with your idea
        </h1>
        <p className="text-ash text-base">
          Describe what you want to build or achieve. We will find your first move.
        </p>
      </header>
      <div className="p-6 rounded-lg bg-slate border border-rule text-ash text-sm">
        Start workspace placeholder.
      </div>
    </div>
  );
}

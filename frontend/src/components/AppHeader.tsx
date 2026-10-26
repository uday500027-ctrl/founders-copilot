import Link from "next/link";
import { Logo } from "./Logo";

export function AppHeader() {
  return (
    <header className="w-full border-b border-rule bg-graphite">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Logo size={32} />
        <nav className="flex items-center gap-6">
          <Link
            href="/journey"
            className="text-sm font-normal text-ash hover:text-bone transition-colors"
          >
            Journey
          </Link>
        </nav>
      </div>
    </header>
  );
}

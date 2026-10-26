import { Logo } from "./Logo";
import { StartWithIdeaButton } from "./StartWithIdeaButton";

export function MarketingHeader() {
  return (
    <header className="w-full border-b border-rule bg-graphite">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Logo size={32} />
        <StartWithIdeaButton />
      </div>
    </header>
  );
}

import { MarketingHeader } from "@/components/MarketingHeader";
import { StartWithIdeaButton } from "@/components/StartWithIdeaButton";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-graphite text-bone">
      <MarketingHeader />
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20 text-center">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-bone font-heading">
              One clear next move for your idea.
            </h1>
            <p className="text-ash text-lg max-w-xl mx-auto leading-relaxed">
              Praxism turns uncertainty into momentum. Tell us what you want to
              build, clarify a few details, and get one concrete action with
              everything you need to execute it.
            </p>
          </div>
          <div>
            <StartWithIdeaButton className="inline-flex items-center justify-center px-6 py-3 bg-bone text-graphite font-medium text-base rounded transition-opacity hover:opacity-90" />
          </div>
        </div>
      </main>
    </div>
  );
}

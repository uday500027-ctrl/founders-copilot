import type { NextAction } from "@/lib/types";

interface NextMoveCardProps {
  action: NextAction;
}

export function NextMoveCard({ action }: NextMoveCardProps) {
  return (
    <section className="bg-bone text-graphite rounded-xl p-6 sm:p-8 space-y-6 text-left select-none">
      <div className="space-y-2">
        <p className="text-graphite/70 text-sm font-medium">Your next move</p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-graphite font-heading leading-tight">
          {action.title}
        </h1>
      </div>

      <div className="space-y-1.5">
        <h2 className="text-sm font-bold text-graphite font-heading">
          Why this, now
        </h2>
        <p className="text-graphite/90 text-base leading-relaxed">
          {action.reasoning}
        </p>
      </div>

      {(action.estimatedTime || action.estimatedCost) && (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm font-medium text-graphite/80 pt-1">
          {action.estimatedTime && (
            <div>
              <span className="text-graphite/60">Estimated time: </span>
              <span>{action.estimatedTime}</span>
            </div>
          )}
          {action.estimatedCost && (
            <div>
              <span className="text-graphite/60">Estimated cost: </span>
              <span>{action.estimatedCost}</span>
            </div>
          )}
        </div>
      )}

      {action.successCriteria && action.successCriteria.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-graphite/15">
          <h2 className="text-sm font-bold text-graphite font-heading">
            You&apos;re done when
          </h2>
          <ul className="space-y-1.5 text-sm text-graphite/90 list-disc list-inside leading-relaxed">
            {action.successCriteria.map((criterion, idx) => (
              <li key={idx} className="pl-1">
                <span>{criterion}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

export default NextMoveCard;

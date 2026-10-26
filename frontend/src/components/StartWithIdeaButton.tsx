"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePraxism } from "@/store/usePraxism";

export function StartWithIdeaButton({
  className = "",
}: {
  className?: string;
}) {
  const router = useRouter();
  const currentAction = usePraxism((state) => state.context.currentAction);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const hasAction = mounted && Boolean(currentAction);
  const targetHref = hasAction ? "/move" : "/start";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const actionExists = Boolean(usePraxism.getState().context?.currentAction);
    router.push(actionExists ? "/move" : "/start");
  };

  return (
    <Link
      href={targetHref}
      onClick={handleClick}
      className={
        className ||
        "inline-flex items-center justify-center px-4 py-2 bg-bone text-graphite font-medium text-sm rounded transition-opacity hover:opacity-90"
      }
    >
      Start with your idea
    </Link>
  );
}

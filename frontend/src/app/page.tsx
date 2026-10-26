"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MarketingHeader } from "@/components/MarketingHeader";
import { NextMoveCard } from "@/components/NextMoveCard";
import TextType from "@/components/TextType";
import StarBorder from "@/components/StarBorder";
import ScrollExpand from "@/components/ScrollExpand";
import StrokeText from "@/components/StrokeText";
import { usePraxism } from "@/store/usePraxism";
import type { NextAction } from "@/lib/types";

// Dynamic import for Cubes with ssr: false for optimal performance
const Cubes = dynamic(() => import("@/components/Cubes"), { ssr: false });

const SAMPLE_ACTION: NextAction = {
  id: "sample_demo_action",
  title: "Talk to five potential customers before buying inventory",
  reasoning:
    "Most early businesses fail by locking up capital in inventory before confirming that anyone wants their specific offering. Five direct conversations will clarify what shoppers dislike about existing options and what they are eager to pay for.",
  steps: [
    {
      id: "s1",
      text: "List 10 people in your network who match your target customer profile.",
    },
    {
      id: "s2",
      text: "Send a brief outreach message requesting a casual 15-minute feedback chat.",
    },
    {
      id: "s3",
      text: "Ask 5 discovery questions without pitching your solutions upfront.",
    },
    {
      id: "s4",
      text: "Synthesize the feedback into 3 core requirements for your first launch.",
    },
  ],
  estimatedTime: "2–3 hours",
  estimatedCost: "₹0",
  successCriteria: [
    "Five completed discovery conversations with target buyers",
    "Documented list of at least 3 recurring customer frustrations",
    "Confirmed price point range for your initial launch",
  ],
  materials: [],
};

function HeroCtaButton({ className = "" }: { className?: string }) {
  const router = useRouter();
  const currentAction = usePraxism((state) => state.context.currentAction);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const targetHref = mounted && Boolean(currentAction) ? "/move" : "/start";

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const actionExists = Boolean(usePraxism.getState().context.currentAction);
    router.push(actionExists ? "/move" : "/start");
  };

  return (
    <StarBorder
      as={Link}
      href={targetHref}
      onClick={handleClick}
      color="#ECEAE4"
      backgroundColor="#ECEAE4"
      textColor="#232323"
      borderColor="#ECEAE4"
      radius={8}
      duration={3}
      glow={0}
      className={`font-medium text-sm sm:text-base select-none px-6 py-3.5 transition-opacity hover:opacity-95 ${className}`}
    >
      Start with your idea
    </StarBorder>
  );
}

export default function HomePage() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);
    const listener = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", listener);
    return () => mediaQuery.removeEventListener("change", listener);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-graphite text-bone">
      <MarketingHeader />

      <main className="flex-1 w-full">
        {/* 1. HERO SECTION */}
        <section className="max-w-6xl mx-auto px-6 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left side: Heading, Overwhelm TextType, Subtext, StarBorder Button */}
          <div className="space-y-8 text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-heading text-bone tracking-tight leading-[1.08]">
              Turn ideas into action. One step at a time.
            </h1>

            <div className="min-h-[3.5rem] flex items-center">
              {reducedMotion ? (
                <p className="text-bone text-lg sm:text-xl font-medium leading-relaxed">
                  Your next move: talk to five potential customers.
                </p>
              ) : (
                <TextType
                  text={[
                    "Should I create an Instagram page?",
                    "Should I find manufacturers?",
                    "How much money will I need?",
                    "What should I do first?",
                    "Your next move: talk to five potential customers.",
                  ]}
                  typingSpeed={35}
                  deletingSpeed={20}
                  pauseDuration={1600}
                  loop={false}
                  showCursor={true}
                  cursorCharacter="|"
                  className="text-ash text-lg sm:text-xl font-normal"
                  cursorClassName="text-bone"
                />
              )}
            </div>

            <p className="text-ash text-base sm:text-lg leading-relaxed max-w-lg">
              Praxism turns an overwhelming goal into one clear next move, helps
              you do it, and adapts to what happened.
            </p>

            <div className="pt-2">
              <HeroCtaButton />
            </div>
          </div>

          {/* Right side: Cubes in monochrome, echoing logo hexagons. Hidden on mobile */}
          <div className="hidden lg:flex items-center justify-center w-full h-[460px] relative">
            <Cubes
              gridSize={8}
              faceColor="#232323"
              edgeColor="#ECEAE4"
              rippleColor="#ECEAE4"
              edgeWidth={1.2}
              faceOpacity={1}
              shading={0.3}
              paused={reducedMotion}
              autoAnimate={!reducedMotion}
              rippleOnClick={true}
              className="w-full h-full"
            />
          </div>
        </section>

        {/* 2. PROBLEM SECTION */}
        <section className="py-20 border-t border-rule/60">
          <div className="max-w-2xl mx-auto px-6 space-y-6 text-left">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-bone leading-tight">
              Step 20 before step 1.
            </h2>
            <div className="space-y-4 text-ash text-base leading-relaxed">
              <p>
                Ideas rarely die from a lack of discipline. They die because
                every question creates more decisions: branding, legal,
                suppliers, pricing, audience, and product details long before
                anything tangible has been tested.
              </p>
              <p>
                People mistake that overload for laziness. When every decision
                demands equal attention, inaction is the only natural result.
                Momentum doesn&apos;t come from solving step twenty; it comes
                from executing step one.
              </p>
            </div>
          </div>
        </section>

        {/* 3. HOW IT WORKS SECTION (Numbered sequence) */}
        <section className="py-20 border-t border-rule/60">
          <div className="max-w-2xl mx-auto px-6 space-y-10 text-left">
            <div className="space-y-2">
              <h2 className="text-3xl sm:text-4xl font-bold font-heading text-bone leading-tight">
                How it works
              </h2>
              <p className="text-ash text-base">
                A deliberate sequence that turns uncertainty into momentum.
              </p>
            </div>

            <div className="space-y-4">
              {[
                {
                  num: "1",
                  title: "Share your idea.",
                  desc: "Describe what you want to make happen in plain words, without pitch decks or formal plans.",
                },
                {
                  num: "2",
                  title: "Answer a few questions.",
                  desc: "Clarify your constraints, current stage, and immediate uncertainties in under two minutes.",
                },
                {
                  num: "3",
                  title: "Get one next move.",
                  desc: "Receive a single, concrete action designed to create maximum signal with minimum waste.",
                },
                {
                  num: "4",
                  title: "Do it with help.",
                  desc: "Execute the step using tailored AI-generated materials, checklists, and real-time guidance.",
                },
                {
                  num: "5",
                  title: "Report what happened.",
                  desc: "Log whether you finished, got partial results, or hit a wall—so your next move adapts to reality.",
                },
              ].map((step) => (
                <div
                  key={step.num}
                  className="p-5 rounded-lg bg-slate border border-rule flex items-start gap-4"
                >
                  <span className="w-8 h-8 rounded-full border border-rule bg-graphite flex items-center justify-center shrink-0 text-sm font-bold text-bone font-heading">
                    {step.num}
                  </span>
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-bone font-heading">
                      {step.title}
                    </h3>
                    <p className="text-ash text-sm leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 4. PREVIEW SECTION (ScrollExpand with reused NextMoveCard) */}
        <section className="py-20 border-t border-rule/60">
          <div className="max-w-2xl mx-auto px-6 mb-8 text-left space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold font-heading text-bone leading-tight">
              What a move looks like
            </h2>
            <p className="text-ash text-base">
              Clean, focused, and inverted for maximum clarity. Everything you need to execute, and nothing you don&apos;t.
            </p>
          </div>

          <div className="w-full max-w-3xl mx-auto px-4 h-[620px] relative">
            <ScrollExpand
              useWindowScroll={true}
              startWidth={80}
              startHeight={70}
              startRadius={16}
              endRadius={16}
              smoothing={0.1}
              overlayScrim={0}
              src="data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='10' height='10' viewBox='0 0 10 10'><rect width='10' height='10' fill='%23232323'/></svg>"
            >
              <div className="w-full max-w-[620px] mx-auto text-left pointer-events-auto">
                <NextMoveCard action={SAMPLE_ACTION} />
              </div>
            </ScrollExpand>
          </div>
        </section>

        {/* 5. CLOSING SECTION */}
        <section className="py-24 border-t border-rule/60 text-center">
          <div className="max-w-2xl mx-auto px-6 space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-heading text-bone leading-tight">
                You don&apos;t need the whole roadmap. Just the next move.
              </h2>
              <p className="text-ash text-base sm:text-lg max-w-lg mx-auto leading-relaxed">
                Stop debating what might happen at launch. Take the first concrete step with real-time AI guidance today.
              </p>
            </div>
            <div className="pt-2 flex justify-center">
              <HeroCtaButton />
            </div>
          </div>
        </section>
      </main>

      {/* 6. FOOTER (StrokeText wordmark in bone) */}
      <footer className="w-full border-t border-rule bg-graphite pt-16 pb-12 overflow-hidden select-none">
        <div className="max-w-5xl mx-auto px-6 text-center space-y-8">
          <div className="w-full overflow-hidden flex justify-center py-4">
            <StrokeText
              text="Praxism"
              strokeColor="#ECEAE4"
              fillColor="transparent"
              strokeWidth={1.5}
              fontSize={140}
              fontWeight={800}
              fontFamily="var(--font-archivo), sans-serif"
              letterSpacing={-4}
              trigger="scroll"
              className="max-w-2xl mx-auto"
            />
          </div>
          <p className="text-ash text-xs">
            © 2026 Praxism. Built for founders who execute.
          </p>
        </div>
      </footer>
    </div>
  );
}

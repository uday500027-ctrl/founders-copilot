import type { Metadata } from "next";
import PraxismLandingPage from "@/components/praxism-landing/PraxismLandingPage";

export const metadata: Metadata = {
  title: "Praxism — One move. Not the whole journey.",
  description: "Share your idea. Praxism picks the one next move, helps you do it, and learns from the result.",
};

export default function Page() {
  return <PraxismLandingPage />;
}
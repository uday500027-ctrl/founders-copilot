import { Barlow_Condensed, Inter_Tight, JetBrains_Mono } from "next/font/google";
import PraxismLanding from "./PraxismLanding";

// Fonts used only by the landing page. They are exposed as CSS variables
// that landing.css reads, so the app pages keep their own fonts.
const display = Barlow_Condensed({ subsets: ["latin"], weight: ["700"], variable: "--pl-font-display" });
const sans = Inter_Tight({ subsets: ["latin"], variable: "--pl-font-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--pl-font-mono" });

export default function PraxismLandingPage() {
  return (
    <div className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <PraxismLanding />
    </div>
  );
}

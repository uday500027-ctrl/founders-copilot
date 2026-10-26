PROJECT
Praxism: an AI execution agent that turns an idea into one clear next move, helps the user execute it, and adapts the next move from the outcome.
Core loop: Idea → Understand (a few clarifying questions) → Decide (one next move) → Execute (steps + AI-generated materials) → Learn (user reports the outcome) → Decide again.
Pages: / (landing), /start (idea + clarifying questions), /move (next move + execution workspace), /journey (completed moves).
The backend (Ollama, built by a teammate) will live in this same Next.js app under frontend/src/app/api/. Never create or edit anything under src/app/api/ unless a prompt explicitly asks.

RULES FOR EVERY TASK
1. All code lives in ./frontend. No auth, no database.
2. Stack: Next.js App Router, TypeScript strict, Tailwind CSS, shadcn/ui, lucide-react, Zustand.
3. frontend/src/lib/types.ts is the data contract and is FINAL. Never modify it. Never define data shapes anywhere else. If something seems missing, stop and ask me.
4. Components never call fetch(). All data goes through `api` from frontend/src/lib/api/index.ts.
5. Every screen handles loading, empty and error states. Agent calls can take up to 60 seconds: always show progress, never a frozen screen.
6. Do not change anything other than the changes I ask for in each prompt. Do not refactor, rename, restyle or "improve" files I did not mention.
7. When finished, list every file you created or modified.

DESIGN SYSTEM (mandatory on every page)
Identity comes from the logo (frontend/public/logo.jpg): white parallel lines forming nested hexagons on graphite. Monochrome, precise, calm.
Colors (use no others):
- graphite #232323: page background (same as the logo's background)
- slate #2D2D2D: raised panels
- rule #3D3D3B: borders and dividers
- ash #8F8E8A: secondary text
- bone #ECEAE4: primary text, icons, primary buttons
Emphasis by inversion, not color: the user's current next move is the only bone-colored block on screen, with graphite text.
Type: one family, Archivo (next/font/google, variable, with the wdth axis). Headings: expanded width (wdth 120), weight 700, slightly tight letter-spacing. Body: normal width, weight 400, 17px, line-height 1.6. Sentence case everywhere.
Layout: app pages use one left-aligned column, max-width 680px. No sidebar. A slim top bar with the logo on the left and a Journey link on the right.
Motion: only in response to user actions (a new move appearing, a step being checked). Respect prefers-reduced-motion. The landing hero may have one orchestrated moment.
Banned: neon or saturated colors, gradients, glows, glassmorphism, purple, drop shadows, emojis as icons, ALL-CAPS labels, monospace labels, "→" in button text, fade-in on every section, identical rounded cards for everything.
Copy: plain verbs; buttons say exactly what they do ("Find my next move", "Mark as done", "I got stuck").
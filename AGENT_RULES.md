PROJECT CONTEXT
We are building a web app that cures decision fatigue for startup founders. A founder enters their context and dumps all their pending tasks; our fine-tuned LLM (backend, built later) tells them the ONE next thing to do: what, why now, when, where, how (steps), which resources to use, and whom to contact if blocked.
Pages: landing (/), onboarding, brain dump (/dump), next action (/next), history (/history), chat (/chat).

RULES FOR EVERY TASK
1. All frontend code lives in ./frontend. Frontend only: do not build a backend, database, or auth.
2. Stack: Next.js (App Router), TypeScript strict, Tailwind CSS, shadcn/ui, lucide-react, Zustand.
3. All data shapes live in frontend/src/lib/types.ts. Never invent new shapes inside components. If a new field seems needed, stop and ask me.
4. Components must NEVER call fetch() directly. All data goes through the `api` object from frontend/src/lib/api/index.ts.
5. Every screen handles loading, empty, and error states.
6. Do not change anything other than the changes I ask for in each prompt. Do not refactor, rename, restyle, or "improve" files I did not mention.
7. When finished, list every file you created or modified.
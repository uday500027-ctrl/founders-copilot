import type { ApiClient } from "./client";
import type {
  PlanRequest,
  PlanResponse,
  BlockerRequest,
  BlockerResponse,
  ChatRequest,
  NextAction,
  QueueItem,
  HistoryEntry,
} from "../types";

const delay = (minMs = 800, maxMs = 1500): Promise<void> => {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const STORAGE_KEY = "founder_copilot_history";

export const SAMPLE_HISTORY: HistoryEntry[] = [
  {
    id: "hist_1",
    taskId: "task_hist_1",
    title: "Cold outreach to 15 design partners on LinkedIn",
    completedAt: "2026-10-25T11:00:00.000Z",
    outcome: "done",
    note: "Sent all 15 personalized connection requests; 4 accepted within 24 hours, 2 scheduled discovery calls.",
    action: {
      taskId: "task_hist_1",
      title: "Cold outreach to 15 design partners on LinkedIn",
      whyNow: "Securing 3 committed pilot users is required before finalizing the Q4 MVP scope.",
      when: {
        slot: "Morning Sprint (9:00 AM - 10:30 AM)",
        estimatedMinutes: 90,
        deadline: "2026-10-25",
      },
      where: "LinkedIn Sales Navigator & CRM",
      steps: [
        "Filter VP of Operations in B2B SaaS companies with 20-100 employees.",
        "Send personalized 3-sentence connection notes focusing on current manual invoice reconciliation pain.",
        "Log replies and scheduling links in Notion outreach tracker.",
      ],
      resources: [
        {
          label: "B2B Outreach Playbook & Copy Templates",
          type: "template",
          url: "https://templates.example.com/b2b-outreach",
        },
        {
          label: "LinkedIn Sales Navigator",
          type: "tool",
          url: "https://linkedin.com",
        },
      ],
      contacts: [
        {
          role: "GTM Advisor",
          why: "Review open and reply rates on initial message sequence.",
          howToReach: "Slack #advisors channel or weekly sync.",
        },
      ],
    },
  },
  {
    id: "hist_2",
    taskId: "task_hist_2",
    title: "Implement Stripe Checkout webhook for self-serve onboarding",
    completedAt: "2026-10-24T16:15:00.000Z",
    outcome: "done",
    note: "Webhook deployed to staging; verified checkout.session.completed event idempotency with simulated payloads.",
    action: {
      taskId: "task_hist_2",
      title: "Implement Stripe Checkout webhook for self-serve onboarding",
      whyNow: "Users are dropping off because billing activation requires manual admin intervention.",
      when: {
        slot: "Afternoon Deep Work (2:00 PM - 4:00 PM)",
        estimatedMinutes: 120,
      },
      where: "Backend API & Stripe Developer Dashboard",
      steps: [
        "Configure Stripe checkout.session.completed webhook endpoint in API router.",
        "Verify webhook signature with STRIPE_WEBHOOK_SECRET to prevent unauthorized invocations.",
        "Provision workspace subscription record in PostgreSQL upon successful verification.",
      ],
      resources: [
        {
          label: "Stripe Webhooks Integration Guide",
          type: "article",
          url: "https://docs.stripe.com/webhooks",
        },
        {
          label: "Stripe CLI",
          type: "tool",
          url: "https://stripe.com/docs/stripe-cli",
        },
      ],
      contacts: [
        {
          role: "Stripe Developer Support",
          why: "Clarify subscription upgrade retry backoff semantics.",
          howToReach: "Stripe Discord #support channel.",
        },
      ],
    },
  },
  {
    id: "hist_3",
    taskId: "task_hist_3",
    title: "Conduct user feedback session with Pilot Customer #1 (Acme Corp)",
    completedAt: "2026-10-23T12:30:00.000Z",
    outcome: "done",
    note: "Loved the UI speed; primary requested addition was bulk CSV upload before rolling out to 30 team members.",
    action: {
      taskId: "task_hist_3",
      title: "Conduct user feedback session with Pilot Customer #1 (Acme Corp)",
      whyNow: "First week of pilot usage completed; need to identify friction points before broader rollout.",
      when: {
        slot: "Midday Call (11:30 AM - 12:15 PM)",
        estimatedMinutes: 45,
      },
      where: "Google Meet",
      steps: [
        "Review user session replay highlights together with the champion.",
        "Ask five Mom Test questions focusing on how they worked around current platform limitations.",
        "Document top 3 feature requests vs dealbreakers in feedback matrix.",
      ],
      resources: [
        {
          label: "The Mom Test Customer Interview Framework",
          type: "article",
          url: "https://momtestbook.com",
        },
      ],
      contacts: [
        {
          role: "Sarah (Head of Ops at Acme)",
          why: "Primary customer champion giving frontline workflow feedback.",
          howToReach: "sarah@acme.corp",
        },
      ],
    },
  },
  {
    id: "hist_4",
    taskId: "task_hist_4",
    title: "Submit Delaware Franchise Tax filing & annual report",
    completedAt: "2026-10-22T17:00:00.000Z",
    outcome: "done",
    note: "Filed successfully using Assumed Par Value Capital Method; archived state confirmation in Google Drive.",
    action: {
      taskId: "task_hist_4",
      title: "Submit Delaware Franchise Tax filing & annual report",
      whyNow: "Avoid late penalties and preserve company good standing status for upcoming angel round.",
      when: {
        slot: "Admin Block (4:30 PM - 5:15 PM)",
        estimatedMinutes: 45,
        deadline: "2026-10-31",
      },
      where: "Delaware Division of Corporations Portal",
      steps: [
        "Calculate franchise tax using Assumed Par Value Capital Method to prevent overpayment.",
        "Enter gross assets and issued shares from latest certified balance sheet.",
        "Pay filing fee via company corporate card and download stamped certification.",
      ],
      resources: [
        {
          label: "Delaware Corporate Portal",
          type: "tool",
          url: "https://corp.delaware.gov",
        },
        {
          label: "Assumed Par Value Calculator",
          type: "tool",
          url: "https://clerky.com/delaware-tax",
        },
      ],
      contacts: [
        {
          role: "Fractional CFO / CPA",
          why: "Verify par value calculation and authorized share count before final submission.",
          howToReach: "cpa@accountingpartners.com",
        },
      ],
    },
  },
  {
    id: "hist_5",
    taskId: "task_hist_5",
    title: "Prepare 10-slide angel deck for Seed investor intro meeting",
    completedAt: "2026-10-21T21:15:00.000Z",
    outcome: "done",
    note: "Deck finalized; uploaded to DocSend with email verification enabled before investor review call.",
    action: {
      taskId: "task_hist_5",
      title: "Prepare 10-slide angel deck for Seed investor intro meeting",
      whyNow: "Intro meeting scheduled with partner at Founder Collective for Friday morning.",
      when: {
        slot: "Evening Focus (7:00 PM - 9:00 PM)",
        estimatedMinutes: 120,
      },
      where: "Pitch.com & DocSend",
      steps: [
        "Update traction slide with pilot engagement metrics (85% weekly retention across 4 teams).",
        "Refine unit economics and bottom-up market sizing slide.",
        "Export clean PDF deck and upload to DocSend with download restriction enabled.",
      ],
      resources: [
        {
          label: "Sequoia Early-Stage Pitch Deck Framework",
          type: "template",
          url: "https://sequoiacap.com/pitch-deck-template",
        },
        {
          label: "DocSend Document Analytics",
          type: "tool",
          url: "https://docsend.com",
        },
      ],
      contacts: [
        {
          role: "Angel Syndicate Lead",
          why: "Quick review of narrative flow and valuation expectations before partner meeting.",
          howToReach: "WhatsApp: +1-415-555-0199",
        },
      ],
    },
  },
];

function getStoredHistory(): HistoryEntry[] {
  if (typeof window === "undefined") {
    return SAMPLE_HISTORY;
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_HISTORY));
      return SAMPLE_HISTORY;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_HISTORY));
    return SAMPLE_HISTORY;
  } catch {
    return SAMPLE_HISTORY;
  }
}

function saveStoredHistory(entries: HistoryEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (err) {
    console.error("Failed to persist history to localStorage", err);
  }
}

export const mock: ApiClient = {
  async getPlan(req: PlanRequest): Promise<PlanResponse> {
    await delay(800, 1500);

    // If any task title contains "fail", throw an error to test error states
    const failTask = req.tasks.find((t) =>
      t.title.toLowerCase().includes("fail")
    );
    if (failTask) {
      throw new Error(
        `Failed to generate plan: task "${failTask.title}" triggered test error state.`
      );
    }

    const skippedSet = new Set(req.skippedTaskIds || []);
    const availableTasks = req.tasks.filter((t) => !skippedSet.has(t.id));

    const chosenTask = availableTasks[0] || {
      id: "task_lead_01",
      title: "Conduct 5 discovery calls with prospective B2B users",
      notes: "Validate problem space and current manual workarounds",
      status: "todo" as const,
      createdAt: new Date().toISOString(),
    };

    const nextAction: NextAction = {
      taskId: chosenTask.id,
      title: chosenTask.title,
      whyNow: `This is the single most critical bottleneck for ${
        req.profile.startupName || "your startup"
      } right now at the ${
        req.profile.stage
      } stage. Resolving this unlocks customer traction and prevents building on unverified assumptions.`,
      when: {
        slot: "Tomorrow Morning (9:30 AM - 11:00 AM)",
        estimatedMinutes: 90,
        deadline: new Date(Date.now() + 86400000 * 2)
          .toISOString()
          .split("T")[0],
      },
      where: "CRM & Calendar (Deep Work Block)",
      steps: [
        "Review the primary pain point hypothesis defined in your 90-day goal.",
        "Send tailored scheduling links to 5 prioritized target prospects.",
        "Conduct calls using open-ended questions focusing on current workflow costs.",
        "Log raw observations and verbatim quotes directly into your central decision log.",
      ],
      resources: [
        {
          label: "Customer Interview Script & Checklist",
          type: "template",
          url: "https://coda.io/@templates/founder-customer-interviews",
        },
        {
          label: "SavvyCal / Calendly",
          type: "tool",
          url: "https://savvycal.com",
        },
      ],
      contacts: [
        {
          role: "Incubator Mentor / Sector Lead",
          why: "To validate if questions are leading or biased before customer calls take place.",
          howToReach: "Book 15 mins during weekly mentor office hours.",
        },
      ],
    };

    const remainingTasks = availableTasks.slice(1);
    const queue: QueueItem[] =
      remainingTasks.length > 0
        ? remainingTasks.map((t, idx) => ({
            taskId: t.id,
            title: t.title,
            priority: Math.min(idx + 2, 5) as 1 | 2 | 3 | 4 | 5,
            reason: `Queued behind current single prioritized action: ${chosenTask.title}.`,
          }))
        : [
            {
              taskId: "task_queue_seed_1",
              title: "Refine landing page conversion copy based on customer feedback",
              priority: 2,
              reason: "Directly amplifies conversion once initial problem-solution fit signals are verified.",
            },
            {
              taskId: "task_queue_seed_2",
              title: "Configure unit economics model in financial forecast spreadsheet",
              priority: 3,
              reason: "Needed before discussing runway projections with potential angel investors.",
            },
          ];

    return {
      nextAction,
      queue,
    };
  },

  async reportBlocker(req: BlockerRequest): Promise<BlockerResponse> {
    await delay(800, 1500);

    if (
      req.description.toLowerCase().includes("fail") ||
      req.taskId.toLowerCase().includes("fail")
    ) {
      throw new Error(
        `Failed to resolve blocker: description or taskId triggered test error state.`
      );
    }

    return {
      suggestions: [
        "Deconstruct the blocker into an asynchronous experiment: test the core assumption via a concierge MVP before investing in technical resolution.",
        "Temporarily adopt an off-the-shelf SaaS or no-code integration to unblock user acquisition while the underlying constraint is evaluated.",
        "Limit current scope to the critical path required for your 90-day goal and defer secondary requirements.",
      ],
      contacts: [
        {
          role: "Specialist Tech Lead / Domain Advisor",
          why: "Review architectural workarounds and evaluate whether third-party APIs can bypass this obstacle.",
          howToReach: "Direct message on Founder Slack network or advisor WhatsApp.",
        },
        {
          role: "Startup Attorney / Legal Advisor",
          why: "If regulatory or contractual terms are stalling progress, get an expedited assessment of minimum viable compliance.",
          howToReach: "Schedule emergency legal consultation via firm retainer portal.",
        },
      ],
      alternativeAction: {
        taskId: `alt_${req.taskId}`,
        title: "Pivot to warm outreach & customer interview synthesis while blocker resolves",
        whyNow: "Keeps founder momentum active and generates qualitative data without waiting on blocked dependencies.",
        when: {
          slot: "Immediate 60-min Focus Block",
          estimatedMinutes: 60,
        },
        where: "Notion / Workspace Docs",
        steps: [
          "Synthesize notes from last 3 customer conversations.",
          "Extract verbatim quotes relating to product value proposition.",
          "Draft 3 revised messaging hooks based on user language.",
        ],
        resources: [
          {
            label: "Mom Test Question Bank",
            type: "article",
            url: "https://momtestbook.com",
          },
        ],
        contacts: [
          {
            role: "Peer Founder in Same Batch",
            why: "Compare notes on similar blockers encountered in early go-to-market.",
            howToReach: "Post query in founder community group chat.",
          },
        ],
      },
    };
  },

  async *streamChat(req: ChatRequest): AsyncIterable<string> {
    // If any message contains "fail", throw an error to test error states
    const hasFail = req.messages.some((m) =>
      m.content.toLowerCase().includes("fail")
    );
    if (hasFail) {
      throw new Error("Chat stream failed: user prompt contained 'fail'.");
    }

    const reply =
      "Focusing on customer distribution before product polish is the single highest leverage choice today. Here is the direct execution roadmap:\n\n" +
      "1. Direct Outreach: Message 10 targeted prospects on LinkedIn who recently complained about workflow fragmentation.\n" +
      "2. Validate Willingness to Pay: Frame the problem around financial loss or saved hours, not just convenience.\n" +
      "3. Iterative Feedback Loop: If 3 prospects object to pricing, record the exact words they use.\n\n" +
      "Block out a 45-minute distraction-free sprint now to send the first five messages. Don't overthink the copy—clarity beats cleverness every single time.";

    const words = reply.split(/(\s+)/);
    for (const word of words) {
      await new Promise((resolve) => setTimeout(resolve, 40));
      yield word;
    }
  },

  async getHistory(): Promise<HistoryEntry[]> {
    await delay(800, 1500);
    return getStoredHistory();
  },

  async addHistory(entry: HistoryEntry): Promise<void> {
    await delay(800, 1500);
    if (entry.title.toLowerCase().includes("fail")) {
      throw new Error(
        `Failed to add history entry: task "${entry.title}" triggered test error state.`
      );
    }
    const current = getStoredHistory();
    const updated = [entry, ...current.filter((e) => e.id !== entry.id)];
    saveStoredHistory(updated);
  },
};

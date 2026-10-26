import type { ApiClient } from "./client";
import type {
  StartRequest,
  NextRequest,
  CompleteRequest,
  HealthResponse,
  AgentResponse,
  NextAction,
} from "../types";

const delay = (minMs = 1500, maxMs = 3000): Promise<void> => {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const BASE_ACTION: NextAction = {
  id: "act_customer_interviews",
  title: "Talk to five potential customers before buying inventory",
  reasoning:
    "Most early clothing brands fail by locking up capital in inventory before confirming that anyone wants their specific aesthetic or fit. Five direct conversations will clarify what shoppers dislike about existing options and what they are eager to pay for.",
  steps: [
    {
      id: "step_1",
      text: "List 10 people in your network or social circle who match your target customer profile.",
    },
    {
      id: "step_2",
      text: "Send the outreach message to ask for a casual 15-minute feedback chat.",
    },
    {
      id: "step_3",
      text: "Ask the 5 interview questions without pitching your designs upfront.",
    },
    {
      id: "step_4",
      text: "Note recurring complaints about existing brands, pricing comfort, and favorite clothing items.",
    },
    {
      id: "step_5",
      text: "Synthesize the feedback into 3 core design and price parameters for your first collection.",
    },
  ],
  estimatedTime: "2–3 hours",
  estimatedCost: "₹0",
  successCriteria: [
    "Five completed discovery conversations with target buyers",
    "Documented list of at least 3 recurring wardrobe frustrations",
    "Confirmation of preferred price point ranges for your initial category",
  ],
  materials: [
    {
      id: "mat_interview_questions",
      kind: "interview_questions",
      title: "5 Customer Discovery Interview Questions",
      content: `### Customer Discovery Questions

Do not pitch your designs yet. Your goal is to learn their real shopping habits.

1. **Recent Behavior**: What was the last piece of clothing you bought, and where did you find it?
2. **Frustrations**: What is the most frustrating thing about shopping for this category today (fit, fabric, price, durability)?
3. **Discovery**: How do you usually discover new independent brands?
4. **Price Benchmark**: How much do you typically spend on this kind of garment when you love the quality?
5. **Unmet Needs**: If you could change one thing about your favorite current brand, what would it be?`,
    },
    {
      id: "mat_outreach_msg",
      kind: "outreach_message",
      title: "15-Minute Feedback Outreach Message",
      content: `### Direct Message / WhatsApp Outreach

Use this message to reach out to potential buyers:

> "Hey [Name]! I'm researching a new clothing concept focused on [aesthetic/problem, e.g., everyday breathable linen / relaxed workwear].
>
> I'm not selling anything—I'm doing 15-minute research chats to understand what people currently struggle to find in stores.
>
> Would you be open to a quick call or coffee this week? I'd love your honest perspective!"`,
    },
  ],
};

export const mock: ApiClient = {
  async health(): Promise<HealthResponse> {
    await delay(300, 600);
    return { ok: true, model: "mock-agent-v1" };
  },

  async start(req: StartRequest): Promise<AgentResponse> {
    await delay(1500, 3000);

    if (req.idea.toLowerCase().includes("fail")) {
      throw new Error("Simulated failure: idea contains 'fail'.");
    }

    return {
      sessionId: "session_clothing_demo",
      status: "needs_clarification",
      stage: "idea",
      blocker: "Unclear target customer segment and initial budget allocation",
      questions: [
        {
          id: "q_budget",
          question: "What is your initial budget for testing this clothing brand?",
          options: [
            "Under ₹10,000",
            "₹10,000 – ₹50,000",
            "₹50,000 – ₹2,00,000",
            "₹2,00,000+",
          ],
        },
        {
          id: "q_customer",
          question:
            "Who is your ideal customer, and what specific aesthetic or problem in their wardrobe are you addressing?",
        },
        {
          id: "q_progress",
          question: "What have you done so far?",
          options: [
            "Just have the raw idea",
            "Created moodboards or initial sketches",
            "Contacted fabric suppliers or tailors",
            "Built an audience or social media account",
          ],
        },
      ],
    };
  },

  async next(req: NextRequest): Promise<AgentResponse> {
    await delay(1500, 3000);

    const ideaText = req.context?.idea || "";
    if (
      ideaText.toLowerCase().includes("fail") ||
      req.message?.toLowerCase().includes("fail")
    ) {
      throw new Error("Simulated failure: idea contains 'fail'.");
    }

    if (req.message) {
      return {
        sessionId: req.sessionId,
        status: "action_ready",
        stage: "validation",
        blocker:
          "Validating customer willingness to buy before manufacturing inventory",
        action: BASE_ACTION,
        message:
          "Focus on listening for unprompted frustrations and specific past purchases rather than hypothetical compliments. When they say 'I'd definitely buy that,' ask 'When did you last spend money on something similar?'",
      };
    }

    return {
      sessionId: req.sessionId,
      status: "action_ready",
      stage: "validation",
      blocker:
        "Validating customer willingness to buy before manufacturing inventory",
      action: BASE_ACTION,
    };
  },

  async complete(req: CompleteRequest): Promise<AgentResponse> {
    await delay(1500, 3000);

    const ideaText = req.context?.idea || "";
    if (
      ideaText.toLowerCase().includes("fail") ||
      req.notes.toLowerCase().includes("fail")
    ) {
      throw new Error("Simulated failure: idea contains 'fail'.");
    }

    let nextAction: NextAction;
    let stage: AgentResponse["stage"] = "validation";
    let blocker = "";

    if (req.outcome === "done") {
      stage = "planning";
      blocker = "Validating upfront financial commitment before placing fabrication orders";
      nextAction = {
        id: "act_preorder_page",
        title: "Test willingness to pay with a pre-order page",
        reasoning: `Based on your customer feedback ("${req.notes}"), interest is verified. The next critical move is testing monetary commitment through pre-orders or waitlist deposits before committing to factory minimum order quantities.`,
        steps: [
          {
            id: "step_c1",
            text: "Create a simple one-page pre-order showcase with 3 digital mockups and your price point.",
          },
          {
            id: "step_c2",
            text: "Set up a zero-risk deposit or waitlist signup form (e.g. ₹199 reservation).",
          },
          {
            id: "step_c3",
            text: "Share the link privately with the 5 people you interviewed and ask for their commitment.",
          },
          {
            id: "step_c4",
            text: "Evaluate whether you hit the pre-order threshold needed to fund your first sample run.",
          },
        ],
        estimatedTime: "3–4 hours",
        estimatedCost: "₹0–₹500",
        successCriteria: [
          "Live pre-order landing page with product specifications and price",
          "At least 3 confirmed pre-orders or deposit reservations secured",
          "Clear signal on which specific SKU has the highest demand",
        ],
        materials: [
          {
            id: "mat_preorder_template",
            kind: "template",
            title: "Pre-Order Page Structure & Copy",
            content: `### Pre-Order Page Architecture

1. **Hero Headline**: State the specific problem solved (e.g. "Work shirts tailored for hot commutes that don't wrinkle").
2. **Visual Proof**: 3 high-resolution mockup angles with fabric closeup.
3. **Offer & Incentive**: Pre-order batch limited to 50 pieces at 20% early-backer discount.
4. **Transparent Timeline**: Estimated delivery date and weekly production updates.
5. **Call to Action**: Reserve your size with refundable deposit.`,
          },
        ],
      };
    } else if (req.outcome === "partial") {
      stage = "validation";
      blocker = "Incomplete discovery dataset leaves uncertainty in key garment specifications";
      nextAction = {
        id: "act_finish_interviews",
        title: "Finish the remaining interviews this week",
        reasoning: `You gathered valuable initial signal ("${req.notes}"), but need to complete the remaining conversations to reach five total inputs. A sample size of five is the proven minimum to separate individual preferences from genuine market patterns.`,
        steps: [
          {
            id: "step_p1",
            text: "Review the notes from the conversations you already completed.",
          },
          {
            id: "step_p2",
            text: "Reach out to 3 additional people today to schedule the remaining discovery sessions.",
          },
          {
            id: "step_p3",
            text: "Conduct the remaining interviews using the discovery questions material.",
          },
          {
            id: "step_p4",
            text: "Combine all 5 sets of notes into a single list of customer requirements.",
          },
        ],
        estimatedTime: "1.5–2 hours",
        estimatedCost: "₹0",
        successCriteria: [
          "All 5 customer discovery interviews finished and documented",
          "Shared matrix of price tolerance and desired fabrics across all participants",
        ],
        materials: [
          {
            id: "mat_interview_checklist",
            kind: "checklist",
            title: "Interview Completion Checklist",
            content: `### Discovery Completion Checklist

- [ ] 5 interviews completed
- [ ] Direct quotes logged for each question
- [ ] Confirmed highest willingness-to-pay range
- [ ] Documented top 2 fabric and fit preferences`,
          },
        ],
      };
    } else {
      // "blocked"
      stage = "validation";
      blocker = "Direct channel access to prospective customers";
      nextAction = {
        id: "act_find_customers",
        title: "Find customers where they already gather",
        reasoning: `Your obstacle ("${req.notes}") indicates direct individual outreach is meeting resistance. Instead of cold messaging, find existing communities, niche subreddits, fashion pop-ups, or campus groups where your target demographic already discusses clothing.`,
        steps: [
          {
            id: "step_b1",
            text: "Identify 3 online communities or local events where your target demographic discusses clothing and style.",
          },
          {
            id: "step_b2",
            text: "Observe the top 10 most upvoted or discussed complaint threads about clothing in that niche.",
          },
          {
            id: "step_b3",
            text: "Participate constructively by asking for advice on the exact wardrobe dilemma your brand solves.",
          },
          {
            id: "step_b4",
            text: "Direct message 3 active contributors who expressed frustration with current brand options.",
          },
        ],
        estimatedTime: "2 hours",
        estimatedCost: "₹0",
        successCriteria: [
          "Joined 3 relevant community hubs or forums",
          "Extracted 5 unprompted complaints from public discussions",
          "Initiated 3 productive direct conversations with community members",
        ],
        materials: [
          {
            id: "mat_community_guide",
            kind: "research_summary",
            title: "Community Sourcing Guide",
            content: `### Community Discovery Playbook

1. **Search Queries**: Look for "[Category] recommendations India", "[Brand] alternative reddit", or "comfortable [item] recommendation".
2. **Value First**: Answer someone's styling or fabric question before mentioning your project.
3. **Transition to DM**: "Saw your comment about finding shirts that breathe well in summer—I'm actually working on solving this. Mind if I ask two quick questions about what you look for?"`,
          },
        ],
      };
    }

    return {
      sessionId: req.sessionId,
      status: "action_ready",
      stage,
      blocker,
      action: nextAction,
    };
  },
};

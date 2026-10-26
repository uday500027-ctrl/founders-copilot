# Praxism API Contract

This document specifies the HTTP API interface between the Next.js frontend and the Ollama backend service (endpoints located under `frontend/src/app/api/`).

All data structures match [`frontend/src/lib/types.ts`](file:///c:/founder-copilot/frontend/src/lib/types.ts) exactly.

---

## 1. Backend Architecture & Implementation Guidelines

1. **Stateless Operations**: Every stateful request (`/agent/next` and `/agent/complete`) carries the complete `SessionContext` (`idea`, `answers`, `history`, `currentAction`). The backend MUST remain completely stateless so it can run seamlessly on Vercel Serverless / Edge Functions without a database or server-side session cache.
2. **Clarification Over Hallucination**: If the user's idea lacks essential context (e.g., target customer, budget, current progress), the agent MUST return `status: "needs_clarification"` with targeted `ClarificationQuestion[]` rather than inventing assumptions.
3. **Server-Side Secrets**: The Ollama API URL or key MUST remain strictly server-side (e.g. `OLLAMA_API_URL`, `OLLAMA_API_KEY`). NEVER prefix backend credentials with `NEXT_PUBLIC_` or expose them to client bundles.
4. **Error Handling**: All non-2xx responses MUST return a JSON payload with an `error` string and standard HTTP status codes (4xx/5xx):
   ```json
   {
     "error": "Descriptive explanation of the error"
   }
   ```
5. **Execution Timeout**: Frontend HTTP clients enforce a 60-second AbortController timeout. Backend routes must respond within this window.

---

## 2. Endpoints

### 2.1 Health Check
Verifies connectivity with the backend and local Ollama model instance.

- **Method**: `GET`
- **Path**: `${API_URL}/health` (default: `/api/health`)

#### Response JSON (`HealthResponse`) - `200 OK`
```json
{
  "ok": true,
  "model": "llama3.2"
}
```

---

### 2.2 Start Journey
Initializes the core loop with the user's founder idea.

- **Method**: `POST`
- **Path**: `${API_URL}/agent/start`
- **Headers**: `Content-Type: application/json`

#### Request JSON (`StartRequest`)
```json
{
  "idea": "I want to start a clothing brand, but I don't know where to begin"
}
```

#### Response JSON (`AgentResponse`) - `200 OK` (Needs Clarification)
```json
{
  "sessionId": "session_clothing_demo",
  "status": "needs_clarification",
  "stage": "idea",
  "blocker": "Unclear target customer segment and initial budget allocation",
  "questions": [
    {
      "id": "q_budget",
      "question": "What is your initial budget for testing this clothing brand?",
      "options": [
        "Under ₹10,000",
        "₹10,000 – ₹50,000",
        "₹50,000 – ₹2,00,000",
        "₹2,00,000+"
      ]
    },
    {
      "id": "q_customer",
      "question": "Who is your ideal customer, and what specific aesthetic or problem in their wardrobe are you addressing?"
    },
    {
      "id": "q_progress",
      "question": "What have you done so far?",
      "options": [
        "Just have the raw idea",
        "Created moodboards or initial sketches",
        "Contacted fabric suppliers or tailors",
        "Built an audience or social media account"
      ]
    }
  ]
}
```

---

### 2.3 Next Action / Clarification Response / Guidance
Submits clarification answers or requests advice, advancing the agent to determine the ONE clear next move.

- **Method**: `POST`
- **Path**: `${API_URL}/agent/next`
- **Headers**: `Content-Type: application/json`

#### Request JSON (`NextRequest`)
```json
{
  "sessionId": "session_clothing_demo",
  "context": {
    "idea": "I want to start a clothing brand, but I don't know where to begin",
    "answers": [
      {
        "questionId": "q_budget",
        "question": "What is your initial budget for testing this clothing brand?",
        "answer": "₹10,000 – ₹50,000"
      },
      {
        "questionId": "q_customer",
        "question": "Who is your ideal customer, and what specific aesthetic or problem in their wardrobe are you addressing?",
        "answer": "College students looking for minimalist linen streetwear that doesn't wrinkle easily."
      },
      {
        "questionId": "q_progress",
        "question": "What have you done so far?",
        "answer": "Created moodboards or initial sketches"
      }
    ],
    "history": []
  },
  "answers": [
    {
      "questionId": "q_budget",
      "question": "What is your initial budget for testing this clothing brand?",
      "answer": "₹10,000 – ₹50,000"
    },
    {
      "questionId": "q_customer",
      "question": "Who is your ideal customer, and what specific aesthetic or problem in their wardrobe are you addressing?",
      "answer": "College students looking for minimalist linen streetwear that doesn't wrinkle easily."
    },
    {
      "questionId": "q_progress",
      "question": "What have you done so far?",
      "answer": "Created moodboards or initial sketches"
    }
  ],
  "message": "Optional user help question or blocker note"
}
```

#### Response JSON (`AgentResponse`) - `200 OK` (Action Ready)
```json
{
  "sessionId": "session_clothing_demo",
  "status": "action_ready",
  "stage": "validation",
  "blocker": "Validating customer willingness to buy before manufacturing inventory",
  "action": {
    "id": "act_customer_interviews",
    "title": "Talk to five potential customers before buying inventory",
    "reasoning": "Most early clothing brands fail by locking up capital in inventory before confirming that anyone wants their specific aesthetic or fit. Five direct conversations will clarify what shoppers dislike about existing options and what they are eager to pay for.",
    "steps": [
      {
        "id": "step_1",
        "text": "List 10 people in your network or social circle who match your target customer profile."
      },
      {
        "id": "step_2",
        "text": "Send the outreach message to ask for a casual 15-minute feedback chat."
      },
      {
        "id": "step_3",
        "text": "Ask the 5 interview questions without pitching your designs upfront."
      },
      {
        "id": "step_4",
        "text": "Note recurring complaints about existing brands, pricing comfort, and favorite clothing items."
      },
      {
        "id": "step_5",
        "text": "Synthesize the feedback into 3 core design and price parameters for your first collection."
      }
    ],
    "estimatedTime": "2–3 hours",
    "estimatedCost": "₹0",
    "successCriteria": [
      "Five completed discovery conversations with target buyers",
      "Documented list of at least 3 recurring wardrobe frustrations",
      "Confirmation of preferred price point ranges for your initial category"
    ],
    "materials": [
      {
        "id": "mat_interview_questions",
        "kind": "interview_questions",
        "title": "5 Customer Discovery Interview Questions",
        "content": "### Customer Discovery Questions\n\nDo not pitch your designs yet. Your goal is to learn their real shopping habits.\n\n1. **Recent Behavior**: What was the last piece of clothing you bought, and where did you find it?\n2. **Frustrations**: What is the most frustrating thing about shopping for this category today?\n3. **Discovery**: How do you usually discover new independent brands?\n4. **Price Benchmark**: How much do you typically spend on this garment?\n5. **Unmet Needs**: If you could change one thing about your favorite current brand, what would it be?"
      },
      {
        "id": "mat_outreach_msg",
        "kind": "outreach_message",
        "title": "15-Minute Feedback Outreach Message",
        "content": "### Direct Message Outreach\n\n> \"Hey [Name]! I'm researching a new clothing concept focused on everyday breathable linen.\n>\n> I'm not selling anything—I'm doing 15-minute research chats to understand what people currently struggle to find in stores.\n>\n> Would you be open to a quick call or coffee this week? I'd love your honest perspective!\""
      }
    ]
  },
  "message": "Optional reply when a message was sent in NextRequest"
}
```

---

### 2.4 Complete Action
Submits the user's execution outcome ("done" | "partial" | "blocked") along with personal notes, prompting the agent to learn from what happened and synthesize the next move.

- **Method**: `POST`
- **Path**: `${API_URL}/agent/complete`
- **Headers**: `Content-Type: application/json`

#### Request JSON (`CompleteRequest`)
```json
{
  "sessionId": "session_clothing_demo",
  "context": {
    "idea": "I want to start a clothing brand, but I don't know where to begin",
    "answers": [],
    "history": [],
    "currentAction": {
      "id": "act_customer_interviews",
      "title": "Talk to five potential customers before buying inventory",
      "reasoning": "...",
      "steps": [],
      "successCriteria": [],
      "materials": []
    }
  },
  "actionId": "act_customer_interviews",
  "outcome": "done",
  "notes": "Spoke with 5 target customers. They love the breathable linen idea and hate synthetic polyester blends. Expected price point is ₹1,499."
}
```

#### Response JSON (`AgentResponse`) - `200 OK` (Next Move Synthesized)
```json
{
  "sessionId": "session_clothing_demo",
  "status": "action_ready",
  "stage": "planning",
  "blocker": "Validating upfront financial commitment before placing fabrication orders",
  "action": {
    "id": "act_preorder_page",
    "title": "Test willingness to pay with a pre-order page",
    "reasoning": "Based on your customer feedback (\"Spoke with 5 target customers...\"), interest is verified. The next critical move is testing monetary commitment through pre-orders or waitlist deposits before committing to factory minimum order quantities.",
    "steps": [
      {
        "id": "step_c1",
        "text": "Create a simple one-page pre-order showcase with 3 digital mockups and your price point."
      },
      {
        "id": "step_c2",
        "text": "Set up a zero-risk deposit or waitlist signup form (e.g. ₹199 reservation)."
      },
      {
        "id": "step_c3",
        "text": "Share the link privately with the 5 people you interviewed and ask for their commitment."
      },
      {
        "id": "step_c4",
        "text": "Evaluate whether you hit the pre-order threshold needed to fund your first sample run."
      }
    ],
    "estimatedTime": "3–4 hours",
    "estimatedCost": "₹0–₹500",
    "successCriteria": [
      "Live pre-order landing page with product specifications and price",
      "At least 3 confirmed pre-orders or deposit reservations secured",
      "Clear signal on which specific SKU has the highest demand"
    ],
    "materials": [
      {
        "id": "mat_preorder_template",
        "kind": "template",
        "title": "Pre-Order Page Structure & Copy",
        "content": "### Pre-Order Page Architecture\n\n1. **Hero Headline**: State the specific problem solved.\n2. **Visual Proof**: 3 mockup angles.\n3. **Early-Backer Incentive**: 20% discount on first batch.\n4. **Call to Action**: Reserve size with refundable deposit."
      }
    ]
  }
}
```

---

## 3. Error Testing Specification

For mock clients and backend integration tests:
- Supplying an `idea` string containing the substring `"fail"` (case-insensitive) triggers an error.
- Supplying a `notes` or `message` string containing `"fail"` triggers an error.
- Errors MUST return JSON `{ "error": "Descriptive message" }` with an HTTP status code $\ge 400$.

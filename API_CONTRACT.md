# API Contract: Founder Copilot

This document specifies the HTTP API interface between the Next.js frontend and the backend service (default base URL: `http://localhost:8000`).

---

## 1. Global Specifications

### Headers
- **Content-Type**: `application/json` (unless streaming plain text, as in `POST /chat`)
- **Accept**: `application/json` (or `text/plain` for `/chat`)

### Standard Error Format
All non-2xx responses MUST return a JSON payload with an `error` string:

```json
{
  "error": "Descriptive error message indicating reason for failure"
}
```

HTTP Status Codes:
- `400 Bad Request`: Payload validation failure or missing mandatory fields.
- `404 Not Found`: Requested resource or entity does not exist.
- `422 Unprocessable Entity`: Business logic failure or inability to generate plan.
- `500 Internal Server Error`: Backend error or unhandled model exception.

---

## 2. Endpoints

### 2.1 Generate Next Action Plan
Determines the ONE highest-leverage next action for a founder and returns prioritized queue items.

- **Method**: `POST`
- **Path**: `/plan`
- **Headers**: `Content-Type: application/json`

#### Request JSON (`PlanRequest`)
```json
{
  "profile": {
    "name": "Alex Vance",
    "startupName": "NovaSync",
    "oneLiner": "Automated compliance reconciliation for B2B SaaS teams",
    "stage": "mvp",
    "industry": "B2B SaaS / FinTech",
    "teamSize": 2,
    "hoursPerWeek": 50,
    "goal90Days": "Secure 3 signed pilot customers at $500/mo",
    "constraints": ["Bootstrapped budget", "No dedicated legal counsel"]
  },
  "tasks": [
    {
      "id": "task_1",
      "title": "Cold outreach to 15 design partners on LinkedIn",
      "notes": "Target VP of Operations at Series A startups",
      "status": "todo",
      "createdAt": "2026-10-25T10:00:00.000Z"
    },
    {
      "id": "task_2",
      "title": "Implement Stripe Checkout webhook for self-serve onboarding",
      "status": "todo",
      "createdAt": "2026-10-25T10:05:00.000Z"
    }
  ],
  "skippedTaskIds": ["task_old_archived"]
}
```

Field Specifications:
- `profile.stage`: Enum `"idea"` | `"mvp"` | `"early_revenue"` | `"scaling"`
- `tasks[].status`: Enum `"todo"` | `"doing"` | `"done"` | `"blocked"`
- `skippedTaskIds`: Optional array of task IDs to exclude from consideration.

#### Response JSON (`PlanResponse`) - `200 OK`
```json
{
  "nextAction": {
    "taskId": "task_1",
    "title": "Cold outreach to 15 design partners on LinkedIn",
    "whyNow": "This is the single most critical bottleneck for NovaSync at the MVP stage. Resolving this unlocks customer traction and validates product-market demand before committing engineering resources.",
    "when": {
      "slot": "Tomorrow Morning (9:30 AM - 11:00 AM)",
      "estimatedMinutes": 90,
      "deadline": "2026-10-27"
    },
    "where": "CRM & LinkedIn Sales Navigator",
    "steps": [
      "Filter VP of Operations in B2B SaaS companies with 20-100 employees.",
      "Send tailored 3-sentence connection notes focusing on current manual invoice reconciliation pain.",
      "Log conversation threads and scheduling links in central outreach tracker."
    ],
    "resources": [
      {
        "label": "B2B Outreach Playbook & Copy Templates",
        "url": "https://templates.example.com/b2b-outreach",
        "type": "template"
      },
      {
        "label": "LinkedIn Sales Navigator",
        "url": "https://linkedin.com",
        "type": "tool"
      }
    ],
    "contacts": [
      {
        "role": "GTM Advisor",
        "why": "Review reply and conversion rates on initial messaging sequence.",
        "howToReach": "Slack #advisors channel or weekly sync."
      }
    ]
  },
  "queue": [
    {
      "taskId": "task_2",
      "title": "Implement Stripe Checkout webhook for self-serve onboarding",
      "priority": 2,
      "reason": "Queued directly behind customer discovery validation."
    }
  ]
}
```

Field Specifications:
- `nextAction.resources[].type`: Enum `"tool"` | `"template"` | `"article"` | `"video"` | `"community"`
- `queue[].priority`: Integer `1` | `2` | `3` | `4` | `5`

---

### 2.2 Report Blocker
Analyzes a founder's operational or technical blocker on a task and returns actionable suggestions, relevant advisors/contacts, and an alternative unblocking action.

- **Method**: `POST`
- **Path**: `/blocker`
- **Headers**: `Content-Type: application/json`

#### Request JSON (`BlockerRequest`)
```json
{
  "profile": {
    "name": "Alex Vance",
    "startupName": "NovaSync",
    "oneLiner": "Automated compliance reconciliation for B2B SaaS teams",
    "stage": "mvp",
    "industry": "B2B SaaS / FinTech",
    "teamSize": 2,
    "hoursPerWeek": 50,
    "goal90Days": "Secure 3 signed pilot customers at $500/mo",
    "constraints": ["Bootstrapped budget"]
  },
  "taskId": "task_1",
  "description": "Prospective pilot clients are demanding SOC2 Type II certification before connecting test databases."
}
```

#### Response JSON (`BlockerResponse`) - `200 OK`
```json
{
  "suggestions": [
    "Deconstruct the blocker: offer a zero-PII synthetic sandbox environment or anonymized dummy dataset to pilot test the value prop without SOC2.",
    "Share a vendor security whitepaper and third-party code audit summary in lieu of full SOC2 for the duration of the 30-day proof of concept.",
    "Shift focus to prospective clients in non-regulated sectors who do not have mandatory SOC2 procurement gates."
  ],
  "contacts": [
    {
      "role": "Specialist Tech Lead / Domain Advisor",
      "why": "Review architectural workarounds and evaluate whether synthetic data generators can bypass customer compliance barriers.",
      "howToReach": "Founder Slack #security-advisors or scheduled 1:1."
    },
    {
      "role": "Startup Attorney / Legal Counsel",
      "why": "Draft a lightweight Pilot Agreement with standard confidentiality and indemnification caps.",
      "howToReach": "Schedule emergency legal consultation via firm retainer portal."
    }
  ],
  "alternativeAction": {
    "taskId": "alt_task_1",
    "title": "Target non-regulated SMB prospects who do not require SOC2 for initial pilots",
    "whyNow": "Keeps customer acquisition momentum active and generates qualitative feedback without waiting on blocked dependencies.",
    "when": {
      "slot": "Immediate 60-min Focus Block",
      "estimatedMinutes": 60
    },
    "where": "Notion / CRM",
    "steps": [
      "Adjust ICP search criteria to teams under 40 employees.",
      "Reach out to 8 founders directly via email with personalized demo invite."
    ],
    "resources": [
      {
        "label": "Pilot Agreement Template",
        "type": "template",
        "url": "https://templates.example.com/pilot-agreement"
      }
    ],
    "contacts": [
      {
        "role": "Peer Founder in Same Batch",
        "why": "Compare notes on early enterprise pilot terms without formal certifications.",
        "howToReach": "Post query in founder community group chat."
      }
    ]
  }
}
```

---

### 2.3 Stream Chat Assistant
Streams founder coaching responses chunk by chunk using a streaming plain text response.

- **Method**: `POST`
- **Path**: `/chat`
- **Headers**:
  - Request: `Content-Type: application/json`
  - Response: `Content-Type: text/plain; charset=utf-8`

#### Request JSON (`ChatRequest`)
```json
{
  "profile": {
    "name": "Alex Vance",
    "startupName": "NovaSync",
    "oneLiner": "Automated compliance reconciliation for B2B SaaS teams",
    "stage": "mvp",
    "industry": "B2B SaaS / FinTech",
    "teamSize": 2,
    "hoursPerWeek": 50,
    "goal90Days": "Secure 3 signed pilot customers at $500/mo",
    "constraints": ["Bootstrapped budget"]
  },
  "currentAction": {
    "taskId": "task_1",
    "title": "Cold outreach to 15 design partners on LinkedIn",
    "whyNow": "Securing 3 committed pilot users is required before finalizing Q4 MVP scope.",
    "when": {
      "slot": "Morning Sprint",
      "estimatedMinutes": 90
    },
    "where": "LinkedIn Sales Navigator & CRM",
    "steps": [
      "Filter VP of Operations in B2B SaaS companies",
      "Send personalized connection notes"
    ],
    "resources": [],
    "contacts": []
  },
  "messages": [
    {
      "role": "user",
      "content": "How should I structure my cold message so it doesn't sound spammy?"
    }
  ]
}
```

#### Response Stream - `200 OK`
- The response body is a readable stream yielding plain text UTF-8 chunks as they are generated by the model.
- Example stream output:
```text
Focusing on customer distribution before product polish is the single highest leverage choice today...
```

---

### 2.4 Get Action History
Retrieves all completed or logged historical actions.

- **Method**: `GET`
- **Path**: `/history`
- **Headers**: `Accept: application/json`

#### Response JSON (`HistoryEntry[]`) - `200 OK`
```json
[
  {
    "id": "hist_1",
    "taskId": "task_hist_1",
    "title": "Cold outreach to 15 design partners on LinkedIn",
    "outcome": "done",
    "completedAt": "2026-10-25T11:00:00.000Z",
    "note": "Sent all 15 personalized connection requests; 4 accepted within 24 hours, 2 scheduled discovery calls.",
    "action": {
      "taskId": "task_hist_1",
      "title": "Cold outreach to 15 design partners on LinkedIn",
      "whyNow": "Securing 3 committed pilot users is required before finalizing the Q4 MVP scope.",
      "when": {
        "slot": "Morning Sprint (9:00 AM - 10:30 AM)",
        "estimatedMinutes": 90,
        "deadline": "2026-10-25"
      },
      "where": "LinkedIn Sales Navigator & CRM",
      "steps": [
        "Filter VP of Operations in B2B SaaS companies with 20-100 employees.",
        "Send personalized 3-sentence connection notes focusing on current manual invoice reconciliation pain.",
        "Log replies and scheduling links in Notion outreach tracker."
      ],
      "resources": [
        {
          "label": "B2B Outreach Playbook & Copy Templates",
          "url": "https://templates.example.com/b2b-outreach",
          "type": "template"
        }
      ],
      "contacts": [
        {
          "role": "GTM Advisor",
          "why": "Review open and reply rates on initial message sequence.",
          "howToReach": "Slack #advisors channel or weekly sync."
        }
      ]
    }
  }
]
```

Field Specifications:
- `outcome`: Enum `"done"` | `"skipped"`
- `completedAt`: ISO 8601 date string.
- `action`: Snapshot of the `NextAction` that was followed.
- `note`: Optional freeform founder note.

---

### 2.5 Add Action History Entry
Persists a newly completed or resolved next action into history.

- **Method**: `POST`
- **Path**: `/history`
- **Headers**: `Content-Type: application/json`

#### Request JSON (`HistoryEntry`)
```json
{
  "id": "hist_2",
  "taskId": "task_2",
  "title": "Implement Stripe Checkout webhook for self-serve onboarding",
  "outcome": "done",
  "completedAt": "2026-10-26T14:00:00.000Z",
  "note": "Webhook deployed and tested with test cards; subscriptions provisioning cleanly.",
  "action": {
    "taskId": "task_2",
    "title": "Implement Stripe Checkout webhook for self-serve onboarding",
    "whyNow": "Users are dropping off because billing activation requires manual admin intervention.",
    "when": {
      "slot": "Afternoon Deep Work (2:00 PM - 4:00 PM)",
      "estimatedMinutes": 120
    },
    "where": "Backend API & Stripe Developer Dashboard",
    "steps": [
      "Configure Stripe checkout.session.completed webhook endpoint in API router.",
      "Verify webhook signature with STRIPE_WEBHOOK_SECRET.",
      "Provision workspace subscription record in PostgreSQL."
    ],
    "resources": [
      {
        "label": "Stripe Webhooks Integration Guide",
        "url": "https://docs.stripe.com/webhooks",
        "type": "article"
      }
    ],
    "contacts": [
      {
        "role": "Stripe Developer Support",
        "why": "Clarify subscription upgrade retry backoff semantics.",
        "howToReach": "Stripe Discord #support channel."
      }
    ]
  }
}
```

#### Response - `200 OK` or `201 Created`
```json
{
  "success": true
}
```
*(or HTTP 204 No Content)*

---

## 3. Error State Simulation Testing

When testing against mock clients or test backends:
- Any task title containing the substring `"fail"` (case-insensitive) triggers an artificial `Error` or `500 Internal Server Error` response.
- Chat messages containing `"fail"` trigger stream termination with error.
- Blocker requests with `"fail"` in taskId or description trigger blocker resolution error.

# Lead Qualifier Agent — Plan

## Overview

Maven is a conversational AI that qualifies inbound leads for RETAILMavens in 3–5 exchanges, then outputs a structured JSON recommendation the app can act on.

---

## Programs & Routing Criteria

| Program | Revenue Band | Primary Pain | Primary Goal |
|---|---|---|---|
| RETAILMavens Coaching | Under $300K | No systems, chaos, owner doing everything | Stabilize, build foundation |
| Profit Club | $300K – $1M | Growth stalled, scaling problems, hiring | Scale aggressively, hit $1M |
| Life After Retail | Any | Burnout, ready to move on | Sell or exit the business |

> **Life After Retail overrides revenue.** If the owner's goal is to exit/sell, recommend it regardless of revenue band.

---

## The Three Qualification Signals

Maven must naturally collect these three things before making a recommendation:

### 1. Annual Revenue (Band)
- Determines the baseline program tier
- Exact number not required — a range is enough
- Watch for: "under 200K", "doing about 500", "almost at a million", "just starting"

### 2. Biggest Pain Point
- Validates fit with the program's focus area
- Categories:
  - **Operations chaos** → Coaching (needs systems)
  - **Inventory problems** → Coaching or Profit Club
  - **Can't scale / hiring issues** → Profit Club
  - **Works too many hours / burnout** → Coaching or Life After Retail
  - **Wants to sell / transition** → Life After Retail

### 3. Main Goal
- Confirms direction and readiness
- Categories:
  - **Stabilize / fix the foundation** → Coaching
  - **Grow fast / hit a revenue target** → Profit Club
  - **Sell / exit / semi-retire** → Life After Retail

---

## Qualification vs. Disqualification

### Qualified Lead ✅
- Owns an independent retail store (not franchised, not online-only unless also physical)
- Revenue under $10M (above that, out of scope)
- Has at least one clear pain point
- Has a defined goal (even vague is fine: "I just want to grow")

### Disqualified Lead ❌ (`"r": false` in JSON)
- Not a retail store owner (wholesale, restaurant, service business, etc.)
- No interest in coaching or growth ("just browsing", "researching for a friend")
- Already working with a competitor program and not open to switching
- Revenue over $10M (misfit — too large for these programs)

---

## The JSON Output Schema

After 3–4 exchanges, Maven appends this JSON on a new line after its conversational reply:

```json
{
  "r": true,
  "prog": "Profit Club",
  "why": "At $600K you've outgrown basic systems but haven't cracked the scaling code yet — Profit Club is built exactly for that gap.",
  "fit": "High",
  "urgency": "Medium",
  "ready": "High"
}
```

### Field Definitions

| Field | Type | Values | Meaning |
|---|---|---|---|
| `r` | boolean | `true` / `false` | Is this a qualified lead? |
| `prog` | string | `"RETAILMavens Coaching"` / `"Profit Club"` / `"Life After Retail"` | Recommended program (exact name) |
| `why` | string | 1–2 sentences | Personalized reason tied to their specific situation |
| `fit` | string | `"High"` / `"Medium"` / `"Low"` | How well their situation matches the program |
| `urgency` | string | `"High"` / `"Medium"` / `"Low"` | How urgently they need help (based on pain signals) |
| `ready` | string | `"High"` / `"Medium"` / `"Low"` | How ready they seem to take action / invest |

### Scoring Guidelines for Maven

**fit:**
- High → all 3 signals clearly align with the program
- Medium → revenue fits but pain/goal is ambiguous
- Low → borderline match (e.g. $290K but sounds ready to scale)

**urgency:**
- High → explicit pain language ("drowning", "can't keep up", "losing money")
- Medium → aware of the problem but not in crisis
- Low → curious/exploring, no immediate pain

**ready:**
- High → asks about pricing, next steps, or expresses strong intent
- Medium → engaged but hasn't indicated willingness to invest
- Low → passive responses, non-committal

---

## Conversation Flow Design

```
Turn 1 — Maven opens:
  "Hi! I'm Maven... What's going on in your business right now?"
  → Listen for: any of the 3 signals

Turn 2 — Dig into pain:
  Ask about the biggest challenge if not mentioned
  → Listen for: pain point + hints at goal

Turn 3 — Clarify goal + revenue:
  Ask one question to nail down the missing signal(s)
  → Should now have all 3 signals

Turn 4 — Recommend + contact capture:
  Give warm recommendation
  → Append JSON on new line
  → UI surfaces contact capture form (name + email)

Turn 5 (optional) — Handle objection or clarify:
  If lead pushes back or asks more questions, answer then re-append JSON
```

---

## ⚠️ Critical Gap: Contact Info Is Never Collected

The current chat flow does not ask for the user's name or email. Without this, a qualified lead cannot be followed up.

**Solution:** After the AI outputs JSON with `r: true`, the UI should surface an inline contact capture form — not inside the chat, but as a card below it. This keeps the chat experience clean.

The form only appears once the recommendation is made. It should feel like a natural next step, not a gate.

---

## Database Design

### Recommended Stack: Supabase (hosted PostgreSQL)

Supabase is the best fit here because:
- Hosted Postgres with a dashboard to view leads — no server to manage
- Free tier handles thousands of leads
- Row-level security, so only your API can write
- Webhooks to trigger email notifications on new leads
- Easy to connect to HubSpot / Go High Level via Zapier or direct API later

### `leads` Table Schema

```sql
CREATE TABLE leads (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Contact info (captured via form after recommendation)
  name          TEXT,
  email         TEXT,
  phone         TEXT,

  -- Qualification result
  qualified     BOOLEAN NOT NULL,
  program       TEXT,                        -- "RETAILMavens Coaching" | "Profit Club" | "Life After Retail" | NULL
  fit           TEXT,                        -- "High" | "Medium" | "Low" | NULL
  urgency       TEXT,                        -- "High" | "Medium" | "Low" | NULL
  ready         TEXT,                        -- "High" | "Medium" | "Low" | NULL
  why           TEXT,                        -- AI's personalized reason

  -- Disqualification info (only set when qualified = false)
  disqualify_reason TEXT,                   -- e.g. "Not a retailer", "Revenue over $10M"

  -- Full conversation for review / CRM sync
  conversation  JSONB NOT NULL,             -- array of {role, content} messages
  session_id    TEXT                        -- optional, for deduplication
);
```

### Indexes to add

```sql
CREATE INDEX leads_qualified_idx ON leads (qualified);
CREATE INDEX leads_urgency_ready_idx ON leads (urgency, ready);
CREATE INDEX leads_created_at_idx ON leads (created_at DESC);
```

---

## API Route Design

### `POST /api/leads`

Called by the frontend when:
- The AI outputs a JSON block (either `r: true` or `r: false`)
- The user submits the contact capture form (for `r: true`)

These can be two separate calls, or one call once contact info is available. Recommended: **two-step**.

**Step 1 — Save qualification (no contact info yet):**
```json
POST /api/leads
{
  "qualified": true,
  "program": "Profit Club",
  "fit": "High",
  "urgency": "High",
  "ready": "Medium",
  "why": "At $600K you've outgrown...",
  "conversation": [...messages],
  "session_id": "abc123"
}
→ Returns: { "lead_id": "uuid" }
```

**Step 2 — Attach contact info (after form submit):**
```json
PATCH /api/leads/:id
{
  "name": "Sarah",
  "email": "sarah@storename.com",
  "phone": "555-0100"
}
```

This way even leads who don't fill in the form are saved (useful analytics).

---

## Handling Unqualified Leads

Unqualified does **not** mean worthless. They still get saved and shown a different experience.

### Save them anyway
- `qualified: false` in the database
- Set `disqualify_reason` for analytics ("Not a retailer", "Revenue too high", etc.)
- No contact capture form shown — but an optional soft opt-in can be shown

### Show a nurture CTA instead of booking
Rather than "Book a Strategy Call", show one of:

| Scenario | CTA to show |
|---|---|
| Not a retailer | "This program isn't for you, but here's a free resource on [topic]" |
| Too early (just starting) | "We'd love to connect when you're ready — join our free newsletter" |
| Already in a program | "Stay in touch — we'll be here when you're ready to level up" |
| Revenue too high | "You may be beyond our programs — here's who we'd recommend" |

### Email nurture (future)
Tag unqualified leads in the CRM with `nurture` status and enroll them in a low-frequency email sequence. If they re-engage, run them through the qualifier again.

---

## Full Lead Lifecycle

```
User chats with Maven
        ↓
AI gathers 3 signals
        ↓
AI outputs recommendation JSON
        ↓
Frontend parses JSON
        ↓
POST /api/leads (save qualification + conversation)
        ↓
   ┌────────────────────────────────────┐
   │ qualified = true                   │  qualified = false
   │                                    │
   ↓                                    ↓
Show contact form               Show nurture CTA
(name + email)                  (resource / newsletter)
   ↓
User submits form
   ↓
PATCH /api/leads/:id (attach contact)
   ↓
Notify team (email / Slack webhook)
   ↓
Lead appears in Supabase dashboard
   ↓
Team books call / pushes to CRM
```

---

## Priority Routing (for the team)

Once a lead is saved, sort the dashboard by this priority matrix:

| urgency | ready | Priority |
|---|---|---|
| High | High | 🔴 Call same day |
| High | Medium | 🟠 Call within 24h |
| Medium | High | 🟠 Call within 24h |
| Medium | Medium | 🟡 Call within 48h |
| Low | any | 🟢 Email sequence |

---

## Open Questions (to resolve with client)

- [ ] What booking tool are they using? (Calendly, HubSpot, etc.) — affects pre-fill approach
- [ ] Is there a CRM to push leads into? (HubSpot, Go High Level, Airtable, etc.)
- [ ] Should disqualified leads get an email opt-in form or just a static message?
- [ ] What counts as a "retail store"? Are e-commerce-only owners in scope?
- [ ] Is there a 4th program or upsell path for stores already over $1M?
- [ ] Should the conversation transcript be emailed to the lead after they submit?
- [ ] Does the team want a Slack/email notification for every new High/High lead?

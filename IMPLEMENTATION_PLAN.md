# Daily Pulse: Full Vision Implementation Plan

> "A Life OS that makes you feel like you have a personal chief of staff"

---

## The Vision (What We're Building)

Not a dashboard. A **morning ritual** that knows you, anticipates your needs, and helps you live intentionally.

### Core Experiences

1. **Morning Ritual** - Full-screen guided start to your day (not a wall of widgets)
2. **Predictive Intelligence** - Warns you before things collide or slip
3. **Relationship Intelligence** - Knows who matters, when you're drifting
4. **Financial Awareness** - Spending tied to your actual life patterns
5. **Health as First-Class Citizen** - Sleep, stress, burnout detection
6. **Natural Language Everything** - Talk to it, don't click around
7. **Weekly Reset Ritual** - Guided 15-minute reflection

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        DAILY PULSE                               │
├─────────────────────────────────────────────────────────────────┤
│  PRESENTATION LAYER                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│  │ Morning      │ │ Dashboard    │ │ Weekly       │             │
│  │ Ritual       │ │ (Quick View) │ │ Reset        │             │
│  └──────────────┘ └──────────────┘ └──────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│  INTELLIGENCE LAYER                                              │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│  │ Temporal     │ │ Relationship │ │ Pattern      │             │
│  │ Bucketing    │ │ Scoring      │ │ Detection    │             │
│  └──────────────┘ └──────────────┘ └──────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│  DATA LAYER (Local-First, Encrypted)                            │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐             │
│  │ IndexedDB    │ │ Secure       │ │ Sync         │             │
│  │ (Encrypted)  │ │ Token Store  │ │ Engine       │             │
│  └──────────────┘ └──────────────┘ └──────────────┘             │
├─────────────────────────────────────────────────────────────────┤
│  INTEGRATION LAYER                                               │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐        │
│  │ Google │ │ Plaid  │ │ Health │ │ Weather│ │ OpenAI │        │
│  │Calendar│ │Banking │ │  Kit   │ │  API   │ │  API   │        │
│  │ Gmail  │ │        │ │        │ │        │ │        │        │
│  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘        │
└─────────────────────────────────────────────────────────────────┘
```

---

## Phase 1: Foundation & Setup Experience (Week 1)
**Goal: Make it dead simple to start using**

### 1.1 Onboarding Flow
Create a guided, progressive setup that doesn't overwhelm.

```
/onboarding
  ├── /welcome          → "Meet your Life OS" (30 sec)
  ├── /quick-start      → Pick ONE thing to connect first
  ├── /[provider]       → OAuth flow for selected provider
  └── /success          → Celebrate + suggest next connection
```

**Key Files to Create:**
- `src/app/onboarding/page.tsx` - Welcome screen
- `src/app/onboarding/quick-start/page.tsx` - Service picker
- `src/app/onboarding/success/page.tsx` - Success + suggestions
- `src/components/onboarding/ServiceCard.tsx` - Beautiful service cards
- `src/components/onboarding/ProgressIndicator.tsx` - Setup progress

**Design Principles:**
- Show mock data immediately (works without any setup)
- One service at a time (not a checklist of 10 things)
- Contextual prompts ("Want to see your real calendar?")
- Celebrate each connection

### 1.2 Provider Manager Architecture
Unified system for all OAuth providers.

**Key Files to Create:**
- `src/lib/auth/provider-manager.ts` - Central OAuth orchestration
- `src/lib/auth/providers/google.ts` - Google-specific config
- `src/lib/auth/providers/plaid.ts` - Plaid-specific config
- `src/lib/auth/token-store.ts` - Secure token storage (HTTP-only cookies)
- `src/app/api/auth/[provider]/route.ts` - Dynamic auth routes
- `src/app/api/auth/[provider]/callback/route.ts` - Callback handling

**Security Requirements:**
- PKCE for all OAuth flows
- Refresh token rotation
- HTTP-only cookies (not localStorage)
- Automatic token refresh before expiry

### 1.3 Settings Page Redesign
Transform from "API key dump" to beautiful integration hub.

**Key Files to Modify:**
- `src/app/settings/page.tsx` - Complete redesign

**New Design:**
```
┌─────────────────────────────────────────┐
│  Connected Services                      │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━ 40% complete │
├─────────────────────────────────────────┤
│  ✓ Google Calendar    [Connected]       │
│  ✓ Gmail              [Connected]       │
│  ○ Banking (Plaid)    [Connect →]       │
│  ○ Health             [Connect →]       │
│  ○ Contacts           [Connect →]       │
└─────────────────────────────────────────┘
```

---

## Phase 2: Morning Ritual Experience (Week 2)
**Goal: Transform dashboard into guided morning experience**

### 2.1 Full-Screen Morning Mode
Not widgets. A conversation.

**Key Files to Create:**
- `src/app/morning/page.tsx` - Morning ritual entry
- `src/components/morning/MorningGreeting.tsx` - Personalized greeting
- `src/components/morning/TodayOverview.tsx` - Visual day preview
- `src/components/morning/OneThingFocus.tsx` - The ONE thing that matters
- `src/components/morning/QuickActions.tsx` - Swipe-to-complete items
- `src/components/morning/MorningTransition.tsx` - Animated transitions

**Flow:**
```
1. Greeting (based on time, weather, sleep quality)
   "Good morning, Aaron. You slept 7h 23m. ☀️ 72°F today."

2. Your Day at a Glance (visual timeline)
   [Visual blocks showing meetings, focus time, breaks]

3. The ONE Thing
   "If you do nothing else today, reply to Sarah. She's been waiting 3 days."

4. Quick Wins (swipeable cards)
   [3-4 things you can knock out in <5 min]

5. Ready to Go
   "You're set. Your first meeting is in 47 minutes."
   [Transition to dashboard view]
```

### 2.2 Temporal Intelligence Engine
Smart bucketing based on urgency, not just time.

**Key Files to Modify:**
- `src/lib/temporal-buckets.ts` - Enhanced urgency scoring

**New Scoring Factors:**
- Days waiting (people, emails, tasks)
- Relationship importance (VIP vs casual)
- Pattern detection (you usually respond to X quickly)
- Collision detection (double-booked, no travel time)
- Energy matching (hard tasks when you have energy)

---

## Phase 3: Relationship Intelligence (Week 3)
**Goal: Never let important relationships drift**

### 3.1 People Tracking System

**Key Files to Create:**
- `src/lib/relationships/relationship-engine.ts` - Core logic
- `src/lib/relationships/communication-tracker.ts` - Track last contact
- `src/components/relationships/PersonCard.tsx` - Rich person display
- `src/components/relationships/RelationshipHealth.tsx` - Visual health score

**Data Model:**
```typescript
interface Person {
  id: string;
  name: string;
  relationship: 'family' | 'close_friend' | 'friend' | 'colleague' | 'acquaintance';
  importance: 1 | 2 | 3 | 4 | 5; // 5 = most important

  // Communication patterns
  lastContact: Date;
  preferredChannel: 'text' | 'call' | 'email' | 'in_person';
  typicalResponseTime: number; // hours

  // Life context
  birthday?: Date;
  location?: string;
  currentContext?: string; // "Going through divorce", "New baby", etc.

  // Thresholds
  maxDaysWithoutContact: number; // When to nudge you
}
```

**Intelligence Features:**
- "You haven't talked to Mom in 12 days" (based on YOUR patterns)
- "Dad's birthday is in 3 days"
- "Sarah mentioned she's stressed about work - maybe check in?"
- Relationship health score over time

### 3.2 Communication Aggregation

**Key Files to Create:**
- `src/lib/relationships/communication-aggregator.ts` - Unify all channels
- `src/app/api/communications/route.ts` - API endpoint

**Sources to Aggregate:**
- Gmail (email threads)
- Calendar (meetings with person)
- Future: iMessage, WhatsApp, Slack

---

## Phase 4: Financial Intelligence (Week 4)
**Goal: Money awareness without the stress**

### 4.1 Plaid Integration

**Key Files to Create:**
- `src/lib/integrations/plaid/client.ts` - Plaid API wrapper
- `src/lib/integrations/plaid/sync.ts` - Transaction sync
- `src/app/api/finance/accounts/route.ts` - Account balances
- `src/app/api/finance/transactions/route.ts` - Recent transactions
- `src/components/finance/AccountOverview.tsx` - Balance cards
- `src/components/finance/SpendingInsights.tsx` - Pattern detection

**Key Insights to Surface:**
- "You've spent $847 on food this month (up 23% from usual)"
- "Rent is due in 3 days - you have enough in checking"
- "That Adobe subscription you forgot about just charged $54"
- "You're on track for your savings goal"

### 4.2 Bill Tracking & Predictions

**Key Files to Create:**
- `src/lib/finance/bill-tracker.ts` - Bill detection from transactions
- `src/lib/finance/predictions.ts` - Cash flow predictions

**Features:**
- Auto-detect recurring charges from transaction history
- Predict upcoming bills
- Warn when checking is low before big charges
- Track subscription creep

---

## Phase 5: Health Integration (Week 5)
**Goal: Health as a first-class life signal**

### 5.1 Health Data Architecture

**Key Files to Create:**
- `src/lib/health/health-engine.ts` - Health data processing
- `src/lib/health/burnout-detector.ts` - Pattern-based burnout detection
- `src/app/api/health/route.ts` - Health data endpoint
- `src/components/health/HealthOverview.tsx` - Visual health display
- `src/components/health/SleepInsights.tsx` - Sleep patterns
- `src/components/health/EnergyPredictor.tsx` - When you'll have energy

**Data Sources (Phase 1 - Manual Entry):**
```typescript
interface DailyHealthLog {
  date: string;
  sleep: {
    hours: number;
    quality: 1 | 2 | 3 | 4 | 5;
    wakeTime: string;
  };
  energy: 1 | 2 | 3 | 4 | 5; // Self-reported
  exercise: boolean;
  mood: 1 | 2 | 3 | 4 | 5;
}
```

**Data Sources (Phase 2 - Automatic via companion app):**
- Apple HealthKit (requires iOS app)
- Google Fit (Android)
- Oura, Whoop, Fitbit APIs

### 5.2 Burnout Detection

**Key Files to Create:**
- `src/lib/health/patterns.ts` - Pattern detection algorithms

**Signals to Monitor:**
- Sleep declining over time
- More late-night calendar events
- Response times increasing
- Fewer "fun" calendar events
- Spending patterns changing (comfort eating, retail therapy)

**Interventions:**
- "Your sleep has dropped 1.5 hours this week. Tonight matters."
- "You've had meetings until 7pm every day. Blocking tomorrow afternoon."
- "You haven't seen friends in 2 weeks. Want me to suggest plans?"

---

## Phase 6: Predictive Intelligence (Week 6)
**Goal: Problems solved before you notice them**

### 6.1 Collision Detection

**Key Files to Create:**
- `src/lib/predictions/collision-detector.ts` - Find conflicts
- `src/lib/predictions/travel-time.ts` - Travel time calculations
- `src/components/predictions/CollisionWarning.tsx` - Alert display

**Types of Collisions:**
- Double-booked meetings
- Back-to-back meetings (no buffer)
- Meeting across town with no travel time
- Deep work scheduled but full of meetings
- Personal event conflicting with deadline

### 6.2 Pattern-Based Predictions

**Key Files to Create:**
- `src/lib/predictions/patterns.ts` - Historical pattern analysis
- `src/lib/predictions/suggestions.ts` - Proactive suggestions

**Predictions:**
- "You usually crash on Fridays. Light schedule planned."
- "You respond to [Boss] within 1 hour. Email from them waiting."
- "Last 3 Mondays you skipped workout. Pre-commit now?"

---

## Phase 7: Natural Language Interface (Week 7)
**Goal: Talk to it, don't click around**

### 7.1 Conversational Input

**Key Files to Create:**
- `src/components/chat/CommandBar.tsx` - Always-visible input
- `src/lib/nlp/intent-parser.ts` - Parse natural language
- `src/lib/nlp/action-executor.ts` - Execute parsed intents
- `src/app/api/chat/route.ts` - OpenAI integration

**Example Interactions:**
```
"Remind me to call Mom tomorrow"
→ Creates reminder, adds to tomorrow's RIGHT NOW section

"How's my week looking?"
→ Shows visual week overview with busyness score

"When did I last talk to Sarah?"
→ Shows last communication + suggests action

"Cancel my afternoon"
→ Drafts cancellation emails, reschedules meetings

"I'm exhausted today"
→ Adjusts expectations, suggests lighter schedule
```

### 7.2 Quick Actions via Voice/Text

**Key Files to Create:**
- `src/lib/actions/quick-actions.ts` - Action library
- `src/components/chat/ActionConfirmation.tsx` - Confirm before acting

---

## Phase 8: Weekly Reset Ritual (Week 8)
**Goal: 15-minute guided reflection**

### 8.1 Weekly Review Flow

**Key Files to Create:**
- `src/app/weekly/page.tsx` - Weekly reset entry
- `src/components/weekly/WeekInReview.tsx` - What happened
- `src/components/weekly/WinsAndLearnings.tsx` - Celebrate + learn
- `src/components/weekly/NextWeekPlanning.tsx` - Intention setting
- `src/components/weekly/RelationshipCheck.tsx` - Who to prioritize

**Flow:**
```
1. Week in Review (auto-generated)
   - Meetings attended, tasks completed
   - People you connected with
   - Health trends, spending summary

2. Wins & Learnings
   - What went well? (prompt reflection)
   - What would you do differently?

3. Relationship Check
   - Who's been waiting too long?
   - Any birthdays/events coming up?

4. Next Week Intentions
   - What's the ONE thing for next week?
   - Any blocks to protect?
   - Energy prediction for the week

5. Ready
   - Summary saved
   - Intentions set
   - Good to go
```

---

## Data Model (Complete)

### Core Types

```typescript
// src/lib/types/index.ts

// === PEOPLE ===
interface Person {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  photo?: string;
  relationship: RelationshipType;
  importance: 1 | 2 | 3 | 4 | 5;
  lastContact: Date;
  preferredChannel: CommunicationChannel;
  notes?: string;
  birthday?: Date;
  currentContext?: string;
  maxDaysWithoutContact: number;
}

type RelationshipType = 'family' | 'partner' | 'close_friend' | 'friend' | 'colleague' | 'acquaintance';
type CommunicationChannel = 'text' | 'call' | 'email' | 'in_person' | 'slack';

// === TEMPORAL ITEMS ===
interface TemporalItem {
  id: string;
  type: ItemType;
  title: string;
  subtitle?: string;
  urgencyScore: number;
  bucket: 'right_now' | 'today' | 'this_week' | 'later';
  dueDate?: Date;
  person?: Person;
  actions: Action[];
  metadata: Record<string, unknown>;
}

type ItemType =
  | 'meeting'
  | 'email'
  | 'task'
  | 'person_waiting'
  | 'bill'
  | 'habit'
  | 'health_alert'
  | 'relationship_nudge'
  | 'collision_warning'
  | 'life_admin';

// === HEALTH ===
interface HealthSnapshot {
  date: string;
  sleep: { hours: number; quality: number; };
  energy: number;
  steps?: number;
  exercise?: boolean;
  mood?: number;
  heartRate?: { resting: number; };
}

interface BurnoutSignals {
  sleepTrend: 'declining' | 'stable' | 'improving';
  meetingLoad: 'heavy' | 'normal' | 'light';
  responseTimesTrend: 'increasing' | 'stable' | 'decreasing';
  socialActivityTrend: 'declining' | 'stable' | 'improving';
  overallRisk: 'low' | 'medium' | 'high';
}

// === FINANCE ===
interface FinanceSnapshot {
  accounts: Account[];
  recentTransactions: Transaction[];
  upcomingBills: Bill[];
  monthlySpending: SpendingCategory[];
  insights: FinanceInsight[];
}

interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  institution: string;
}

interface Bill {
  id: string;
  name: string;
  amount: number;
  dueDate: Date;
  recurring: boolean;
  autopay: boolean;
  status: 'upcoming' | 'due_soon' | 'overdue' | 'paid';
}

// === NUDGES & INSIGHTS ===
interface Nudge {
  id: string;
  type: 'warning' | 'celebration' | 'reminder' | 'suggestion' | 'insight';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  category: 'health' | 'relationships' | 'finance' | 'productivity' | 'life_admin';
  action?: { label: string; handler: string; };
  expiresAt?: Date;
}

// === PULSE SCORE ===
interface PulseScore {
  overall: number; // 0-100
  breakdown: {
    responsiveness: ScoreComponent;
    commitments: ScoreComponent;
    relationships: ScoreComponent;
    health: ScoreComponent;
    lifeAdmin: ScoreComponent;
  };
  trend: 'improving' | 'stable' | 'declining';
  insights: string[];
}

interface ScoreComponent {
  score: number;
  label: string;
  trend: 'up' | 'down' | 'stable';
  details?: string;
}
```

---

## File Structure (Complete)

```
src/
├── app/
│   ├── page.tsx                    # Main dashboard
│   ├── morning/
│   │   └── page.tsx               # Morning ritual
│   ├── weekly/
│   │   └── page.tsx               # Weekly reset
│   ├── onboarding/
│   │   ├── page.tsx               # Welcome
│   │   ├── quick-start/page.tsx   # Service selection
│   │   └── success/page.tsx       # Connection success
│   ├── settings/
│   │   └── page.tsx               # Integration hub
│   └── api/
│       ├── auth/
│       │   └── [provider]/
│       │       ├── route.ts       # Initiate OAuth
│       │       └── callback/route.ts
│       ├── calendar/route.ts
│       ├── email/route.ts
│       ├── finance/
│       │   ├── accounts/route.ts
│       │   └── transactions/route.ts
│       ├── health/route.ts
│       ├── communications/route.ts
│       ├── chat/route.ts          # NL interface
│       └── briefing/route.ts
│
├── components/
│   ├── morning/
│   │   ├── MorningGreeting.tsx
│   │   ├── TodayOverview.tsx
│   │   ├── OneThingFocus.tsx
│   │   └── QuickActions.tsx
│   ├── weekly/
│   │   ├── WeekInReview.tsx
│   │   ├── WinsAndLearnings.tsx
│   │   └── NextWeekPlanning.tsx
│   ├── temporal/
│   │   ├── TemporalSection.tsx
│   │   ├── UnifiedItem.tsx
│   │   └── Timeline.tsx
│   ├── relationships/
│   │   ├── PersonCard.tsx
│   │   └── RelationshipHealth.tsx
│   ├── finance/
│   │   ├── AccountOverview.tsx
│   │   └── SpendingInsights.tsx
│   ├── health/
│   │   ├── HealthOverview.tsx
│   │   ├── SleepInsights.tsx
│   │   └── EnergyPredictor.tsx
│   ├── nudges/
│   │   └── NudgeCards.tsx
│   ├── pulse/
│   │   ├── PulseScore.tsx
│   │   └── PulseBreakdown.tsx
│   ├── chat/
│   │   ├── CommandBar.tsx
│   │   └── ActionConfirmation.tsx
│   └── onboarding/
│       ├── ServiceCard.tsx
│       └── ProgressIndicator.tsx
│
├── lib/
│   ├── auth/
│   │   ├── provider-manager.ts
│   │   ├── token-store.ts
│   │   └── providers/
│   │       ├── google.ts
│   │       └── plaid.ts
│   ├── integrations/
│   │   ├── google/
│   │   │   ├── calendar.ts
│   │   │   └── gmail.ts
│   │   ├── plaid/
│   │   │   ├── client.ts
│   │   │   └── sync.ts
│   │   └── openai/
│   │       └── client.ts
│   ├── relationships/
│   │   ├── relationship-engine.ts
│   │   └── communication-tracker.ts
│   ├── health/
│   │   ├── health-engine.ts
│   │   ├── burnout-detector.ts
│   │   └── patterns.ts
│   ├── finance/
│   │   ├── bill-tracker.ts
│   │   └── predictions.ts
│   ├── predictions/
│   │   ├── collision-detector.ts
│   │   ├── patterns.ts
│   │   └── suggestions.ts
│   ├── nlp/
│   │   ├── intent-parser.ts
│   │   └── action-executor.ts
│   ├── temporal-buckets.ts
│   ├── ai-briefing.ts
│   ├── mock-data.ts
│   └── types/
│       └── index.ts
│
└── styles/
    └── globals.css
```

---

## Setup & Configuration

### Environment Variables

```bash
# .env.local

# === GOOGLE ===
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback

# === PLAID ===
PLAID_CLIENT_ID=
PLAID_SECRET=
PLAID_ENV=sandbox  # sandbox | development | production

# === OPENAI ===
OPENAI_API_KEY=

# === WEATHER ===
OPENWEATHER_API_KEY=

# === ENCRYPTION ===
ENCRYPTION_KEY=  # 32-byte key for AES-256

# === APP ===
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### First-Time Setup (User Experience)

```
1. Clone repo, npm install
2. npm run dev
3. App opens with mock data (works immediately!)
4. User clicks "Connect your real data"
5. Guided flow: Pick ONE service to start
6. OAuth flow, return to app
7. Real data appears, magic moment ✨
8. Contextual prompts suggest next connections
```

---

## Implementation Order (Optimized for Value)

### Week 1: Foundation
- [ ] Onboarding flow (welcome → quick-start → success)
- [ ] Provider manager architecture
- [ ] Settings page redesign
- [ ] Token storage with HTTP-only cookies

### Week 2: Morning Ritual
- [ ] Morning ritual full-screen experience
- [ ] Enhanced temporal bucketing
- [ ] One Thing focus component
- [ ] Smooth transitions

### Week 3: Relationship Intelligence
- [ ] People data model
- [ ] Communication aggregation
- [ ] Relationship health scoring
- [ ] "Who needs attention" nudges

### Week 4: Financial Integration
- [ ] Plaid integration
- [ ] Account overview
- [ ] Bill tracking
- [ ] Spending insights

### Week 5: Health Integration
- [ ] Health data model (manual first)
- [ ] Sleep/energy tracking
- [ ] Burnout detection
- [ ] Health nudges

### Week 6: Predictions
- [ ] Collision detection
- [ ] Pattern recognition
- [ ] Proactive suggestions
- [ ] Smart scheduling

### Week 7: Natural Language
- [ ] Command bar
- [ ] Intent parsing
- [ ] Action execution
- [ ] Conversational interface

### Week 8: Weekly Reset
- [ ] Week in review auto-generation
- [ ] Reflection prompts
- [ ] Intention setting
- [ ] Summary persistence

---

## Design System (L7/L8 Standards)

### Color Palette

```css
/* Semantic colors for life domains */
--color-health: #10B981;      /* Green - vitality */
--color-relationships: #F472B6; /* Pink - warmth */
--color-finance: #3B82F6;     /* Blue - trust */
--color-productivity: #8B5CF6; /* Purple - focus */
--color-warning: #F59E0B;     /* Amber - attention */
--color-urgent: #EF4444;      /* Red - action needed */
--color-celebration: #10B981; /* Green - wins */
```

### Typography

```css
/* Hierarchy */
.greeting { font-size: 2rem; font-weight: 300; }
.section-title { font-size: 0.75rem; font-weight: 600; letter-spacing: 0.1em; }
.item-title { font-size: 1rem; font-weight: 500; }
.meta { font-size: 0.875rem; color: var(--color-muted); }
```

### Motion

```css
/* Smooth, intentional animations */
.transition-smooth { transition: all 0.2s ease-out; }
.transition-entrance { animation: fadeSlideUp 0.3s ease-out; }

@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Spacing

```css
/* Consistent rhythm */
--space-xs: 0.25rem;
--space-sm: 0.5rem;
--space-md: 1rem;
--space-lg: 1.5rem;
--space-xl: 2rem;
--space-2xl: 3rem;
```

---

## Success Metrics

### User Experience
- Time to first value: < 60 seconds (mock data works immediately)
- Time to first real data: < 3 minutes
- Morning ritual completion rate: > 80%
- Weekly reset completion rate: > 60%

### Technical
- Page load: < 1 second
- API response time: < 500ms
- Offline capability: Core features work offline
- Data freshness: < 5 minute lag on connected services

### Life Impact (The Real Metrics)
- Fewer "I forgot" moments
- Faster response to important people
- Better awareness of health trends
- Reduced financial surprises
- More intentional weeks

---

## Quality Assurance Framework

> Reliability is a design principle. A beautiful morning ritual that shows wrong data isn't L7.

### 1. Universal Definition of Done

Every feature must pass these criteria before it's considered complete:

#### Code Quality
- [ ] TypeScript strict mode passes with zero errors
- [ ] No `any` types (explicit typing throughout)
- [ ] Error boundaries wrap all async operations
- [ ] Loading states exist for all data fetches
- [ ] Empty states designed and implemented
- [ ] Console has zero warnings in dev mode

#### User Experience
- [ ] Works with mock data (zero config required)
- [ ] Works with real data (integration tested)
- [ ] Graceful degradation when service unavailable
- [ ] Mobile responsive (tested at 375px, 768px, 1024px)
- [ ] Keyboard navigable
- [ ] No layout shift on load (CLS < 0.1)

#### Reliability
- [ ] Happy path tested manually
- [ ] Primary error path tested manually
- [ ] Edge cases documented and handled
- [ ] Offline behavior defined and working

#### Documentation
- [ ] Component has JSDoc with example usage
- [ ] Non-obvious logic has inline comments explaining WHY
- [ ] API endpoints have request/response examples

---

### 2. Phase-Specific Acceptance Criteria

#### Phase 1: Foundation & Setup

**1.1 Onboarding Flow**
```
ACCEPTANCE CRITERIA:
✓ New user sees welcome screen within 1s of first visit
✓ Mock data dashboard loads if user skips setup
✓ "Connect" button initiates correct OAuth flow
✓ OAuth errors display user-friendly message
✓ Success screen shows connected service with last sync time
✓ User can disconnect and reconnect without data loss

VERIFY BY:
1. Clear localStorage, visit app → Should see onboarding
2. Click "Skip for now" → Dashboard with mock data appears
3. Click "Connect Google" → OAuth popup, correct scopes
4. Complete OAuth → Return to app, see "Connected" status
5. Revoke access in Google, refresh → Graceful "Reconnect" prompt

EDGE CASES:
- User closes OAuth popup mid-flow → "Connection cancelled"
- OAuth token expired during setup → Auto-refresh or re-prompt
- Network fails during callback → Retry mechanism
```

**1.2 Provider Manager**
```
ACCEPTANCE CRITERIA:
✓ Token refresh happens automatically before expiry
✓ Refresh failure triggers re-auth prompt (not silent failure)
✓ All tokens stored in HTTP-only cookies
✓ No tokens visible in localStorage or sessionStorage
✓ PKCE flow used for all providers

VERIFY BY:
1. Connect provider, wait for expiry → Verify auto-refresh
2. Manually expire token, make API call → Should refresh
3. DevTools > Application > Cookies → Verify httpOnly flag
4. Search codebase for localStorage + token → Zero results
```

#### Phase 2: Morning Ritual

```
ACCEPTANCE CRITERIA:
✓ Greeting reflects actual time of day
✓ Weather data uses user's location (or graceful fallback)
✓ Day timeline accurately reflects calendar events
✓ "One Thing" selection logic is explainable
✓ Transition to dashboard is smooth (<300ms)

EDGE CASES:
- No calendar events → "Clear day" messaging (not empty)
- 20+ urgent items → Still surfaces ONE thing
- User opens at 11:59pm → Handles day boundary
```

#### Phase 4: Finance (Critical)

```
ACCEPTANCE CRITERIA:
✓ Account balances accurate to the penny
✓ Transaction categorization >85% accurate
✓ Recurring bills detected within 2 billing cycles
✓ Cash flow prediction within 10% of actual
✓ No PII in logs (grep for SSN, account numbers)

SECURITY VERIFICATION:
✓ Plaid tokens encrypted at rest
✓ No raw account numbers stored (only masked)
✓ Audit log for all financial data access
```

#### Phase 5: Health

```
ACCEPTANCE CRITERIA:
✓ Sleep trend calculated over 7-day rolling window
✓ False positive rate <10% (doesn't cry wolf)
✓ Intervention suggestions are actionable
✓ User can dismiss without repeated nagging

VERIFY BY:
1. Enter declining sleep for 7 days → Warning appears day 7
2. Review last 10 warnings → 9+ were legitimate
3. Dismiss warning → Doesn't reappear for configured period
```

---

### 3. Verification Systems

#### Integration Verification Script

```typescript
// src/lib/verification/integration-check.ts

export const integrationChecks = [
  {
    name: 'Google Calendar - Read Events',
    verify: async () => {
      const events = await fetchCalendarEvents({ maxResults: 1 });
      return { passed: Array.isArray(events) };
    },
    critical: true,
  },
  {
    name: 'Google Calendar - Token Refresh',
    verify: async () => {
      const result = await refreshGoogleToken();
      return { passed: result.success };
    },
    critical: true,
  },
  {
    name: 'Plaid - Account Balances',
    verify: async () => {
      const accounts = await fetchPlaidAccounts();
      return { passed: accounts.every(a => typeof a.balance === 'number') };
    },
    critical: true,
  },
  {
    name: 'OpenAI - Completion',
    verify: async () => {
      const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: 'Say OK' }],
        max_tokens: 5,
      });
      return { passed: response.choices[0]?.message?.content?.includes('OK') };
    },
    critical: false, // AI features degrade gracefully
  },
];
```

#### Anomaly Detection

```typescript
// src/lib/verification/anomaly-detection.ts

export const anomalyDetectors = [
  {
    // Detect urgency score clustering (algorithm bug)
    check: () => {
      const scores = getRecentUrgencyScores(100);
      const uniqueScores = new Set(scores).size;
      return {
        anomaly: uniqueScores / scores.length < 0.3,
        recommendation: 'Check urgency calculation - scores may be collapsing',
      };
    },
    severity: 'warning',
  },
  {
    // Detect silent token refresh failures
    check: () => {
      const attempts = getRecentTokenRefreshes(24);
      const failures = attempts.filter(r => !r.success);
      return {
        anomaly: failures.length / attempts.length > 0.1,
        recommendation: 'Check OAuth config - high refresh failure rate',
      };
    },
    severity: 'error',
  },
  {
    // Detect stale data
    check: () => {
      const lastSyncs = {
        calendar: getLastSyncTime('calendar'),
        email: getLastSyncTime('email'),
        finance: getLastSyncTime('finance'),
      };
      const staleThreshold = 60 * 60 * 1000; // 1 hour
      const staleServices = Object.entries(lastSyncs)
        .filter(([_, time]) => Date.now() - time > staleThreshold);
      return {
        anomaly: staleServices.length > 0,
        recommendation: `Force sync: ${staleServices.map(s => s[0]).join(', ')}`,
      };
    },
    severity: 'warning',
  },
];
```

#### Regression Detection

```typescript
// src/lib/verification/regression-detector.ts

export const regressionChecks = [
  {
    name: 'Page Load Time',
    baseline: () => getStoredMetric('page_load_p95'),
    current: () => measurePageLoad(),
    threshold: 20, // 20% slower triggers alert
  },
  {
    name: 'Morning Ritual Completion Rate',
    baseline: () => getStoredMetric('morning_completion_rate'),
    current: () => getMorningCompletionRate(7),
    threshold: 15,
  },
];
```

---

### 4. Quality Gate Commands

```json
// package.json scripts
{
  "verify:pre-commit": "npm run lint && npm run typecheck && npm run test:unit",
  "verify:integration": "ts-node src/lib/verification/integration-check.ts",
  "verify:anomalies": "ts-node src/lib/verification/anomaly-detection.ts",
  "verify:regressions": "ts-node src/lib/verification/regression-detector.ts",
  "verify:all": "npm run verify:pre-commit && npm run verify:integration",
  "selftest": "ts-node src/lib/verification/daily-selftest.ts"
}
```

---

### 5. Verification Matrix Template

Track completion per phase:

| Feature | Unit | Integration | Manual | Edge Cases | DoD |
|---------|------|-------------|--------|------------|-----|
| Onboarding Welcome | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| OAuth Flow | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Token Refresh | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| Morning Greeting | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |
| One Thing Focus | ⏳ | ⏳ | ⏳ | ⏳ | ⏳ |

Legend: ✅ Complete | ⏳ Pending | ❌ Not started | 🔴 Blocked

---

### 6. Verification Schedule

| When | What |
|------|------|
| Every commit | lint, typecheck, unit tests |
| Every PR | integration checks, regression checks |
| Daily 6am | selftest, anomaly detection, data freshness |
| Weekly Sunday | full integration suite, baseline updates |

---

## Ready to Build

This plan is designed to:
1. **Deliver value immediately** - Mock data means it works on first load
2. **Progressive enhancement** - Each phase adds capability
3. **Privacy-first** - Local storage, encrypted, user-controlled
4. **Maintainable** - Clean architecture, typed throughout
5. **Delightful** - L7/L8 design standards throughout

Let's make it happen. 🚀

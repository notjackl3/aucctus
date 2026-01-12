# Signal Scanning Feature

> Also known as "Strategic Foresight"

## Overview

Signal Scanning is a market intelligence and opportunity identification system that monitors external data sources to surface actionable insights for the innovation pipeline.

### Core Capabilities

- **Monitor market signals** across news, industry reports, social media, competitor intelligence, and regulatory filings
- **Identify opportunities** synthesized from signals with impact/effort scoring
- **Track industry intelligence** with relevance scoring
- **Visualize trends** via an Innovation Radar mapping signals by category and time horizon
- **Convert signals to concepts** to feed insights into the innovation pipeline
- **Generate strategic summaries** (Gut Checks) with AI-powered recommendations

## Architecture

### Data Flow

```
API Layer → React Query Hooks → Zustand Store → React Components
```

### Key Files

| Layer | File | Purpose |
|-------|------|---------|
| API | `src/libs/api/signalScanning.ts` | API client extending ApiService |
| Types | `src/libs/api/types/signalScanning.d.ts` | TypeScript definitions |
| Hooks | `src/app/hooks/query/signalScanning.hook.ts` | 11 React Query hooks |
| Store | `src/app/stores/signal-scanning/store.ts` | Zustand slice for UI state |
| Page | `src/app/pages/SignalScanning/SignalScanningPage.tsx` | Main page component |
| Radar | `src/app/pages/SignalScanning/components/visualizations/InnovationRadar.tsx` | SVG radar visualization |

## Data Types

### Signal

A market signal detected from external sources.

```typescript
interface ISignal {
  uuid: string
  title: string
  description: string
  theme: SignalTheme      // market_trend, competitor_action, regulatory_change, etc.
  stance: SignalStance    // bullish, bearish, neutral
  status: SignalStatus    // new, exploring, monitoring, ignored, actioned
  impact: SignalImpact    // high, medium, low
  trend: SignalTrend
  confidence: number
  relevanceScore: number
  sources: ISignalSource[]
  sourcesCount: number
  tags: string[]
  detectedAt: string
  linkedConceptUuid?: string
}
```

**Signal Themes** (6):
- `market_trend` - Market movement indicators
- `competitor_action` - Competitor activities
- `regulatory_change` - Regulatory updates
- `technology_shift` - Technology trends
- `customer_insight` - Customer behavior signals
- `economic_indicator` - Economic data points

**Signal Status Flow**:
`new` → `exploring` → `monitoring` / `actioned` / `ignored`

### Opportunity

Synthesized opportunity from one or more signals.

```typescript
interface IOpportunity {
  uuid: string
  title: string
  description: string
  category: OpportunityCategory
  impact: OpportunityImpact
  effort: OpportunityEffort
  priority: OpportunityPriority
  priorityScore: number
  confidence: number
  estimatedValue: number
  linkedSignalUuids: string[]
  status: OpportunityStatus
}
```

**Opportunity Categories** (6):
- `market_entry`
- `product_innovation`
- `process_improvement`
- `strategic_partnership`
- `risk_mitigation`
- `cost_optimization`

### Intelligence

Industry intelligence item aggregated from sources.

```typescript
interface IIntelligenceItem {
  uuid: string
  title: string
  summary: string
  category: IntelligenceCategory  // competitive, regulatory, market, technology, retail
  source: string
  sourceUrl: string
  relevanceScore: number
  publishedAt: string
}
```

## API Endpoints

Base: `/api/v1/signal-scanning/`

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/dashboard` | Complete dashboard data |
| POST | `/refresh` | Trigger background scan |
| GET | `/signals` | List signals (filterable) |
| GET | `/signals/{uuid}` | Signal details |
| PATCH | `/signals/{uuid}/status` | Update signal status |
| POST | `/signals/{uuid}/create-concept` | Create concept from signal |
| POST | `/signals/{uuid}/attach-concept` | Link to existing concept |
| GET | `/opportunities` | List opportunities |
| GET | `/opportunities/{uuid}` | Opportunity details |
| POST | `/opportunities/{uuid}/create-concept` | Create concept from opportunity |
| GET | `/intelligence` | List intelligence items |

## React Query Hooks

All hooks are in `src/app/hooks/query/signalScanning.hook.ts`:

```typescript
// Dashboard
useSignalScanningDashboard()

// Signals
useSignalScanningSignals(filters?)
useSignalScanningSignal(uuid)
useUpdateSignalStatus()
useCreateConceptFromSignal()
useAttachSignalToConcept()

// Opportunities
useSignalScanningOpportunities()
useSignalScanningOpportunity(uuid)
useCreateConceptFromOpportunity()

// Intelligence
useSignalScanningIntelligence()

// Actions
useSignalRefresh()
```

**Caching Strategy**:
- Stale time: 2 minutes
- Cache time: 5 minutes
- Automatic invalidation on mutations

## Zustand Store

The store manages UI state and filter persistence.

```typescript
interface ISignalScanningState {
  filters: {
    themes: SignalTheme[]
    stances: SignalStance[]
    statuses: SignalStatus[]
    impacts: SignalImpact[]
    search: string
    feedItemType: FeedItemType  // all, signal, opportunity, intelligence
    dateRange: { from?: string, to?: string }
  }
  selectedSignalUuids: string[]
  signalsSortBy: 'relevance' | 'date' | 'confidence'
  signalsSortDirection: 'asc' | 'desc'
}
```

Filters persist to **sessionStorage** (reset on browser close).

## Components

### Page Layout

The SignalScanningPage renders:

1. **PageHeader** - Title, refresh button, last updated timestamp
2. **GutCheckCard** - AI strategic summary with key insights and actions
3. **MetricsRow** - 4 key metrics (active signals, weekly new, quick wins, pipeline value)
4. **Innovation Radar** - Trend visualization (3/5 grid width)
5. **PrioritySignals** - High-impact signals with stance chart (2/5 grid width)
6. **UnifiedFeed** - Merged feed with filtering and search

### Innovation Radar

SVG-based polar visualization:

**Categories** (angular position):
- Technology (indigo)
- Operations (amber)
- Sustainability (green)
- Product (pink)
- Market (blue)

**Time Horizons** (radial position):
- Now: 0-6 months (inner ring)
- Next: 6-18 months (middle ring)
- Later: 18+ months (outer ring)

**Impact** shown via dot size: High (10px), Medium (8px), Low (6px)

### Card Components

| Component | Data Type | Key Actions |
|-----------|-----------|-------------|
| SignalCard | ISignal | Create concept, attach to concept, ignore |
| OpportunityCard | IOpportunity | Create concept, view linked signals |
| IntelligenceCard | IIntelligenceItem | Open source link |

## Styling

Uses Aucctus theme classes:

- **Stance colors**: Green (bullish), Red (bearish), Gray (neutral)
- **Impact badges**: Theme-colored with size indicators
- **Responsive grid**: 2-4 columns desktop, 2 tablet, 1 mobile

## Route

```typescript
// src/routes/routes.ts
AppPath.SignalScanning = '/signal-scanning'
```

Protected by `AuthGuard` and `AccessGuard` in private routes.

## Adding New Signal Sources
??
To add a new signal theme:

1. Add to `SignalTheme` type in `src/libs/api/types/signalScanning.d.ts`
2. Add display mapping in SignalScanningPage theme utilities
3. Backend must support the new theme type

## Query Keys

```typescript
// src/app/hooks/query/query-keys.ts
AucctusQueryKeys.signalScanningDashboard
AucctusQueryKeys.signalScanningSignals
AucctusQueryKeys.signalScanningSignal
AucctusQueryKeys.signalScanningOpportunities
AucctusQueryKeys.signalScanningOpportunity
AucctusQueryKeys.signalScanningIntelligence
```

---

# Strategic Foresight V2 - Backend Data Structures

> This section documents the redesigned "Strategic Foresight" feature (V2) which replaces the original Signal Scanning architecture with an executive-focused, insight-driven approach.

## Design Philosophy

The V2 architecture shifts from **raw signal monitoring** to **strategic insight delivery**:

- **Signals → Patterns → Insights** hierarchy (backend aggregates, frontend displays)
- Executive-focused language ("What changed? Why does it matter? What's the impact?")
- Classification-based prioritization (Threat / Opportunity / Watch)
- 4-quadrant radar visualization by signal theme

## Enums & Primitives

All enums the backend must support:

### SignalThemeV2

Maps to radar quadrant positions:

```typescript
type SignalThemeV2 =
  | 'competitor_announcement'  // RIGHT quadrant (90°) - Competitor product launches, partnerships, pivots
  | 'startup_launch'           // LEFT quadrant (270°) - New market entrants, disruptive startups
  | 'investment_activity'      // BOTTOM quadrant (180°) - Funding rounds, M&A, acquisitions
  | 'regulatory_change';       // TOP quadrant (0°) - Regulatory shifts, compliance changes, policy updates
```

### InsightClassification

Strategic classification (determines radar blip color):

```typescript
type InsightClassification = 'threat' | 'opportunity' | 'watch';
```

### TimeHorizon

Executive-friendly time horizons (determines radar radial position):

```typescript
type TimeHorizon =
  | 'immediate'   // 0-6 months (inner ring)
  | 'near_term'   // 6-18 months (middle ring)
  | 'long_term';  // 18+ months (outer ring)
```

### TrendDirection

Pattern analysis direction:

```typescript
type TrendDirection = 'accelerating' | 'stable' | 'decelerating';
```

### ConfidenceLevel

```typescript
type ConfidenceLevel = 'high' | 'medium' | 'low';
```

### ImpactLevel

```typescript
type ImpactLevel = 'high' | 'medium' | 'low';
```

## Core Data Structures

### IBusinessUnit

Business units affected by insights:

```typescript
interface IBusinessUnit {
  uuid: string;
  name: string;
  color?: string;  // Optional hex color for UI visualization
}
```

### IConceptLink

Links insights to Aucctus concepts:

```typescript
interface IConceptLink {
  uuid: string;
  title: string;
  identifier: string;  // Concept identifier (e.g., "CON-001")
  status: 'incubating' | 'testing' | 'validated' | 'archived';
  relationshipType: 'validates' | 'challenges' | 'extends' | 'competes';
}
```

### ISignalSourceV2

Individual source references with attribution context:

```typescript
interface ISignalSourceV2 {
  uuid: string;
  title: string;
  url: string;
  publishedAt?: string;  // ISO 8601 datetime
  sourceType: 'news_article' | 'press_release' | 'crunchbase' | 'linkedin' | 'sec_filing';

  // Source attribution (for UI display)
  association?: string;  // Description of how this source relates to the pattern/insight
  citation?: string;     // Key quote or data point from the source
}
```

**Example Signal Source**:
```json
{
  "uuid": "src-001",
  "title": "Acme Corp Announces $200M AI Initiative",
  "url": "https://techcrunch.com/2025/10/acme-ai-investment",
  "publishedAt": "2025-10-15T08:00:00Z",
  "sourceType": "news_article",
  "association": "Primary announcement of AI investment strategy",
  "citation": "\"We are committed to becoming an AI-first company by 2027\" - CEO John Smith"
}
```

**Source Types**:
| Type | Description | UI Badge |
|------|-------------|----------|
| `news_article` | News publications (TechCrunch, WSJ, Forbes, etc.) | Blue "News" |
| `press_release` | Official company press releases | Green "Press Release" |
| `crunchbase` | Crunchbase funding/M&A data | Orange "Crunchbase" |
| `linkedin` | LinkedIn posts and company updates | Blue "LinkedIn" |
| `sec_filing` | SEC filings and regulatory documents | Purple "SEC Filing" |

### IPattern

Aggregated cluster of related signals with source attribution:

```typescript
interface IPattern {
  uuid: string;
  title: string;
  summary: string;
  theme: SignalThemeV2;

  // Aggregation metadata
  signalCount: number;      // Number of raw signals aggregated
  firstDetected: string;    // ISO 8601 datetime
  lastUpdated: string;      // ISO 8601 datetime

  // Pattern analysis
  trendDirection: TrendDirection;
  confidence: ConfidenceLevel;

  // Key entities
  keyCompanies: string[];     // Company names involved
  relatedKeywords: string[];  // Extracted keywords

  // Source attribution
  sources: ISignalSourceV2[];  // Primary sources supporting this pattern
}
```

**Example Pattern**:
```json
{
  "uuid": "pat-001",
  "title": "Enterprise AI Adoption in Financial Services",
  "summary": "Multiple major banks announcing AI initiatives for customer service and fraud detection.",
  "theme": "competitor_announcement",
  "signalCount": 8,
  "firstDetected": "2024-01-15T00:00:00Z",
  "lastUpdated": "2024-02-01T00:00:00Z",
  "trendDirection": "accelerating",
  "confidence": "high",
  "keyCompanies": ["JPMorgan", "Goldman Sachs", "Bank of America"],
  "relatedKeywords": ["AI", "machine learning", "chatbot", "fraud detection"],
  "sources": [
    {
      "uuid": "src-001",
      "title": "JPMorgan Launches AI Trading Platform",
      "url": "https://wsj.com/jpmorgan-ai-trading",
      "publishedAt": "2024-01-15T08:00:00Z",
      "sourceType": "news_article",
      "association": "First major bank to announce AI trading capabilities",
      "citation": "\"This represents a $50M investment in our trading infrastructure\" - CTO"
    },
    {
      "uuid": "src-002",
      "title": "Goldman Sachs Q4 Earnings Call",
      "url": "https://sec.gov/goldman-q4-2024",
      "publishedAt": "2024-01-20T14:00:00Z",
      "sourceType": "sec_filing",
      "association": "Earnings disclosure revealing AI budget allocation",
      "citation": "AI investments increased 280% YoY to $120M"
    }
  ]
}
```

### IStrategicInsight

**Primary UI entity** - The interpreted meaning of patterns for executives:

```typescript
interface IStrategicInsight {
  uuid: string;

  // Classification
  classification: InsightClassification;
  theme: SignalThemeV2;

  // Core identification
  headline: string;

  // Executive interpretation (THE CORE VALUE)
  whatChanged: string;      // What market shift occurred?
  whyItMatters: string;     // Why should executives care?
  likelyImpact: string;     // What's the business impact?
  timeHorizon: TimeHorizon;
  timeHorizonLabel: string; // Human-readable (e.g., "3-6 months")

  // Confidence & Priority
  confidence: ConfidenceLevel;
  impact: ImpactLevel;
  priorityScore: number;    // 0-100, composite score for sorting

  // Business context
  affectedBusinessUnits: IBusinessUnit[];

  // Pattern linkage (evidence)
  patterns: IPattern[];
  totalSignalCount: number; // Sum of all pattern signal counts

  // Concept linkage
  relatedConcepts: IConceptLink[];

  // Recommended action
  recommendedAction: string;

  // Status tracking
  status: 'active' | 'acknowledged' | 'actioned' | 'dismissed';
  acknowledgedBy?: string;  // User UUID who acknowledged
  acknowledgedAt?: string;  // ISO 8601 datetime

  // Timestamps
  createdAt: string;
  updatedAt: string;
}
```

**Example Strategic Insight**:
```json
{
  "uuid": "ins-001",
  "classification": "threat",
  "theme": "competitor_announcement",
  "headline": "Major competitors entering adjacent market space",
  "whatChanged": "Three of your top five competitors have announced expansion into the SMB segment you've been targeting.",
  "whyItMatters": "This signals increased competition for a market segment you've identified as a growth priority, potentially compressing margins and increasing customer acquisition costs.",
  "likelyImpact": "Market share capture window narrowing. First-mover advantage diminishing. Potential 15-20% increase in CAC.",
  "timeHorizon": "near_term",
  "timeHorizonLabel": "6-12 months",
  "confidence": "high",
  "impact": "high",
  "priorityScore": 85,
  "affectedBusinessUnits": [
    { "uuid": "bu-001", "name": "Enterprise Sales", "color": "#3B82F6" },
    { "uuid": "bu-002", "name": "Product Development", "color": "#8B5CF6" }
  ],
  "patterns": [/* Array of IPattern objects */],
  "totalSignalCount": 12,
  "relatedConcepts": [
    {
      "uuid": "con-001",
      "title": "SMB Self-Service Portal",
      "identifier": "CON-042",
      "status": "testing",
      "relationshipType": "validates"
    }
  ],
  "recommendedAction": "Accelerate SMB portal launch timeline. Consider competitive pricing strategy review.",
  "status": "active",
  "createdAt": "2024-02-01T10:30:00Z",
  "updatedAt": "2024-02-01T10:30:00Z"
}
```

### IRadarBlip

Simplified insight representation for radar visualization:

```typescript
interface IRadarBlip {
  uuid: string;
  label: string;                        // Short label for radar
  classification: InsightClassification; // Determines color
  timeHorizon: TimeHorizon;             // Determines radial position
  angularPosition: number;              // 0-360, derived from theme quadrant
  confidence: ConfidenceLevel;
  impact: ImpactLevel;                  // Determines blip size
  insightUuid: string;                  // Links back to full insight
}
```

**Angular Position Calculation**:
```
regulatory_change: 0° ± 30° (Top quadrant)
competitor_announcement: 90° ± 30° (Right quadrant)
investment_activity: 180° ± 30° (Bottom quadrant)
startup_launch: 270° ± 30° (Left quadrant)
```

### IExecutiveBrief

AI-generated executive summary:

```typescript
interface IExecutiveBrief {
  uuid: string;
  statusLine: string;           // e.g., "3 threats, 2 opportunities requiring attention"
  narrative: string;            // 2-3 sentence AI-generated summary
  priorityInsights: Array<{
    uuid: string;
    headline: string;
    classification: InsightClassification;
    urgency: 'high' | 'medium' | 'low';
  }>;
  threatTrend: 'increasing' | 'stable' | 'decreasing';
  opportunityTrend: 'increasing' | 'stable' | 'decreasing';
  generatedAt: string;          // ISO 8601 datetime
  status: 'generating' | 'complete' | 'failed';
}
```

### IStrategicForesightMetrics

Dashboard summary metrics:

```typescript
interface IStrategicForesightMetrics {
  totalInsights: number;
  threats: number;
  opportunities: number;
  watching: number;
  newThisWeek: number;
  patternsDetected: number;
}
```

### IStrategicForesightDashboard

Complete dashboard response:

```typescript
interface IStrategicForesightDashboard {
  executiveBrief: IExecutiveBrief | null;
  metrics: IStrategicForesightMetrics;
  insights: IStrategicInsight[];
  radarBlips: IRadarBlip[];
  lastRefreshedAt: string;
}
```

## Query & Filter Types

### IInsightQueryOptions

Filtering/pagination for insights list:

```typescript
interface IInsightQueryOptions {
  classification?: InsightClassification[];
  theme?: SignalThemeV2[];
  timeHorizon?: TimeHorizon[];
  confidence?: ConfidenceLevel[];
  businessUnit?: string[];                                        // UUIDs
  status?: ('active' | 'acknowledged' | 'actioned' | 'dismissed')[];
  search?: string;
  sort?: 'priority' | 'created_at' | 'confidence';
  sortDirection?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}
```

### IInsightsResponse

Paginated insights response:

```typescript
interface IInsightsResponse {
  insights: IStrategicInsight[];
  count: number;
  next: string | null;      // URL for next page
  previous: string | null;  // URL for previous page
}
```

## Action Payloads

### IUpdateInsightStatusPayload

Update insight status:

```typescript
interface IUpdateInsightStatusPayload {
  status: 'acknowledged' | 'actioned' | 'dismissed';
  notes?: string;
}
```

### ICreateConceptFromInsightPayload

Create new concept from insight:

```typescript
interface ICreateConceptFromInsightPayload {
  insightUuid: string;
  title?: string;        // Override default title
  description?: string;  // Override default description
}
```

### ILinkInsightToConceptPayload

Link insight to existing concept:

```typescript
interface ILinkInsightToConceptPayload {
  conceptUuid: string;
  relationshipType?: 'validates' | 'challenges' | 'extends' | 'competes';
}
```

## Data Flow Summary

```
┌─────────────────────────────────────────────────────────────────┐
│                        BACKEND LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  External Sources        Signal Processing      Aggregation     │
│  ┌─────────────┐        ┌──────────────┐      ┌────────────┐   │
│  │ News APIs   │───────▶│ Raw Signals  │─────▶│ Patterns   │   │
│  │ Crunchbase  │        │ (internal)   │      │ (grouped)  │   │
│  │ SEC Filings │        └──────────────┘      └─────┬──────┘   │
│  │ LinkedIn    │                                    │          │
│  └─────────────┘                                    ▼          │
│                                              ┌────────────┐    │
│                                              │ Strategic  │    │
│                                              │ Insights   │    │
│                                              │ (AI-gen)   │    │
│                                              └─────┬──────┘    │
│                                                    │           │
└────────────────────────────────────────────────────┼───────────┘
                                                     │
                                                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API RESPONSE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  IStrategicForesightDashboard                                   │
│  ├── executiveBrief: IExecutiveBrief                           │
│  ├── metrics: IStrategicForesightMetrics                       │
│  ├── insights: IStrategicInsight[]                             │
│  │   ├── patterns: IPattern[]                                  │
│  │   │   └── sources: ISignalSourceV2[] (with association/citation) │
│  │   ├── affectedBusinessUnits: IBusinessUnit[]                │
│  │   └── relatedConcepts: IConceptLink[]                       │
│  └── radarBlips: IRadarBlip[]                                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Radar Visualization Mapping

The frontend radar positions blips based on:

| Dimension | Backend Field | Radar Mapping |
|-----------|--------------|---------------|
| **Quadrant** | `theme` | Angular position (0°, 90°, 180°, 270°) |
| **Distance** | `timeHorizon` | Radial position (inner → outer) |
| **Color** | `classification` | Red (threat), Green (opportunity), Yellow (watch) |
| **Size** | `impact` | Large (high), Medium (medium), Small (low) |

## Key Backend Responsibilities

1. **Signal Aggregation**: Group raw signals into thematic patterns
2. **Source Attribution**: Extract and associate sources with patterns, including:
   - Source URL and title
   - Source type classification (news_article, press_release, crunchbase, linkedin, sec_filing)
   - Association description (how the source relates to the pattern)
   - Citation extraction (key quotes or data points from the source)
3. **AI Interpretation**: Generate `whatChanged`, `whyItMatters`, `likelyImpact` for each insight
4. **Classification**: Assign `threat`/`opportunity`/`watch` classification
5. **Priority Scoring**: Calculate composite `priorityScore` (0-100)
6. **Business Unit Mapping**: Associate insights with relevant business units
7. **Concept Linking**: Track relationships between insights and innovation concepts
8. **Executive Brief Generation**: Produce AI summary with trend analysis
9. **Angular Position Calculation**: Derive `angularPosition` from theme with jitter to avoid overlap

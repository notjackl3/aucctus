/**
 * Signal Scanning Mock Data Fixtures
 *
 * BACKEND AGENTS: These fixtures define the expected data structure and relationships
 * for the Signal Scanning feature. Key relationships to maintain:
 *
 * 1. Opportunities reference Signals via `linkedSignalUuids[]`
 * 2. Signals can exist standalone (not linked to any opportunity)
 * 3. Intelligence items are contextual - can be matched to signals by theme/category
 * 4. All items should have realistic timestamps for recency sorting
 *
 * Priority scoring guidance:
 * - Opportunities: priorityScore already provided (0-100)
 * - Signals: Calculate from (impact weight * 40) + (confidence * 0.3) + (recency bonus up to 30)
 * - Intelligence: relevanceScore (0-100)
 */

import type {
  ISignal,
  IOpportunity,
  IIntelligenceItem,
  IGutCheckSummary,
  ISignalMetrics,
  IRadarPoint,
  ISignalScanningDashboard,
} from '../types';

// ============================================
// Mock Signals
// ============================================

export const mockSignals: ISignal[] = [
  {
    uuid: 'sig-001',
    title: 'AI-powered retail analytics adoption accelerating',
    description:
      'Multiple major retailers announcing AI analytics platform deployments. Target, Walmart, and Kroger all expanding computer vision and predictive analytics capabilities in Q4.',
    theme: 'technology_shift',
    stance: 'bullish',
    status: 'new',
    impact: 'high',
    trend: 'accelerating',
    confidence: 87,
    relevanceScore: 92,
    sources: [
      {
        uuid: 'src-001a',
        title: 'Retail Dive: AI Analytics Report',
        url: 'https://retaildive.com/ai-analytics',
      },
      {
        uuid: 'src-001b',
        title: 'WSJ: Walmart Tech Investment',
        url: 'https://wsj.com/walmart-tech',
      },
    ],
    sourcesCount: 2,
    tags: ['AI', 'retail', 'analytics', 'computer-vision'],
    detectedAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    relatedIndustries: ['retail', 'technology'],
  },
  {
    uuid: 'sig-002',
    title: 'FDA expediting approval process for digital health tools',
    description:
      'FDA announcing streamlined 510(k) pathway for AI-based diagnostic tools. Expected to reduce approval timeline by 40% for qualifying applications.',
    theme: 'regulatory_change',
    stance: 'bullish',
    status: 'new',
    impact: 'high',
    trend: 'accelerating',
    confidence: 94,
    relevanceScore: 88,
    sources: [
      {
        uuid: 'src-002a',
        title: 'FDA Press Release',
        url: 'https://fda.gov/digital-health',
      },
    ],
    sourcesCount: 1,
    tags: ['FDA', 'digital-health', 'regulatory', 'AI-diagnostics'],
    detectedAt: '2024-01-14T14:00:00Z',
    updatedAt: '2024-01-14T14:00:00Z',
    relatedIndustries: ['healthcare', 'technology'],
  },
  {
    uuid: 'sig-003',
    title: 'Competitor X launching subscription model pivot',
    description:
      'Major competitor announcing shift from perpetual licensing to subscription-based pricing. Market reaction mixed, customer sentiment surveys showing concern about cost increases.',
    theme: 'competitor_action',
    stance: 'neutral',
    status: 'exploring',
    impact: 'medium',
    trend: 'stable',
    confidence: 78,
    relevanceScore: 85,
    sources: [
      {
        uuid: 'src-003a',
        title: 'TechCrunch Coverage',
        url: 'https://techcrunch.com/competitor-x',
      },
      {
        uuid: 'src-003b',
        title: 'Customer Survey Data',
        url: 'https://internal.data/surveys',
      },
    ],
    sourcesCount: 2,
    tags: ['competitor', 'pricing', 'subscription', 'market-shift'],
    detectedAt: '2024-01-13T09:15:00Z',
    updatedAt: '2024-01-14T11:00:00Z',
    relatedCompetitors: ['Competitor X'],
  },
  {
    uuid: 'sig-004',
    title: 'Supply chain disruptions easing in semiconductor sector',
    description:
      'Lead times for key semiconductor components dropping to pre-pandemic levels. TSMC and Samsung both reporting improved capacity utilization.',
    theme: 'market_trend',
    stance: 'bullish',
    status: 'monitoring',
    impact: 'medium',
    trend: 'decelerating',
    confidence: 82,
    relevanceScore: 71,
    sources: [
      {
        uuid: 'src-004a',
        title: 'Bloomberg Supply Chain Index',
        url: 'https://bloomberg.com/supply-chain',
      },
    ],
    sourcesCount: 1,
    tags: ['supply-chain', 'semiconductors', 'manufacturing'],
    detectedAt: '2024-01-12T16:45:00Z',
    updatedAt: '2024-01-12T16:45:00Z',
    relatedIndustries: ['manufacturing', 'technology'],
  },
  {
    uuid: 'sig-005',
    title: 'Gen Z consumer preference shift toward sustainability',
    description:
      'New consumer research showing 73% of Gen Z willing to pay premium for sustainable products. Brand loyalty increasingly tied to environmental commitments.',
    theme: 'customer_insight',
    stance: 'bullish',
    status: 'new',
    impact: 'high',
    trend: 'accelerating',
    confidence: 91,
    relevanceScore: 89,
    sources: [
      {
        uuid: 'src-005a',
        title: 'McKinsey Consumer Survey 2024',
        url: 'https://mckinsey.com/consumer-trends',
      },
      {
        uuid: 'src-005b',
        title: 'Deloitte Gen Z Report',
        url: 'https://deloitte.com/genz',
      },
    ],
    sourcesCount: 2,
    tags: ['sustainability', 'gen-z', 'consumer-behavior', 'brand-loyalty'],
    detectedAt: '2024-01-15T08:00:00Z',
    updatedAt: '2024-01-15T08:00:00Z',
    relatedCustomers: ['Gen Z segment'],
  },
  {
    uuid: 'sig-006',
    title: 'Interest rate stabilization signaling economic soft landing',
    description:
      'Federal Reserve signaling pause in rate hikes. Market consensus shifting toward soft landing scenario with 2024 GDP growth projections revised upward.',
    theme: 'economic_indicator',
    stance: 'bullish',
    status: 'monitoring',
    impact: 'medium',
    trend: 'stable',
    confidence: 76,
    relevanceScore: 68,
    sources: [
      {
        uuid: 'src-006a',
        title: 'Federal Reserve Minutes',
        url: 'https://federalreserve.gov/minutes',
      },
    ],
    sourcesCount: 1,
    tags: ['interest-rates', 'federal-reserve', 'economic-outlook'],
    detectedAt: '2024-01-11T20:00:00Z',
    updatedAt: '2024-01-11T20:00:00Z',
  },
  {
    uuid: 'sig-007',
    title: 'European data privacy regulations tightening',
    description:
      'EU proposing expanded GDPR requirements for AI systems. New compliance requirements expected by Q3 2024 affecting data processing and model training practices.',
    theme: 'regulatory_change',
    stance: 'bearish',
    status: 'new',
    impact: 'high',
    trend: 'accelerating',
    confidence: 88,
    relevanceScore: 84,
    sources: [
      {
        uuid: 'src-007a',
        title: 'EU Commission Proposal',
        url: 'https://ec.europa.eu/ai-act',
      },
      {
        uuid: 'src-007b',
        title: 'Reuters Analysis',
        url: 'https://reuters.com/eu-ai-regulation',
      },
    ],
    sourcesCount: 2,
    tags: ['GDPR', 'AI-regulation', 'EU', 'compliance', 'data-privacy'],
    detectedAt: '2024-01-14T11:30:00Z',
    updatedAt: '2024-01-14T11:30:00Z',
    relatedIndustries: ['technology'],
  },
  {
    uuid: 'sig-008',
    title: 'Cloud infrastructure costs declining across major providers',
    description:
      'AWS, Azure, and GCP all announcing price reductions averaging 15-20% for compute and storage. Competition intensifying in enterprise cloud market.',
    theme: 'market_trend',
    stance: 'bullish',
    status: 'new',
    impact: 'medium',
    trend: 'accelerating',
    confidence: 95,
    relevanceScore: 77,
    sources: [
      {
        uuid: 'src-008a',
        title: 'Cloud Price Index Q1 2024',
        url: 'https://cloudpricing.io/index',
      },
    ],
    sourcesCount: 1,
    tags: ['cloud', 'infrastructure', 'pricing', 'AWS', 'Azure', 'GCP'],
    detectedAt: '2024-01-13T13:00:00Z',
    updatedAt: '2024-01-13T13:00:00Z',
  },
];

// ============================================
// Mock Opportunities
// ============================================

export const mockOpportunities: IOpportunity[] = [
  {
    uuid: 'opp-001',
    title: 'Launch AI-powered retail analytics offering',
    description:
      'Capitalize on accelerating AI adoption in retail by developing a turnkey analytics solution targeting mid-market retailers. First-mover advantage window estimated at 12-18 months.',
    category: 'product_innovation',
    impact: 'high',
    effort: 'high',
    priority: 'high',
    priorityScore: 92,
    confidence: 85,
    estimatedValue: 2500000,
    targetDate: '2024-06-30',
    linkedSignalUuids: ['sig-001', 'sig-008'], // AI retail + cloud cost signals
    status: 'identified',
    createdAt: '2024-01-15T12:00:00Z',
    updatedAt: '2024-01-15T12:00:00Z',
  },
  {
    uuid: 'opp-002',
    title: 'Accelerate FDA digital health certification',
    description:
      'Fast-track our diagnostic tool through the new expedited FDA pathway. Potential to reach market 6 months earlier than planned, capturing significant first-mover advantage.',
    category: 'market_entry',
    impact: 'high',
    effort: 'medium',
    priority: 'high',
    priorityScore: 88,
    confidence: 90,
    estimatedValue: 4000000,
    targetDate: '2024-09-15',
    linkedSignalUuids: ['sig-002'], // FDA regulatory signal
    status: 'evaluating',
    createdAt: '2024-01-14T16:00:00Z',
    updatedAt: '2024-01-14T16:00:00Z',
  },
  {
    uuid: 'opp-003',
    title: 'Sustainability-focused product line extension',
    description:
      'Develop eco-friendly product variants targeting Gen Z segment. Research indicates 73% willingness to pay premium. Could capture emerging market segment before competitors.',
    category: 'product_innovation',
    impact: 'high',
    effort: 'medium',
    priority: 'high',
    priorityScore: 86,
    confidence: 82,
    estimatedValue: 1800000,
    targetDate: '2024-08-01',
    linkedSignalUuids: ['sig-005'], // Gen Z sustainability signal
    status: 'identified',
    createdAt: '2024-01-15T09:30:00Z',
    updatedAt: '2024-01-15T09:30:00Z',
  },
  {
    uuid: 'opp-004',
    title: 'Competitive pricing repositioning',
    description:
      'Competitor X subscription pivot creates window for competitive positioning. Consider promotional pricing or enhanced value messaging to capture dissatisfied customers.',
    category: 'market_entry',
    impact: 'medium',
    effort: 'low',
    priority: 'medium',
    priorityScore: 72,
    confidence: 75,
    estimatedValue: 800000,
    targetDate: '2024-03-15',
    linkedSignalUuids: ['sig-003'], // Competitor pricing signal
    status: 'identified',
    createdAt: '2024-01-13T14:00:00Z',
    updatedAt: '2024-01-13T14:00:00Z',
  },
  {
    uuid: 'opp-005',
    title: 'EU AI compliance early adoption',
    description:
      'Proactively build GDPR-compliant AI infrastructure before Q3 deadline. Early compliance could become competitive differentiator in European market.',
    category: 'risk_mitigation',
    impact: 'medium',
    effort: 'high',
    priority: 'medium',
    priorityScore: 68,
    confidence: 78,
    estimatedValue: null,
    targetDate: '2024-07-01',
    linkedSignalUuids: ['sig-007'], // EU privacy regulation signal
    status: 'identified',
    createdAt: '2024-01-14T15:00:00Z',
    updatedAt: '2024-01-14T15:00:00Z',
  },
];

// ============================================
// Mock Intelligence Items
// ============================================

export const mockIntelligence: IIntelligenceItem[] = [
  {
    uuid: 'intel-001',
    title: 'Gartner: Top 10 Strategic Technology Trends for 2024',
    summary:
      'AI-augmented development, industry cloud platforms, and sustainable technology lead the list. Report emphasizes convergence of AI with traditional enterprise systems.',
    category: 'technology',
    source: 'Gartner',
    sourceLogoUrl: 'https://logos.com/gartner.png',
    url: 'https://gartner.com/trends-2024',
    relevanceScore: 91,
    publishedAt: '2024-01-10T08:00:00Z',
    createdAt: '2024-01-10T10:00:00Z',
  },
  {
    uuid: 'intel-002',
    title: 'McKinsey: State of AI in 2024',
    summary:
      'Generative AI adoption doubling year-over-year. 65% of organizations now regularly using gen AI, up from 33% in 2023. Highest adoption in marketing, product development, and service operations.',
    category: 'market',
    source: 'McKinsey & Company',
    sourceLogoUrl: 'https://logos.com/mckinsey.png',
    url: 'https://mckinsey.com/state-of-ai-2024',
    relevanceScore: 88,
    publishedAt: '2024-01-12T09:00:00Z',
    createdAt: '2024-01-12T11:00:00Z',
  },
  {
    uuid: 'intel-003',
    title: 'Competitor X Q4 Earnings Analysis',
    summary:
      'Revenue flat YoY despite subscription transition. Customer churn elevated at 8.2%. Management citing "transition headwinds" but reaffirming long-term strategy.',
    category: 'competitive',
    source: 'Internal Analysis',
    sourceLogoUrl: null,
    url: null,
    relevanceScore: 94,
    publishedAt: '2024-01-13T16:00:00Z',
    createdAt: '2024-01-13T17:00:00Z',
  },
  {
    uuid: 'intel-004',
    title: 'EU AI Act: Implementation Timeline and Requirements',
    summary:
      'Comprehensive breakdown of EU AI Act requirements. High-risk AI systems face strictest requirements including conformity assessments, documentation, and human oversight provisions.',
    category: 'regulatory',
    source: 'EU Commission',
    sourceLogoUrl: 'https://logos.com/eu.png',
    url: 'https://ec.europa.eu/ai-act-guide',
    relevanceScore: 86,
    publishedAt: '2024-01-14T10:00:00Z',
    createdAt: '2024-01-14T12:00:00Z',
  },
  {
    uuid: 'intel-005',
    title: 'Retail Technology Spending Forecast 2024-2026',
    summary:
      'IDC projects retail IT spending growth of 6.8% CAGR through 2026. AI/ML investments leading growth categories. Cloud migration and omnichannel capabilities driving transformation budgets.',
    category: 'market',
    source: 'IDC',
    sourceLogoUrl: 'https://logos.com/idc.png',
    url: 'https://idc.com/retail-tech-2024',
    relevanceScore: 82,
    publishedAt: '2024-01-11T14:00:00Z',
    createdAt: '2024-01-11T15:00:00Z',
  },
];

// ============================================
// Mock Gut Check Summary
// ============================================

export const mockGutCheck: IGutCheckSummary = {
  uuid: 'gc-001',
  summary:
    'The market is showing strong bullish signals for AI-powered solutions, particularly in retail and healthcare. Regulatory tailwinds from FDA are creating accelerated market entry opportunities, while EU privacy regulations require proactive compliance planning. Competitor vulnerabilities in pricing transitions present tactical opportunities.',
  keyInsights: [
    'AI retail analytics adoption is accelerating faster than projected - window for market entry narrowing',
    'FDA expedited pathway could reduce time-to-market by 40% for qualifying digital health products',
    'Competitor X subscription pivot causing customer dissatisfaction - potential acquisition target for displaced customers',
    'Gen Z sustainability preferences creating new premium segment opportunity',
  ],
  recommendedActions: [
    'Prioritize retail AI analytics product development',
    'Submit FDA expedited pathway application immediately',
    'Launch competitive win-back campaign targeting Competitor X customers',
  ],
  status: 'complete',
  generatedAt: '2024-01-15T06:00:00Z',
};

// ============================================
// Mock Metrics
// ============================================

export const mockMetrics: ISignalMetrics = {
  activeSignals: 8,
  newThisWeek: 5,
  quickWins: 2,
  pipelineValue: 9100000,
};

// ============================================
// Mock Radar Points
// ============================================

export const mockRadarPoints: IRadarPoint[] = [
  {
    uuid: 'radar-001',
    label: 'AI Analytics',
    category: 'technology',
    impact: 'high',
    timeHorizon: 'now',
    radialPosition: 0.2,
    angularPosition: 72,
  },
  {
    uuid: 'radar-002',
    label: 'FDA Digital Health',
    category: 'market',
    impact: 'high',
    timeHorizon: 'next',
    radialPosition: 0.5,
    angularPosition: 288,
  },
  {
    uuid: 'radar-003',
    label: 'Sustainability Products',
    category: 'sustainability',
    impact: 'high',
    timeHorizon: 'next',
    radialPosition: 0.6,
    angularPosition: 144,
  },
  {
    uuid: 'radar-004',
    label: 'EU AI Compliance',
    category: 'operations',
    impact: 'medium',
    timeHorizon: 'next',
    radialPosition: 0.55,
    angularPosition: 216,
  },
  {
    uuid: 'radar-005',
    label: 'Competitor Pricing',
    category: 'market',
    impact: 'medium',
    timeHorizon: 'now',
    radialPosition: 0.15,
    angularPosition: 320,
  },
  {
    uuid: 'radar-006',
    label: 'Cloud Cost Optimization',
    category: 'operations',
    impact: 'medium',
    timeHorizon: 'now',
    radialPosition: 0.25,
    angularPosition: 200,
  },
];

// ============================================
// Complete Mock Dashboard
// ============================================

export const mockDashboard: ISignalScanningDashboard = {
  gutCheck: mockGutCheck,
  metrics: mockMetrics,
  recentSignals: mockSignals,
  topOpportunities: mockOpportunities,
  industryIntelligence: mockIntelligence,
  radarPoints: mockRadarPoints,
};

// ============================================
// Helper: Get signals by UUIDs (for clustering)
// ============================================

export const getSignalsByUuids = (uuids: string[]): ISignal[] => {
  return mockSignals.filter((signal) => uuids.includes(signal.uuid));
};

// ============================================
// Helper: Get standalone signals (not linked to any opportunity)
// ============================================

export const getStandaloneSignals = (): ISignal[] => {
  const linkedUuids = new Set(
    mockOpportunities.flatMap((opp) => opp.linkedSignalUuids),
  );
  return mockSignals.filter((signal) => !linkedUuids.has(signal.uuid));
};

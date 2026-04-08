import type { AnalysisResult } from '../types/analysis';

export const mockAnalysis: AnalysisResult = {
  id: 'analysis-001',
  request: {
    companyName: 'Stripe',
    marketSpace: 'AI-Powered Expense Management',
    companyContext:
      'Stripe is a global payments infrastructure company processing hundreds of billions annually. They serve millions of businesses from startups to Fortune 500s and have deep integrations into financial workflows.',
  },
  status: 'completed',
  steps: [
    {
      step: 'incumbents',
      label: 'Incumbents',
      status: 'completed',
      startedAt: '2026-04-08T10:00:00Z',
      completedAt: '2026-04-08T10:00:12Z',
    },
    {
      step: 'emerging_competitors',
      label: 'Emerging Competitors',
      status: 'completed',
      startedAt: '2026-04-08T10:00:00Z',
      completedAt: '2026-04-08T10:00:18Z',
    },
    {
      step: 'market_sizing',
      label: 'Market Sizing',
      status: 'completed',
      startedAt: '2026-04-08T10:00:00Z',
      completedAt: '2026-04-08T10:00:15Z',
    },
    {
      step: 'synthesis',
      label: 'Opportunity Assessment',
      status: 'completed',
      startedAt: '2026-04-08T10:00:18Z',
      completedAt: '2026-04-08T10:00:24Z',
    },
  ],
  incumbents: {
    summary:
      'The AI-powered expense management space is dominated by three well-funded incumbents with strong enterprise distribution. SAP Concur leads with deep ERP integration, followed by Brex and Ramp who have modernized the category with real-time controls and AI-native architectures. The market is competitive but fragmented below the top tier, with significant switching costs creating lock-in.',
    players: [
      {
        name: 'SAP Concur',
        description:
          'Legacy market leader in enterprise travel and expense management with deep SAP ERP integration. Serves 75% of Fortune 500.',
        marketPosition: 'Leader',
        strengths: [
          'Massive enterprise installed base',
          'Deep ERP integration with SAP ecosystem',
          'Global compliance and tax engine',
          'End-to-end travel + expense workflow',
        ],
        weaknesses: [
          'Legacy UX frequently cited as pain point',
          'Slow AI adoption compared to newer entrants',
          'Complex pricing and implementation',
          'High total cost of ownership',
        ],
        estimatedRevenue: '$1.8B',
        founded: '1993',
        headquarters: 'Bellevue, WA',
      },
      {
        name: 'Brex',
        description:
          'Modern corporate card and spend management platform targeting startups and mid-market. Recently pivoted to enterprise with AI-first expense tools.',
        marketPosition: 'Challenger',
        strengths: [
          'AI-native receipt matching and categorization',
          'Real-time spend controls and policy enforcement',
          'Strong developer API and integrations',
          'Modern UX driving high NPS',
        ],
        weaknesses: [
          'Limited enterprise penetration vs Concur',
          'Revenue heavily tied to interchange',
          'Still building global coverage',
          'Recent layoffs signal strategic uncertainty',
        ],
        estimatedRevenue: '$500M',
        founded: '2017',
        headquarters: 'San Francisco, CA',
      },
      {
        name: 'Ramp',
        description:
          'Fast-growing corporate card and finance automation platform emphasizing cost savings. Known for aggressive AI feature development.',
        marketPosition: 'Challenger',
        strengths: [
          'Best-in-class AI for duplicate detection and savings',
          'Price negotiation engine saves customers 5%+ on SaaS',
          'Fastest-growing in category (3x YoY)',
          'Strong word-of-mouth in tech sector',
        ],
        weaknesses: [
          'US-only operations',
          'Limited to mid-market segment',
          'Dependent on card interchange revenue model',
          'Narrow product scope vs full ERP suites',
        ],
        estimatedRevenue: '$300M',
        founded: '2019',
        headquarters: 'New York, NY',
      },
      {
        name: 'Navan (formerly TripActions)',
        description:
          'Integrated travel and expense platform combining booking, payments, and expense reporting into a single workflow.',
        marketPosition: 'Challenger',
        strengths: [
          'Unified travel + expense experience',
          'Strong user satisfaction scores',
          'AI-powered policy compliance',
          'Growing enterprise traction',
        ],
        weaknesses: [
          'Burn rate concerns despite $9.2B valuation',
          'Travel-first DNA may limit expense depth',
          'Crowded positioning between Concur and Ramp',
          'International expansion still early',
        ],
        estimatedRevenue: '$400M',
        founded: '2015',
        headquarters: 'Palo Alto, CA',
      },
    ],
    marketConcentration:
      'Moderate — top 4 players control ~55% of the market, but long tail of legacy and regional solutions persists',
    confidence: {
      level: 'high',
      score: 87,
      reasoning:
        'Well-documented public market with clear leaders. Revenue estimates triangulated from multiple analyst reports and press coverage.',
    },
    sources: [
      {
        title: 'Gartner Magic Quadrant for Expense Management 2025',
        url: 'https://www.gartner.com/reviews/market/expense-management',
        publisher: 'Gartner',
        date: '2025-09',
        snippet:
          'SAP Concur maintains leadership position while Brex and Ramp emerge as visionary challengers.',
      },
      {
        title: 'Ramp hits $300M ARR, valued at $7.65B',
        url: 'https://www.forbes.com/sites/alexkonrad/2024/ramp-funding',
        publisher: 'Forbes',
        date: '2024-03',
        snippet:
          'Ramp has tripled its revenue for the third consecutive year, reaching $300M in annual recurring revenue.',
      },
      {
        title: 'The State of Corporate Expense Management',
        url: 'https://www.mckinsey.com/industries/financial-services/expense-management-2025',
        publisher: 'McKinsey & Company',
        date: '2025-06',
      },
      {
        title: 'Brex pivots to enterprise, AI-powered expense automation',
        url: 'https://techcrunch.com/2024/brex-enterprise-pivot',
        publisher: 'TechCrunch',
        date: '2024-11',
      },
    ],
  },
  emergingCompetitors: {
    summary:
      'Significant venture capital activity in AI expense management, with $890M+ deployed in the last 18 months across 12 funded startups. The funding trend is accelerating, with particular focus on vertical-specific solutions (construction, healthcare) and autonomous expense processing. Several startups are positioning AI agents that eliminate manual expense reporting entirely.',
    competitors: [
      {
        name: 'Fyle',
        description:
          'AI-powered expense management that works with existing credit cards. No corporate card required — integrates with any Visa/Mastercard.',
        fundingStage: 'Series B',
        fundingAmount: '$45M',
        fundingDate: '2025-08',
        investors: ['Tiger Global', 'DST Global Partners'],
        differentiator:
          'Card-agnostic approach eliminates switching costs. AI extracts expenses from email receipts and bank feeds automatically.',
      },
      {
        name: 'Cohere Expense (stealth)',
        description:
          'Building autonomous AI agents that handle end-to-end expense workflows — from receipt capture to GL coding to reimbursement.',
        fundingStage: 'Series A',
        fundingAmount: '$28M',
        fundingDate: '2026-01',
        investors: ['a16z', 'Elad Gil'],
        differentiator:
          'Agentic AI that learns company-specific policies and autonomously processes 95% of expenses without human review.',
      },
      {
        name: 'Ledge',
        description:
          'Vertical expense management for construction and field services. Handles per-diem, equipment costs, and multi-site allocations.',
        fundingStage: 'Seed',
        fundingAmount: '$12M',
        fundingDate: '2025-11',
        investors: ['Founders Fund', 'Brick & Mortar Ventures'],
        differentiator:
          'Purpose-built for industries where expense categories and compliance rules differ fundamentally from office workers.',
      },
      {
        name: 'SpendAI',
        description:
          'Real-time spend intelligence platform that predicts budget overruns and suggests cost optimization using ML models trained on anonymized spend data.',
        fundingStage: 'Series A',
        fundingAmount: '$35M',
        fundingDate: '2025-06',
        investors: ['Sequoia Capital', 'Index Ventures'],
        differentiator:
          'Predictive analytics layer that sits on top of existing expense tools. Not a replacement — an intelligence augmentation.',
      },
      {
        name: 'Peel Finance',
        description:
          'AI expense platform for international teams. Handles multi-currency, cross-border tax compliance, and local payment methods natively.',
        fundingStage: 'Series A',
        fundingAmount: '$22M',
        fundingDate: '2025-09',
        investors: ['Ribbit Capital', 'Global Founders Capital'],
        differentiator:
          'Built for distributed workforces. Handles VAT reclaim, cross-border compliance, and local expense norms across 40+ countries.',
      },
    ],
    totalFundingInSpace: '$890M+',
    fundingTrend: 'accelerating',
    confidence: {
      level: 'medium',
      score: 72,
      reasoning:
        'Funding data from Crunchbase and press releases is reasonably reliable for announced rounds. However, stealth startups and undisclosed rounds likely undercount total activity by 20-30%.',
    },
    sources: [
      {
        title: 'Expense Management Startups Funding Tracker',
        url: 'https://www.crunchbase.com/hub/expense-management-startups',
        publisher: 'Crunchbase',
        date: '2026-03',
      },
      {
        title: 'a16z leads $28M Series A for autonomous expense AI startup',
        url: 'https://www.theinformation.com/articles/cohere-expense-funding',
        publisher: 'The Information',
        date: '2026-01',
      },
      {
        title: 'FinTech Funding Report Q4 2025',
        url: 'https://www.cbinsights.com/research/fintech-funding-q4-2025',
        publisher: 'CB Insights',
        date: '2025-12',
        snippet:
          'Expense management and spend intelligence attracted $340M in Q4 alone, a 45% increase over Q3.',
      },
      {
        title: 'Why VCs are betting big on AI-powered finance tools',
        url: 'https://www.ft.com/content/ai-finance-tools-vc-investment',
        publisher: 'Financial Times',
        date: '2025-10',
      },
    ],
  },
  marketSizing: {
    summary:
      'The global AI-powered expense management market is projected to reach $12.4B by 2030, growing at a 14.2% CAGR from its current $5.1B base. Growth is driven by enterprise AI adoption, remote work normalization, and increasing regulatory complexity. North America represents 45% of the market, followed by Europe at 30%.',
    tam: '$12.4B',
    sam: '$5.8B',
    som: '$870M',
    cagr: '14.2%',
    growthDrivers: [
      'Enterprise AI adoption accelerating across finance functions',
      'Remote/hybrid work driving demand for automated expense capture',
      'Increasing regulatory complexity in cross-border expense compliance',
      'CFO mandate to reduce finance team headcount by 20-30% via automation',
      'Real-time spend visibility becoming table-stakes for modern CFOs',
    ],
    constraints: [
      'Enterprise procurement cycles remain 6-12 months',
      'Data privacy regulations (GDPR, state-level) limit AI training on financial data',
      'Integration complexity with legacy ERP systems',
      'Employee resistance to AI-automated approval workflows',
    ],
    timeframe: '2025-2030',
    confidence: {
      level: 'medium',
      score: 68,
      reasoning:
        'Market sizing estimates vary across analyst reports by +/-20%. TAM definition is broad and includes adjacent categories. SAM narrowed to companies with >$10M revenue where AI expense tools are applicable.',
    },
    sources: [
      {
        title: 'Global Expense Management Software Market Report 2025-2030',
        url: 'https://www.grandviewresearch.com/industry-analysis/expense-management-software-market',
        publisher: 'Grand View Research',
        date: '2025-04',
        snippet:
          'The market is expected to grow at a CAGR of 14.2% from 2025 to 2030, driven by AI integration.',
      },
      {
        title: 'AI in Finance: Market Forecast and Competitive Analysis',
        url: 'https://www.marketsandmarkets.com/ai-finance-forecast',
        publisher: 'MarketsandMarkets',
        date: '2025-07',
      },
      {
        title: 'The $12B opportunity in intelligent expense automation',
        url: 'https://www.bain.com/insights/intelligent-expense-automation',
        publisher: 'Bain & Company',
        date: '2025-11',
      },
    ],
  },
  opportunityAssessment: {
    recommendation: 'go',
    score: 78,
    headline:
      'Strong strategic fit — Stripe\'s payments infrastructure creates a natural wedge into expense management with lower acquisition costs than pure-play competitors.',
    reasoning:
      'Stripe already processes the underlying transactions that expense management tools categorize and reconcile. By layering AI-powered expense intelligence on top of its existing payment rails, Stripe can offer a uniquely integrated experience that competitors cannot replicate without building their own payment infrastructure. The market is large ($12.4B TAM) and growing rapidly (14.2% CAGR), with incumbents vulnerable on UX and AI capabilities. However, the space is increasingly crowded with well-funded startups, and Stripe would need to move quickly to establish position before the next wave of consolidation.',
    reasonsToBelieve: [
      'Existing transaction data provides training advantage for AI expense categorization — no cold start problem',
      'Stripe\'s merchant and customer relationships create a built-in distribution channel',
      '14.2% CAGR indicates sustained demand growth, not hype cycle',
      'Incumbent leader (Concur) is widely disliked, creating switching opportunity',
      'Stripe\'s developer-first brand aligns with the API-driven direction of modern expense tools',
      'Card issuance capability (Stripe Issuing) enables full-stack expense solution',
    ],
    reasonsToChallenge: [
      'Entering a market with $890M+ in recent startup funding signals crowded competition',
      'Ramp and Brex are well-capitalized and executing aggressively in this exact space',
      'Expense management requires deep domain expertise in tax, compliance, and policy — not core Stripe DNA',
      'Enterprise sales motion differs significantly from Stripe\'s self-serve go-to-market',
      'Risk of distracting from core payments business during a critical growth period',
    ],
    whiteSpaceOpportunities: [
      'Transaction-native expense management that eliminates receipt matching entirely',
      'Cross-border expense intelligence leveraging Stripe\'s global payment network',
      'Embedded expense tools for platforms (Stripe Connect ecosystem)',
      'Predictive spend analytics using real-time payment flow data',
    ],
    keyRisks: [
      'Brex and Ramp could partner with other payment providers to neutralize Stripe\'s data advantage',
      'Enterprise go-to-market requires significant investment in sales and implementation teams',
      'Regulatory complexity in expense compliance across jurisdictions',
    ],
    confidence: {
      level: 'high',
      score: 81,
      reasoning:
        'High confidence in the strategic logic and market dynamics. Moderate uncertainty around execution risk and competitive response timelines.',
    },
  },
  createdAt: '2026-04-08T10:00:00Z',
  completedAt: '2026-04-08T10:00:24Z',
};

import {
  AiResearchMetric,
  CompanyContext,
  ProposedAddition,
  Question,
  RiskFactor,
} from './types';

export const mockCompanyContext: CompanyContext = {
  id: '1',
  companyName: 'Schreiber Foods',
  lastUpdated: '2025-01-14T10:30:00Z',
  overallMaturity: 3.2,
  status: 'Actively Researching',
  categories: [
    {
      id: 'company-identity',
      name: 'Company Identity & Value Proposition',
      description: 'What we do and why customers choose us',
      icon: 'building-02',
      completeness: 95,
      confidenceScore: 88,
      needsReview: false,
      lastUpdated: '2025-01-14T10:30:00Z',
      aiFindings: 4,
      userContributions: 4,
      pendingUpdates: 0,
    },
    {
      id: 'geographic-footprint',
      name: 'Geographic Footprint & Market Presence',
      description: 'Where we operate and why it matters',
      icon: 'globe',
      completeness: 90,
      confidenceScore: 85,
      needsReview: false,
      lastUpdated: '2025-01-13T15:20:00Z',
      aiFindings: 4,
      userContributions: 4,
      pendingUpdates: 0,
    },
    {
      id: 'corporate-strategy',
      name: 'Corporate Strategy & Strategic Priorities',
      description: 'How we plan to grow & invest',
      icon: 'target',
      completeness: 85,
      confidenceScore: 80,
      needsReview: true,
      lastUpdated: '2025-01-12T09:15:00Z',
      aiFindings: 4,
      userContributions: 4,
      pendingUpdates: 1,
    },
    {
      id: 'offerings',
      name: 'Offerings & Business Units',
      description: "What we sell and how it's made/delivered",
      icon: 'cube',
      completeness: 88,
      confidenceScore: 82,
      needsReview: false,
      lastUpdated: '2025-01-14T08:45:00Z',
      aiFindings: 4,
      userContributions: 4,
      pendingUpdates: 0,
    },
    {
      id: 'customers',
      name: 'Customers & Market Insights',
      description: 'Who buys, what they need, and trends',
      icon: 'user-group',
      completeness: 92,
      confidenceScore: 86,
      needsReview: false,
      lastUpdated: '2025-01-11T14:20:00Z',
      aiFindings: 4,
      userContributions: 4,
      pendingUpdates: 0,
    },
    {
      id: 'brand',
      name: 'Brand & Reputation',
      description: 'Positioning, trust assets, and constraints',
      icon: 'star-01',
      completeness: 90,
      confidenceScore: 84,
      needsReview: false,
      lastUpdated: '2025-01-12T09:15:00Z',
      aiFindings: 4,
      userContributions: 4,
      pendingUpdates: 0,
    },
    {
      id: 'operating-model',
      name: 'Operating Model & Core Capabilities',
      description: 'Capabilities, safety/quality, and services',
      icon: 'gear',
      completeness: 85,
      confidenceScore: 83,
      needsReview: false,
      lastUpdated: '2025-01-13T11:10:00Z',
      aiFindings: 4,
      userContributions: 4,
      pendingUpdates: 0,
    },
    {
      id: 'financial',
      name: 'Financial Performance & Resource Allocation',
      description: 'Scale & where we deploy capital',
      icon: 'currency-dollar',
      completeness: 88,
      confidenceScore: 85,
      needsReview: false,
      lastUpdated: '2025-01-14T07:30:00Z',
      aiFindings: 4,
      userContributions: 4,
      pendingUpdates: 0,
    },
    {
      id: 'ecosystem',
      name: 'Ecosystem & Partnerships',
      description: 'Partners that accelerate innovation',
      icon: 'dataflow-04',
      completeness: 82,
      confidenceScore: 78,
      needsReview: true,
      lastUpdated: '2025-01-13T12:20:00Z',
      aiFindings: 2,
      userContributions: 3,
      pendingUpdates: 2,
    },
    {
      id: 'innovation-capability',
      name: 'Innovation Capability & Risk Profile',
      description: 'Governance, speed, and risk posture',
      icon: 'lightbulb',
      completeness: 75,
      confidenceScore: 72,
      needsReview: true,
      lastUpdated: '2025-01-10T16:30:00Z',
      aiFindings: 4,
      userContributions: 4,
      pendingUpdates: 3,
    },
  ],
};

export const mockQuestions: Record<string, Question[]> = {
  'company-identity': [
    {
      id: 'ci1',
      question: 'What does the company primarily do and for whom?',
      answers: [
        {
          id: 'a1',
          content:
            'Schreiber is a customer-brand (private-label) dairy leader supplying cheese, cream cheese, yogurt & beverages to retailers, restaurants, distributors, and food manufacturers globally.',
          source: 'Company Internal – 2024 Brand Book',
          sourceType: 'internal',
          lastUpdated: '2025-01-14T10:30:00Z',
        },
      ],
      isAnswered: true,
    },
    {
      id: 'ci2',
      question: 'What is the core value proposition in one sentence?',
      answers: [
        {
          id: 'a2',
          content:
            '"Creating the world\'s favorite foods" for customer brands with scale, quality, and value-added services that help customers grow.',
          source: 'AI Reasoning Agent',
          sourceType: 'ai-reasoning',
          lastUpdated: '2025-01-13T15:20:00Z',
        },
      ],
      isAnswered: true,
    },
    {
      id: 'ci3',
      question: 'What is the stated vision or purpose?',
      answers: [
        {
          id: 'a3',
          content:
            'Vision: "To do good through food." Strategic priorities: Growth and Impact.',
          source: 'Company Internal – Strategy Deck 2025',
          sourceType: 'internal',
          lastUpdated: '2025-01-12T09:15:00Z',
        },
      ],
      isAnswered: true,
    },
    {
      id: 'ci4',
      question: 'Ownership & governance fact that shapes behavior?',
      answers: [
        {
          id: 'a4',
          content:
            'Employee-owned (ESOP) culture ("partners"), influencing long-term orientation and engagement.',
          source: 'News Article – Dairy Reporter, Jan 2024',
          sourceType: 'external',
          lastUpdated: '2025-01-11T14:20:00Z',
        },
      ],
      isAnswered: true,
    },
  ],
  'geographic-footprint': [
    {
      id: 'gf1',
      question: 'Where does the company operate (high level)?',
      answers: [
        {
          id: 'a5',
          content:
            '40+ locations across five continents, serving global customers.',
          source: 'AI Reasoning Agent',
          sourceType: 'ai-reasoning',
          lastUpdated: '2025-01-14T08:45:00Z',
        },
      ],
      isAnswered: true,
    },
    {
      id: 'gf2',
      question: 'Which geographies are strategically important?',
      answers: [
        {
          id: 'a6',
          content:
            'North America (HQ: Green Bay, WI), Europe (e.g., Spain, Germany), Latin America (e.g., Mexico), Asia (e.g., India).',
          source: 'Company Internal – Global Footprint Map (2024)',
          sourceType: 'internal',
          lastUpdated: '2025-01-13T11:10:00Z',
        },
      ],
      isAnswered: true,
    },
    {
      id: 'gf3',
      question: 'Example site capabilities that vary by location?',
      answers: [
        {
          id: 'a7',
          content:
            'Sites list capabilities such as process cheese, plant-based cream cheese, yogurt, and distribution centers.',
          source: 'Industry Report – Dairy Facilities Index 2024',
          sourceType: 'external',
          lastUpdated: '2025-01-12T15:45:00Z',
        },
      ],
      isAnswered: true,
    },
    {
      id: 'gf4',
      question: 'Any recent geographic expansions or changes?',
      answers: [
        {
          id: 'a8',
          content:
            'Planned Carthage, Missouri expansion announced Dec 2024, later paused Apr 2025.',
          source: 'News Article – Missouri Business Journal, Apr 2025',
          sourceType: 'external',
          lastUpdated: '2025-01-14T07:30:00Z',
        },
      ],
      isAnswered: true,
    },
  ],
  // Add more categories as needed...
};

export const shortTermFactors: RiskFactor[] = [
  {
    type: 'tailwind',
    text: 'Traditional dairy demand is making a comeback, bolstering short-term prospects.',
  },
  {
    type: 'tailwind',
    text: "Private-label boom strengthens Schreiber's core B2B manufacturing advantage.",
  },
  {
    type: 'headwind',
    text: 'Global dairy giants are leveraging superior scale to intensify competitive pressure.',
  },
  {
    type: 'headwind',
    text: 'Functional dairy leaders prove innovation can bypass traditional manufacturers.',
  },
];

export const midTermFactors: RiskFactor[] = [
  {
    type: 'tailwind',
    text: 'Growing functional dairy demand creates new opportunities for manufacturing expertise.',
  },
  {
    type: 'tailwind',
    text: 'Continued private-label growth shields against direct-consumer disruption threats.',
  },
  {
    type: 'headwind',
    text: 'Industry consolidation is increasing competitor leverage and market power.',
  },
  {
    type: 'headwind',
    text: 'Massive infrastructure investments raise the competitive bar across the industry.',
  },
  {
    type: 'watch',
    text: 'Stalled Carthage expansion lets competitors gain ground while capacity remains limited.',
  },
];

export const longTermFactors: RiskFactor[] = [
  {
    type: 'tailwind',
    text: 'Expanding dairy market creates sustained demand for manufacturing partnerships.',
  },
  {
    type: 'tailwind',
    text: "Global private-label growth validates Schreiber's business model approach.",
  },
  {
    type: 'headwind',
    text: 'Consolidated competitors will continue raising innovation and capability standards.',
  },
  {
    type: 'headwind',
    text: 'Sustainability pressures create openings for environmentally-focused disruptors.',
  },
];

export const aiResearchMetrics: AiResearchMetric[] = [
  {
    name: 'Sources',
    value: 1247,
    icon: 'globe',
  },
  {
    name: 'Facts',
    value: 8400,
    icon: 'file',
  },
  {
    name: 'Research',
    value: 156,
    icon: 'clock',
  },
  {
    name: 'Data Points',
    value: 12400,
    icon: 'barchart',
  },
];

export const proposedAdditions: ProposedAddition[] = [
  {
    id: '1',
    text: 'Partnership with OpenEnvoy on Autonomous Finance',
    category: 'Corporate Strategy & Structure',
    source: 'AI Analysis',
  },
  {
    id: '2',
    text: 'Purchase of Carbon Credits from Brightly',
    category: 'Market Research & Customer Behavior',
    source: 'Market Research',
  },
  {
    id: '3',
    text: '$211M Expansion in Carthage, Missouri',
    category: 'Financial Performance',
    source: 'User Input',
  },
  {
    id: '4',
    text: 'Indefinite Pause of Carthage Expansion',
    category: 'Risk Aversion / Risk Index',
    source: 'AI Analysis',
  },
  {
    id: '5',
    text: 'Hosted U.S. Dairy Plant Food Safety Workshop',
    category: 'Corporate Strategy & Structure',
    source: 'Market Trends',
  },
];

export const categoryGoals: Record<string, string> = {
  'company-identity':
    "Anchor innovation in the company's core value proposition, vision, and fundamental business model.",
  'geographic-footprint':
    'Understand where the company operates and how location-specific capabilities can accelerate innovation.',
  'corporate-strategy':
    'Align innovation with strategic priorities, investment themes, and growth constraints.',
  offerings:
    'Leverage existing product capabilities and formats to accelerate new offering development.',
  customers:
    'Identify customer segments most open to innovation and understand their adoption drivers.',
  brand:
    'Understand how brand positioning, equities, and constraints can support or limit innovation directions.',
  'operating-model':
    'Identify core capabilities and operational strengths that can enable rapid innovation execution.',
  financial:
    'Understand capital allocation patterns and financial constraints that shape innovation investment.',
  ecosystem:
    'Identify partnerships and relationships that can accelerate innovation adoption or reduce time-to-market.',
  'innovation-capability':
    'Assess governance, culture, and risk posture that determine innovation execution speed and success.',
};

export const categoryAISummaries: Record<string, string> = {
  'company-identity':
    'Schreiber is a customer-brand dairy leader creating "the world\'s favorite foods" with the vision "to do good through food." Employee-owned (ESOP) culture drives long-term orientation and engagement.',
  'geographic-footprint':
    'Global presence with 40+ locations across five continents. Key strategic geographies include North America (HQ: Green Bay, WI), Europe, Latin America, and Asia. Recently paused Carthage, Missouri expansion.',
  'corporate-strategy':
    'Growth & Impact priorities focused on customer partnerships and capability expansion. Strategic initiatives include $211M process-cheese expansion, with sustainability commitments shaping innovation choices.',
  offerings:
    'Core portfolio includes cheese, cream cheese, yogurt, and beverages in multiple formats. Key differentiator: shelf-stable (aseptic) beverages. Expanding into yogurt via acquisitions with ongoing consumer insights support.',
  customers:
    'Serves retailers, restaurants/foodservice, distributors, and food manufacturers. Internal consumer-insights team tracks trends. B2B adoption driven by quality, supply reliability, culinary support, and value.',
  brand:
    'Purpose-led positioning as customer-brand partner focused on quality and safety. Top Employer recognition in Madrid 2025. Food safety leadership and values-forward culture support innovation credibility.',
  'operating-model':
    'Global manufacturing and distribution network with value-added services. Strong technical capabilities in shelf-stable processing and broad dairy manufacturing. Employee-ownership culture enables strong execution.',
  financial:
    '$7B+ annual sales with significant capital allocation ($211M expansion). Corporate venture investments in climate-tech (Brightly, OpenEnvoy) demonstrate innovation investment beyond core operations.',
  ecosystem:
    'Strategic partnerships with OpenEnvoy (Autonomous Finance) and Brightly (carbon credits). Active industry leadership through hosting Dairy Plant Food Safety Workshop. Long-standing retail and foodservice networks.',
  'innovation-capability':
    'Value-added services and corporate ventures posture with rapid execution (OpenEnvoy implemented in ~6 weeks). Paused $211M project shows macro risk prudence while maintaining sustainability goals and innovation-friendly culture.',
};

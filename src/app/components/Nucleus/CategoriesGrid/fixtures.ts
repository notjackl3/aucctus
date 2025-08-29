import { Icon } from '@components';
import { ISource } from '@libs/api/types';

type IconVariant = React.ComponentProps<typeof Icon>['variant'];

export interface CategoryData {
  id: string;
  name: string;
  description: string;
  icon: IconVariant;
  completeness: number;
  confidenceScore: number;
  needsReview: boolean;
  lastUpdated: string;
  aiFindings: number;
  userContributions: number;
  pendingUpdates: number;
  colorScheme: {
    bg: string;
    border: string;
    stroke: string;
  };
}

export interface QuestionData {
  id: string;
  question: string;
  answers: Array<{
    id: string;
    content: string;
    source: string;
    sourceType: 'external' | 'internal' | 'ai-reasoning';
    lastUpdated: string;
    author?: string;
  }>;
  isAnswered: boolean;
  priority?: 'core' | 'deeper';
  cluster?: string;
}

export interface CompanyContext {
  id: string;
  companyName: string;
  lastUpdated: string;
  status: string;
  overallMaturity: number;
  categories: CategoryData[];
}

export const mockCompanyContext: CompanyContext = {
  id: '1',
  companyName: 'Schreiber Foods',
  lastUpdated: '2025-01-14T10:30:00Z',
  status: 'Actively Researching',
  overallMaturity: 3.2,
  categories: [
    {
      id: 'company-identity',
      name: 'Company Identity & Value Proposition',
      description: 'What we do and why customers choose us',
      icon: 'building',
      colorScheme: {
        bg: 'aucctus-bg-brand-primary',
        border: 'aucctus-border-brand',
        stroke: 'aucctus-stroke-brand-primary',
      },
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
      colorScheme: {
        bg: 'aucctus-bg-info-primary',
        border: 'aucctus-border-info',
        stroke: 'aucctus-stroke-info-primary',
      },
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
      colorScheme: {
        bg: 'aucctus-bg-analytics-primary',
        border: 'aucctus-border-analytics',
        stroke: 'aucctus-stroke-analytics-primary',
      },
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
      icon: 'inbox-02',
      colorScheme: {
        bg: 'aucctus-bg-data-primary',
        border: 'aucctus-border-data',
        stroke: 'aucctus-stroke-data-primary',
      },
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
      colorScheme: {
        bg: 'aucctus-bg-research-primary',
        border: 'aucctus-border-research',
        stroke: 'aucctus-stroke-research-primary',
      },
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
      colorScheme: {
        bg: 'aucctus-bg-warning-primary',
        border: 'aucctus-border-warning',
        stroke: 'aucctus-stroke-warning-primary',
      },
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
      colorScheme: {
        bg: 'aucctus-bg-accent-primary',
        border: 'aucctus-border-accent',
        stroke: 'aucctus-stroke-accent-primary',
      },
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
      colorScheme: {
        bg: 'aucctus-bg-success-primary',
        border: 'aucctus-border-success',
        stroke: 'aucctus-stroke-success-primary',
      },
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
      icon: 'link-external',
      colorScheme: {
        bg: 'aucctus-bg-secondary',
        border: 'aucctus-border-secondary',
        stroke: 'aucctus-stroke-secondary',
      },
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
      colorScheme: {
        bg: 'aucctus-bg-tertiary',
        border: 'aucctus-border-tertiary',
        stroke: 'aucctus-stroke-tertiary',
      },
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

// Mock questions data
export const mockQuestions: Record<string, QuestionData[]> = {
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
      priority: 'core',
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
      priority: 'core',
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
      priority: 'core',
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
      priority: 'core',
    },
    {
      id: 'ci-d1',
      question:
        "How does the company's ESOP structure influence strategic decision-making processes?",
      answers: [
        {
          id: 'ad1',
          content:
            'The Employee Stock Ownership Plan (ESOP) structure creates a long-term oriented culture where employees as "partners" have invested interest in company success, leading to more sustainable strategic decisions.',
          source: 'Internal HR Documentation',
          sourceType: 'internal',
          lastUpdated: '2025-01-12T09:15:00Z',
        },
      ],
      isAnswered: true,
      priority: 'deeper',
      cluster: 'organizational-structure',
    },
    {
      id: 'ci-d2',
      question:
        'What are the competitive advantages of the private-label business model versus branded products?',
      answers: [
        {
          id: 'ad2',
          content:
            'Private-label model allows for lower customer acquisition costs, stronger retailer relationships, reduced marketing expenses, and faster innovation cycles by focusing on manufacturing excellence rather than brand building.',
          source: 'Strategy Consulting Report - McKinsey 2024',
          sourceType: 'external',
          lastUpdated: '2025-01-10T16:30:00Z',
        },
      ],
      isAnswered: true,
      priority: 'deeper',
      cluster: 'business-model',
    },
    {
      id: 'ci-d3',
      question:
        'How does the company measure and track progress toward "doing good through food"?',
      answers: [],
      isAnswered: false,
      priority: 'deeper',
      cluster: 'mission-metrics',
    },
    {
      id: 'ci-d4',
      question:
        "What role does sustainability play in the company's competitive positioning?",
      answers: [],
      isAnswered: false,
      priority: 'deeper',
      cluster: 'sustainability-strategy',
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
      priority: 'core',
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
      priority: 'core',
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
      priority: 'core',
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
      priority: 'core',
    },
    {
      id: 'gf-d1',
      question:
        'How does geographic distribution impact supply chain resilience and customer responsiveness?',
      answers: [
        {
          id: 'gfd1',
          content:
            'Multiple geographic locations provide supply chain redundancy, reduced transportation costs, and ability to quickly respond to regional demand fluctuations while maintaining quality standards.',
          source: 'Supply Chain Analysis Report 2024',
          sourceType: 'internal',
          lastUpdated: '2025-01-13T11:10:00Z',
        },
      ],
      isAnswered: true,
      priority: 'deeper',
      cluster: 'supply-chain-strategy',
    },
    {
      id: 'gf-d2',
      question:
        'What criteria determine optimal locations for new facility investments?',
      answers: [],
      isAnswered: false,
      priority: 'deeper',
      cluster: 'expansion-strategy',
    },
    {
      id: 'gf-d3',
      question:
        'How do regulatory differences across regions affect operational complexity?',
      answers: [],
      isAnswered: false,
      priority: 'deeper',
      cluster: 'regulatory-complexity',
    },
  ],
  'corporate-strategy': [
    {
      id: 'cs1',
      question: 'What strategic themes guide growth?',
      answers: [
        {
          id: 'a9',
          content:
            'Growth & Impact priorities; partnering with customers to meet demand and expand capabilities.',
          source: 'AI Reasoning Agent',
          sourceType: 'ai-reasoning',
          lastUpdated: '2025-01-13T12:20:00Z',
        },
      ],
      isAnswered: true,
    },
    {
      id: 'cs2',
      question: 'What strategic initiatives were recently announced?',
      answers: [
        {
          id: 'a10',
          content:
            '$211M process-cheese capacity expansion in Carthage (Dec 2024).',
          source: 'News Article – Dairy Foods Magazine, Dec 2024',
          sourceType: 'external',
          lastUpdated: '2025-01-14T09:30:00Z',
        },
      ],
      isAnswered: true,
    },
    {
      id: 'cs3',
      question: 'Where might strategy constrain/enable innovation?',
      answers: [
        {
          id: 'a11',
          content:
            'Emphasis on customer-brand leadership and responsibility goals (emissions, waste) shapes product, packaging, and operations choices.',
          source: 'Internal Sustainability Deck (2023)',
          sourceType: 'internal',
          lastUpdated: '2025-01-10T16:30:00Z',
        },
      ],
      isAnswered: true,
    },
    {
      id: 'cs4',
      question: 'What macro conditions recently influenced strategy?',
      answers: [],
      isAnswered: false,
    },
  ],
  offerings: [
    {
      id: 'o1',
      question: 'What are the core offerings & formats?',
      answers: [
        {
          id: 'a13',
          content:
            'Cheese, cream cheese, yogurt, beverages; formats include slices, shredded, chunk, bars, cups, tubs, bulk, shelf-stable beverages.',
          source: 'Company Internal – Product Catalog 2024',
          sourceType: 'internal',
          lastUpdated: '2025-01-14T14:15:00Z',
        },
      ],
      isAnswered: true,
    },
    {
      id: 'o2',
      question: 'What differentiating capability matters to offerings?',
      answers: [
        {
          id: 'a14',
          content:
            'Shelf-stable (aseptic) beverages for regions with limited refrigeration and on-the-go use.',
          source: 'AI Reasoning Agent',
          sourceType: 'ai-reasoning',
          lastUpdated: '2025-01-13T16:20:00Z',
        },
      ],
      isAnswered: true,
    },
    {
      id: 'o3',
      question: 'Examples of plant-level capabilities?',
      answers: [],
      isAnswered: false,
    },
    {
      id: 'o4',
      question: 'Notable portfolio moves?',
      answers: [],
      isAnswered: false,
    },
  ],
  customers: [
    {
      id: 'c1',
      question: 'Who are the primary customer segments?',
      answers: [
        {
          id: 'a17',
          content:
            'Retailers, restaurants/foodservice, distributors, and food manufacturers.',
          source: 'AI Reasoning Agent',
          sourceType: 'ai-reasoning',
          lastUpdated: '2025-01-14T12:15:00Z',
        },
      ],
      isAnswered: true,
    },
    {
      id: 'c2',
      question: 'What insight engine supports product decisions?',
      answers: [
        {
          id: 'a18',
          content:
            'Internal consumer-insights team tracking global dairy trends and sharing intel with customers.',
          source: 'Company Internal – Consumer Insights 2024 Report',
          sourceType: 'internal',
          lastUpdated: '2025-01-13T09:30:00Z',
        },
      ],
      isAnswered: true,
    },
    {
      id: 'c3',
      question: 'What market trend is salient to innovation?',
      answers: [],
      isAnswered: false,
    },
    {
      id: 'c4',
      question: 'What adoption factors matter for B2B buyers?',
      answers: [],
      isAnswered: false,
    },
  ],
  brand: [
    {
      id: 'b1',
      question: 'How is the brand positioned?',
      answers: [
        {
          id: 'a21',
          content:
            'Purpose-led, customer-brand partner focused on quality, safety, and helping customers grow.',
          source: 'AI Reasoning Agent',
          sourceType: 'ai-reasoning',
          lastUpdated: '2025-01-14T15:30:00Z',
        },
      ],
      isAnswered: true,
    },
    {
      id: 'b2',
      question: 'Any recent third-party recognition?',
      answers: [],
      isAnswered: false,
    },
    {
      id: 'b3',
      question: 'What equities support innovation credibility?',
      answers: [],
      isAnswered: false,
    },
    {
      id: 'b4',
      question: 'Any brand constraints?',
      answers: [],
      isAnswered: false,
    },
  ],
  'operating-model': [
    {
      id: 'om1',
      question: 'What operating model elements matter most?',
      answers: [
        {
          id: 'a25',
          content:
            'Global manufacturing + distribution network, value-added services, and food safety systems.',
          source: 'AI Reasoning Agent',
          sourceType: 'ai-reasoning',
          lastUpdated: '2025-01-14T11:45:00Z',
        },
      ],
      isAnswered: true,
    },
    {
      id: 'om2',
      question: 'Any standout technical capabilities?',
      answers: [],
      isAnswered: false,
    },
    {
      id: 'om3',
      question: 'What organizational features enable execution?',
      answers: [],
      isAnswered: false,
    },
    {
      id: 'om4',
      question: 'How is safety/quality reinforced externally?',
      answers: [],
      isAnswered: false,
    },
  ],
  financial: [
    {
      id: 'f1',
      question: 'Scale signal relevant to innovation?',
      answers: [
        {
          id: 'a29',
          content: 'Annual sales of $7B+.',
          source: 'Industry Report – Top 100 Dairy Companies 2024',
          sourceType: 'external',
          lastUpdated: '2025-01-14T10:15:00Z',
        },
      ],
      isAnswered: true,
    },
    {
      id: 'f2',
      question: 'Recent capital allocation example?',
      answers: [],
      isAnswered: false,
    },
    {
      id: 'f3',
      question: 'Any adjustments signaling prudence?',
      answers: [],
      isAnswered: false,
    },
    {
      id: 'f4',
      question: 'Where else is capital deployed?',
      answers: [],
      isAnswered: false,
    },
  ],
  ecosystem: [
    {
      id: 'e1',
      question: 'Which partnerships could accelerate innovation?',
      answers: [
        {
          id: 'a33',
          content: 'OpenEnvoy (Autonomous Finance), Brightly (carbon credits).',
          source: 'News Article – Food Industry News, Apr 2025',
          sourceType: 'external',
          lastUpdated: '2025-01-14T13:20:00Z',
        },
      ],
      isAnswered: true,
    },
    {
      id: 'e2',
      question: 'What industry bodies/events show ecosystem role?',
      answers: [],
      isAnswered: false,
    },
    {
      id: 'e3',
      question: 'Distribution/retail ecosystem posture?',
      answers: [],
      isAnswered: false,
    },
  ],
  'innovation-capability': [
    {
      id: 'ic1',
      question: 'How is innovation governed or resourced?',
      answers: [
        {
          id: 'a36',
          content: 'Value-added services + corporate ventures posture.',
          source: 'Company Internal – Innovation Governance Deck (2024)',
          sourceType: 'internal',
          lastUpdated: '2025-01-14T16:15:00Z',
        },
      ],
      isAnswered: true,
    },
    {
      id: 'ic2',
      question: 'Evidence of execution speed?',
      answers: [],
      isAnswered: false,
    },
    {
      id: 'ic3',
      question: 'Current risk posture signal?',
      answers: [],
      isAnswered: false,
    },
    {
      id: 'ic4',
      question: 'Culture markers?',
      answers: [],
      isAnswered: false,
    },
  ],
};

// Category goals for each category
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

// AI Summaries for each category based on answered questions
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

export const mockSources: ISource[] = [
  {
    uuid: '1a2b3c',
    title: 'OpenAI Blog',
    url: 'https://openai.com/blog',
    classification: 'technology',
  },
  {
    uuid: '4d5e6f',
    title: 'Harvard Business Review',
    url: 'https://hbr.org',
    classification: 'business',
  },
  {
    uuid: '7g8h9i',
    title: 'National Geographic',
    url: 'https://www.nationalgeographic.com',
    classification: 'science',
  },
];

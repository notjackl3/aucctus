/**
 * POC Plan Mock Data Fixtures
 *
 * These fixtures provide realistic data for the Proof of Concept Plan feature.
 * The data is designed for corporate innovation experts evaluating concepts
 * for potential investment and development.
 */

import type {
  IPocPlan,
  IPocExecutiveSummary,
  IPocObjective,
  IPocMilestone,
  IPocResource,
  IPocRisk,
  IPocSuccessMetric,
  IPocTimelinePhase,
  IPocNextStep,
} from '../types';

// ============================================
// Mock Executive Summary
// ============================================

export const mockExecutiveSummary: IPocExecutiveSummary = {
  overview:
    'This Proof of Concept will validate the core technical feasibility and market demand for the proposed solution over a 12-week period. The POC focuses on demonstrating key differentiators with a select group of pilot customers while establishing preliminary unit economics.',
  strategicRationale:
    'Market analysis indicates a significant opportunity window of 18-24 months before competitors reach feature parity. Early validation through this POC will de-risk the investment thesis and inform the go-to-market strategy for the full product launch.',
  expectedOutcome:
    'By the end of this POC, we will have validated the core value proposition with 3-5 pilot customers, demonstrated technical feasibility of key features, and established preliminary unit economics to support the business case for full development.',
  investmentRequired:
    'Total POC investment estimated at $275,000, including personnel ($180,000), technology infrastructure ($45,000), and pilot customer support ($50,000).',
  decisionCriteria:
    'Go/No-Go decision will be based on achieving 70%+ pilot customer satisfaction, technical milestone completion, and validated unit economics showing path to profitability within 24 months of launch.',
};

// ============================================
// Mock Objectives
// ============================================

export const mockObjectives: IPocObjective[] = [
  {
    uuid: 'obj-001',
    title: 'Validate Core Value Proposition',
    description:
      'Confirm that the proposed solution delivers measurable value to target customers by solving their primary pain points more effectively than existing alternatives.',
    hypothesisToValidate:
      'Target customers will experience at least 30% improvement in key workflow efficiency when using our solution compared to their current process.',
    successCriteria:
      '70% or more of pilot customers report satisfaction scores of 8+ out of 10, with documented efficiency improvements.',
    order: 1,
  },
  {
    uuid: 'obj-002',
    title: 'Demonstrate Technical Feasibility',
    description:
      'Prove that the core technical architecture can support the proposed feature set at the required performance levels and scale.',
    hypothesisToValidate:
      'The technical solution can process customer data within acceptable latency thresholds (<2 seconds) while maintaining 99.5% uptime.',
    successCriteria:
      'Successful completion of all technical milestones with performance benchmarks meeting or exceeding target specifications.',
    order: 2,
  },
  {
    uuid: 'obj-003',
    title: 'Establish Unit Economics',
    description:
      'Validate that the solution can be delivered profitably by establishing preliminary cost structures and willingness-to-pay data.',
    hypothesisToValidate:
      'Customer acquisition cost (CAC) can be achieved at <$500 per customer with average revenue per user (ARPU) of $150/month.',
    successCriteria:
      'Documented CAC and ARPU data from pilot program showing positive unit economics trajectory.',
    order: 3,
  },
  {
    uuid: 'obj-004',
    title: 'Identify Product-Market Fit Signals',
    description:
      'Gather qualitative and quantitative evidence of product-market fit through customer engagement metrics and feedback.',
    hypothesisToValidate:
      'Pilot customers will demonstrate organic engagement patterns indicating genuine product utility rather than novelty usage.',
    successCriteria:
      'Daily active usage rate of 60%+ among pilot users, with at least 2 unsolicited referrals from pilot customers.',
    order: 4,
  },
];

// ============================================
// Mock Milestones
// ============================================

export const mockMilestones: IPocMilestone[] = [
  {
    uuid: 'ms-001',
    title: 'POC Kickoff & Planning',
    description:
      'Complete POC planning, finalize pilot customer agreements, and establish project governance.',
    deliverables: [
      'Signed pilot customer agreements (3-5 customers)',
      'Detailed POC project plan with resource allocation',
      'Success metrics dashboard setup',
      'Stakeholder communication plan',
    ],
    dependencies: [],
    status: 'not_started',
    weekNumber: 1,
    order: 1,
  },
  {
    uuid: 'ms-002',
    title: 'Technical Foundation',
    description:
      'Deploy core infrastructure, establish development environment, and implement foundational architecture.',
    deliverables: [
      'Cloud infrastructure provisioned',
      'CI/CD pipeline operational',
      'Core API framework deployed',
      'Security baseline established',
    ],
    dependencies: ['ms-001'],
    status: 'not_started',
    weekNumber: 3,
    order: 2,
  },
  {
    uuid: 'ms-003',
    title: 'MVP Feature Set Complete',
    description:
      'Complete development of minimum viable feature set required for pilot customer testing.',
    deliverables: [
      'Core features implemented and tested',
      'User interface functional',
      'Integration points operational',
      'Initial documentation complete',
    ],
    dependencies: ['ms-002'],
    status: 'not_started',
    weekNumber: 6,
    order: 3,
  },
  {
    uuid: 'ms-004',
    title: 'Pilot Customer Onboarding',
    description:
      'Onboard all pilot customers, provide training, and begin active usage monitoring.',
    deliverables: [
      'All pilot customers onboarded',
      'Training materials delivered',
      'Usage tracking active',
      'Feedback channels established',
    ],
    dependencies: ['ms-003'],
    status: 'not_started',
    weekNumber: 8,
    order: 4,
  },
  {
    uuid: 'ms-005',
    title: 'Mid-POC Review',
    description:
      'Conduct comprehensive review of progress, gather initial customer feedback, and adjust approach as needed.',
    deliverables: [
      'Customer satisfaction survey results',
      'Technical performance report',
      'Risk assessment update',
      'Adjustment recommendations',
    ],
    dependencies: ['ms-004'],
    status: 'not_started',
    weekNumber: 9,
    order: 5,
  },
  {
    uuid: 'ms-006',
    title: 'Feature Iteration & Enhancement',
    description:
      'Implement priority feature enhancements based on pilot customer feedback.',
    deliverables: [
      'Priority feature updates deployed',
      'Performance optimizations applied',
      'UX improvements implemented',
      'Bug fixes completed',
    ],
    dependencies: ['ms-005'],
    status: 'not_started',
    weekNumber: 10,
    order: 6,
  },
  {
    uuid: 'ms-007',
    title: 'Final Validation & Documentation',
    description:
      'Complete final customer validation interviews, compile all POC data, and prepare go/no-go recommendation.',
    deliverables: [
      'Final customer satisfaction scores',
      'Complete technical validation report',
      'Unit economics analysis',
      'Go/No-Go recommendation document',
    ],
    dependencies: ['ms-006'],
    status: 'not_started',
    weekNumber: 12,
    order: 7,
  },
];

// ============================================
// Mock Resources
// ============================================

export const mockResources: IPocResource[] = [
  {
    uuid: 'res-001',
    category: 'personnel',
    name: 'Technical Lead',
    description:
      'Senior engineer to lead technical architecture and development. Full-time dedication required.',
    estimatedCost: 60000,
    quantity: 1,
    unit: 'FTE',
    isRequired: true,
  },
  {
    uuid: 'res-002',
    category: 'personnel',
    name: 'Full-Stack Developers',
    description:
      'Developers for feature implementation and testing. Mix of frontend and backend skills.',
    estimatedCost: 80000,
    quantity: 2,
    unit: 'FTE',
    isRequired: true,
  },
  {
    uuid: 'res-003',
    category: 'personnel',
    name: 'Product Manager',
    description:
      'Part-time PM for customer liaison, requirements management, and success metric tracking.',
    estimatedCost: 25000,
    quantity: 0.5,
    unit: 'FTE',
    isRequired: true,
  },
  {
    uuid: 'res-004',
    category: 'personnel',
    name: 'UX Designer',
    description:
      'Part-time designer for user interface and experience optimization.',
    estimatedCost: 15000,
    quantity: 0.25,
    unit: 'FTE',
    isRequired: false,
  },
  {
    uuid: 'res-005',
    category: 'technology',
    name: 'Cloud Infrastructure',
    description: 'AWS/GCP resources for development and staging environments.',
    estimatedCost: 25000,
    isRequired: true,
  },
  {
    uuid: 'res-006',
    category: 'technology',
    name: 'Third-Party APIs & Services',
    description:
      'External service subscriptions for analytics, monitoring, and integrations.',
    estimatedCost: 12000,
    isRequired: true,
  },
  {
    uuid: 'res-007',
    category: 'technology',
    name: 'Development Tools',
    description:
      'Software licenses for development, testing, and collaboration tools.',
    estimatedCost: 8000,
    isRequired: true,
  },
  {
    uuid: 'res-008',
    category: 'budget',
    name: 'Pilot Customer Incentives',
    description:
      'Budget for pilot customer discounts, incentives, and support costs.',
    estimatedCost: 30000,
    isRequired: true,
  },
  {
    uuid: 'res-009',
    category: 'budget',
    name: 'Contingency Reserve',
    description:
      '10% contingency buffer for unexpected costs or scope adjustments.',
    estimatedCost: 20000,
    isRequired: false,
  },
  {
    uuid: 'res-010',
    category: 'external',
    name: 'Advisory Support',
    description:
      'Industry expert advisory hours for domain expertise and validation.',
    estimatedCost: undefined,
    quantity: 20,
    unit: 'hours',
    isRequired: false,
  },
];

// ============================================
// Mock Risks
// ============================================

export const mockRisks: IPocRisk[] = [
  {
    uuid: 'risk-001',
    title: 'Pilot Customer Recruitment Challenges',
    description:
      'Difficulty securing 3-5 committed pilot customers within the required timeframe could delay the POC or reduce sample size validity.',
    category: 'market',
    severity: 'high',
    likelihood: 'possible',
    mitigationStrategy:
      'Begin customer outreach immediately with multiple candidates. Offer meaningful incentives and ensure clear value proposition communication.',
    contingencyPlan:
      'If recruitment falls short, extend timeline by 2 weeks or proceed with smaller sample with adjusted success criteria.',
    owner: 'Product Manager',
  },
  {
    uuid: 'risk-002',
    title: 'Technical Complexity Underestimation',
    description:
      'Core technical challenges may prove more complex than anticipated, causing timeline delays or feature scope reduction.',
    category: 'technical',
    severity: 'high',
    likelihood: 'possible',
    mitigationStrategy:
      'Build 20% buffer into technical estimates. Conduct early technical spikes for highest-risk features. Maintain prioritized feature backlog for scope flexibility.',
    contingencyPlan:
      'Implement feature triage protocol with clear MoSCoW prioritization. Non-critical features can be deferred without impacting POC validity.',
  },
  {
    uuid: 'risk-003',
    title: 'Low Customer Engagement',
    description:
      'Pilot customers may not actively use the solution, limiting the quality of validation data.',
    category: 'market',
    severity: 'medium',
    likelihood: 'possible',
    mitigationStrategy:
      'Implement weekly check-ins with pilot customers. Create engagement incentives tied to usage milestones. Provide white-glove support.',
    contingencyPlan:
      'If engagement is low, conduct deep-dive interviews to understand barriers and pivot approach or accept limited validation scope.',
    owner: 'Customer Success',
  },
  {
    uuid: 'risk-004',
    title: 'Resource Availability',
    description:
      'Key team members may be pulled to other priorities, reducing POC velocity or quality.',
    category: 'operational',
    severity: 'medium',
    likelihood: 'unlikely',
    mitigationStrategy:
      'Secure explicit commitments from resource managers. Document resource allocation in project charter with executive sign-off.',
    contingencyPlan:
      'Identify backup resources in advance. Have contractor relationships ready to activate if needed.',
  },
  {
    uuid: 'risk-005',
    title: 'Competitive Response',
    description:
      'Competitors may launch similar features during POC period, potentially impacting customer interest or validation results.',
    category: 'market',
    severity: 'medium',
    likelihood: 'unlikely',
    mitigationStrategy:
      'Monitor competitive landscape weekly. Focus on unique differentiators. Build customer relationships beyond feature comparison.',
    contingencyPlan:
      'Adjust positioning if needed. Accelerate timeline for high-priority differentiating features.',
  },
  {
    uuid: 'risk-006',
    title: 'Data Privacy & Compliance',
    description:
      'Handling customer data may trigger compliance requirements that add complexity or delay.',
    category: 'regulatory',
    severity: 'high',
    likelihood: 'unlikely',
    mitigationStrategy:
      'Conduct privacy impact assessment early. Ensure legal review of data handling practices. Use anonymized or synthetic data where possible.',
    contingencyPlan:
      'Reduce data scope or implement additional safeguards if compliance issues arise.',
    owner: 'Legal/Compliance',
  },
];

// ============================================
// Mock Success Metrics
// ============================================

export const mockSuccessMetrics: IPocSuccessMetric[] = [
  {
    uuid: 'metric-001',
    name: 'Customer Satisfaction Score',
    description:
      'Average satisfaction rating from pilot customers based on structured survey.',
    targetValue: '8.0',
    currentValue: undefined,
    unit: 'out of 10',
    measurementMethod:
      'Bi-weekly NPS-style survey with 1-10 rating and open-ended feedback.',
    frequency: 'weekly',
    isGoNoGoCriteria: true,
  },
  {
    uuid: 'metric-002',
    name: 'Daily Active Usage Rate',
    description:
      'Percentage of pilot users who engage with the solution on a daily basis.',
    targetValue: '60',
    currentValue: undefined,
    unit: '%',
    measurementMethod:
      'Product analytics tracking of unique daily sessions per user.',
    frequency: 'daily',
    isGoNoGoCriteria: true,
  },
  {
    uuid: 'metric-003',
    name: 'Core Feature Completion',
    description:
      'Percentage of planned MVP features successfully implemented and tested.',
    targetValue: '100',
    currentValue: undefined,
    unit: '%',
    measurementMethod:
      'Sprint tracking of completed vs planned features from backlog.',
    frequency: 'milestone',
    isGoNoGoCriteria: true,
  },
  {
    uuid: 'metric-004',
    name: 'System Uptime',
    description: 'Availability of the solution during the active pilot period.',
    targetValue: '99.5',
    currentValue: undefined,
    unit: '%',
    measurementMethod:
      'Automated monitoring with incident tracking for downtime events.',
    frequency: 'daily',
    isGoNoGoCriteria: false,
  },
  {
    uuid: 'metric-005',
    name: 'Customer Referral Intent',
    description:
      'Number of pilot customers willing to recommend the solution to others.',
    targetValue: '2',
    currentValue: undefined,
    unit: 'referrals',
    measurementMethod:
      'Direct question in customer feedback sessions and surveys.',
    frequency: 'end_of_poc',
    isGoNoGoCriteria: false,
  },
  {
    uuid: 'metric-006',
    name: 'Time-to-Value',
    description:
      'Average time for pilot customers to realize first meaningful value from the solution.',
    targetValue: '14',
    currentValue: undefined,
    unit: 'days',
    measurementMethod:
      'Time from onboarding completion to first documented value realization.',
    frequency: 'milestone',
    isGoNoGoCriteria: false,
  },
  {
    uuid: 'metric-007',
    name: 'Validated Unit Economics',
    description:
      'Confirmation that CAC and ARPU data supports viable business model.',
    targetValue: 'Positive',
    currentValue: undefined,
    unit: 'trajectory',
    measurementMethod:
      'Financial analysis comparing customer acquisition costs against projected lifetime value.',
    frequency: 'end_of_poc',
    isGoNoGoCriteria: true,
  },
];

// ============================================
// Mock Timeline Phases
// ============================================

export const mockTimelinePhases: IPocTimelinePhase[] = [
  {
    uuid: 'phase-001',
    name: 'Foundation',
    description: 'Planning, setup, and technical foundation.',
    startWeek: 1,
    endWeek: 3,
    color: '#6366F1', // Indigo
    milestoneIds: ['ms-001', 'ms-002'],
  },
  {
    uuid: 'phase-002',
    name: 'Development',
    description: 'Core feature development and testing.',
    startWeek: 4,
    endWeek: 6,
    color: '#8B5CF6', // Purple
    milestoneIds: ['ms-003'],
  },
  {
    uuid: 'phase-003',
    name: 'Pilot',
    description: 'Customer onboarding and active pilot period.',
    startWeek: 7,
    endWeek: 9,
    color: '#EC4899', // Pink
    milestoneIds: ['ms-004', 'ms-005'],
  },
  {
    uuid: 'phase-004',
    name: 'Validation',
    description: 'Iteration, validation, and final assessment.',
    startWeek: 10,
    endWeek: 12,
    color: '#14B8A6', // Teal
    milestoneIds: ['ms-006', 'ms-007'],
  },
];

// ============================================
// Mock Next Steps
// ============================================

export const mockNextSteps: IPocNextStep[] = [
  {
    uuid: 'next-001',
    title: 'Finalize Pilot Customer List',
    description:
      'Complete outreach and secure commitments from 3-5 target pilot customers.',
    assignee: 'Product Manager',
    dueDate: '2024-02-15',
    order: 1,
  },
  {
    uuid: 'next-002',
    title: 'Establish Project Governance',
    description:
      'Set up weekly steering committee meetings and reporting cadence.',
    assignee: 'Project Lead',
    dueDate: '2024-02-08',
    order: 2,
  },
  {
    uuid: 'next-003',
    title: 'Provision Development Environment',
    description:
      'Set up cloud infrastructure and development toolchain for the team.',
    assignee: 'Technical Lead',
    dueDate: '2024-02-12',
    order: 3,
  },
  {
    uuid: 'next-004',
    title: 'Finalize Success Metrics Dashboard',
    description:
      'Implement tracking and visualization for all POC success metrics.',
    assignee: 'Technical Lead',
    dueDate: '2024-02-19',
    order: 4,
  },
  {
    uuid: 'next-005',
    title: 'Schedule Kickoff Meeting',
    description:
      'Coordinate stakeholder availability and prepare kickoff presentation.',
    assignee: 'Product Manager',
    dueDate: '2024-02-05',
    order: 5,
  },
];

// ============================================
// Complete Mock POC Plan
// ============================================

export const mockPocPlan: IPocPlan = {
  uuid: 'poc-plan-001',
  conceptRootUuid: 'concept-001',
  conceptIdentifier: 'ABC123',
  status: 'complete',

  executiveSummary: mockExecutiveSummary,
  objectives: mockObjectives,
  milestones: mockMilestones,
  resources: mockResources,
  risks: mockRisks,
  successMetrics: mockSuccessMetrics,

  totalWeeks: 12,
  timelinePhases: mockTimelinePhases,

  nextSteps: mockNextSteps,
  goNoGoDate: '2024-05-15',

  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  version: 1,
};

// ============================================
// Helper: Generate POC Plan for a Concept
// ============================================

export const generateMockPocPlan = (
  conceptRootUuid: string,
  conceptIdentifier: string,
): IPocPlan => {
  return {
    ...mockPocPlan,
    uuid: `poc-plan-${Date.now()}`,
    conceptRootUuid,
    conceptIdentifier,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
};

// ============================================
// Mock Generation Progress Stages
// ============================================

export const mockGenerationStages = [
  { stage: 'analyzing', progress: 10, message: 'Analyzing concept data...' },
  {
    stage: 'generating_objectives',
    progress: 25,
    message: 'Generating objectives...',
  },
  {
    stage: 'generating_milestones',
    progress: 45,
    message: 'Creating milestone plan...',
  },
  {
    stage: 'generating_resources',
    progress: 60,
    message: 'Estimating resources...',
  },
  { stage: 'generating_risks', progress: 80, message: 'Assessing risks...' },
  {
    stage: 'finalizing',
    progress: 95,
    message: 'Finalizing POC plan...',
  },
] as const;

import { AssumptionCategory } from '@libs/api/types';

// Unified Assumption type that combines properties from both files
export interface Assumption {
  id: string;
  description?: string; // Used in Testing.tsx
  statement?: string; // Used in AssumptionsV2.tsx
  category: string | AssumptionCategory;
  confidence?: number;
  certainty?: number;
  importance?: number;
  impactPoints?: number;
  risk: number | 'high' | 'medium' | 'low';
  status: 'validated' | 'partially_validated' | 'invalidated' | 'untested';
  validationPercentage?: number;
  tests?: AssumptionTest[];
  priority?: 'critical' | 'high' | 'medium' | 'low';
}

export interface AssumptionTest {
  id: string;
  name: string;
  type: 'survey' | 'interview' | 'prototype' | 'experiment' | 'other';
  date: string;
  result: 'validated' | 'partially_validated' | 'invalidated' | 'untested';
}

export interface Test {
  id: string;
  testName: string;
  description: string;
  type: 'recommended' | 'manual';
  status: 'completed' | 'in-progress' | 'planned';
  assumptions: Assumption[];
  date?: string;
  results?: TestResult;
}

export interface TestResult {
  status: 'validated' | 'invalidated' | 'mixed';
  summary: string;
  learnings: string[];
  nextSteps?: string[];
}

export interface RecommendedTest {
  testName: string;
  description: string;
  assumptions: Assumption[];
}

// Shared sample assumptions data
export const sampleAssumptions: Assumption[] = [
  // Desirability assumptions
  {
    id: 'd1',
    statement:
      'People want high-protein snacks that fit into their active lifestyles.',
    description:
      'People want high-protein snacks that fit into their active lifestyles.',
    category: 'desirability',
    status: 'validated',
    risk: 'low',
    certainty: 85,
    confidence: 85,
    importance: 90,
    impactPoints: 8,
    validationPercentage: 85,
    tests: [
      {
        id: 'test-d1',
        name: 'Consumer Survey',
        type: 'survey',
        date: new Date().toISOString(),
        result: 'validated',
      },
    ],
    priority: 'high',
  },
  {
    id: 'd2',
    statement:
      'Customers will choose cheese snacks over meat-based protein options.',
    description:
      'Customers will choose cheese snacks over meat-based protein options.',
    category: 'desirability',
    status: 'partially_validated',
    risk: 'medium',
    certainty: 65,
    confidence: 65,
    importance: 85,
    impactPoints: 7,
    validationPercentage: 65,
    tests: [
      {
        id: 'test-d2',
        name: 'Taste Test',
        type: 'other',
        date: new Date().toISOString(),
        result: 'partially_validated',
      },
    ],
    priority: 'critical',
  },
  {
    id: 'd3',
    statement:
      'Target customers will pay more for better quality protein snacks.',
    description:
      'Target customers will pay more for better quality protein snacks.',
    category: 'desirability',
    status: 'untested',
    risk: 'high',
    certainty: 40,
    confidence: 40,
    importance: 75,
    impactPoints: 6,
    validationPercentage: 40,
    tests: [],
    priority: 'medium',
  },

  // Viability assumptions
  {
    id: 'v1',
    statement:
      'Each unit can sell for at least $7 and still make enough profit.',
    description:
      'Each unit can sell for at least $7 and still make enough profit.',
    category: 'viability',
    status: 'partially_validated',
    risk: 'medium',
    certainty: 60,
    confidence: 60,
    importance: 95,
    impactPoints: 9,
    validationPercentage: 60,
    tests: [
      {
        id: 'test-v1',
        name: 'Financial Analysis',
        type: 'other',
        date: new Date().toISOString(),
        result: 'partially_validated',
      },
    ],
    priority: 'critical',
  },
  {
    id: 'v2',
    statement:
      'Selling directly to consumers online will be cost-effective for acquiring customers.',
    description:
      'Selling directly to consumers online will be cost-effective for acquiring customers.',
    category: 'viability',
    status: 'invalidated',
    risk: 'high',
    certainty: 70,
    confidence: 70,
    importance: 80,
    impactPoints: 7,
    validationPercentage: 0,
    tests: [
      {
        id: 'test-v2',
        name: 'Marketing Test',
        type: 'other',
        date: new Date().toISOString(),
        result: 'invalidated',
      },
    ],
    priority: 'high',
  },

  // Feasibility assumptions
  {
    id: 'f1',
    statement:
      'The product can be made using existing manufacturing equipment.',
    description:
      'The product can be made using existing manufacturing equipment.',
    category: 'feasibility',
    status: 'validated',
    risk: 'low',
    certainty: 90,
    confidence: 90,
    importance: 100,
    impactPoints: 10,
    validationPercentage: 90,
    tests: [
      {
        id: 'test-f1',
        name: 'Manufacturing Pilot',
        type: 'other',
        date: new Date().toISOString(),
        result: 'validated',
      },
    ],
    priority: 'critical',
  },
  {
    id: 'f2',
    statement:
      "The product will stay fresh for the entire shelf life we're promising.",
    description:
      "The product will stay fresh for the entire shelf life we're promising.",
    category: 'feasibility',
    status: 'untested',
    risk: 'medium',
    certainty: 40,
    confidence: 40,
    importance: 90,
    impactPoints: 9,
    validationPercentage: 40,
    tests: [],
    priority: 'high',
  },
  {
    id: 'f3',
    statement:
      'Suppliers can provide good quality ingredients in the amounts needed.',
    description:
      'Suppliers can provide good quality ingredients in the amounts needed.',
    category: 'feasibility',
    status: 'partially_validated',
    risk: 'low',
    certainty: 75,
    confidence: 75,
    importance: 80,
    impactPoints: 8,
    validationPercentage: 75,
    tests: [
      {
        id: 'test-f3',
        name: 'Supplier Assessment',
        type: 'other',
        date: new Date().toISOString(),
        result: 'partially_validated',
      },
    ],
    priority: 'medium',
  },

  // Adaptability assumptions
  {
    id: 'a1',
    statement:
      'The business can quickly adjust to new food safety regulations if they change.',
    description:
      'The business can quickly adjust to new food safety regulations if they change.',
    category: 'adaptability',
    status: 'partially_validated',
    risk: 'medium',
    certainty: 65,
    confidence: 65,
    importance: 85,
    impactPoints: 8,
    validationPercentage: 65,
    tests: [
      {
        id: 'test-a1',
        name: 'Regulatory Review',
        type: 'other',
        date: new Date().toISOString(),
        result: 'partially_validated',
      },
    ],
    priority: 'high',
  },
  {
    id: 'a2',
    statement:
      'The recipe can be changed if ingredient costs go up significantly.',
    description:
      'The recipe can be changed if ingredient costs go up significantly.',
    category: 'adaptability',
    status: 'untested',
    risk: 'high',
    certainty: 30,
    confidence: 30,
    importance: 75,
    impactPoints: 7,
    validationPercentage: 30,
    tests: [],
    priority: 'medium',
  },
];

// Sample tests data
export const sampleTests: Test[] = [
  {
    id: '1',
    testName: 'Pricing Survey',
    description: 'Survey to validate customer pricing assumptions',
    type: 'manual',
    status: 'completed',
    date: '2023-05-15',
    assumptions: [sampleAssumptions[0]], // d1
    results: {
      status: 'validated',
      summary:
        'Survey showed 68% of target customers would pay the proposed price',
      learnings: [
        'Price point is acceptable',
        'Higher tier options could be explored',
      ],
      nextSteps: ['Develop pricing tiers', 'Test premium features'],
    },
  },
  {
    id: '2',
    testName: 'Market Size Analysis',
    description: 'Research to validate market size assumptions',
    type: 'recommended',
    status: 'in-progress',
    date: '2023-06-10',
    assumptions: [sampleAssumptions[2]], // d3
  },
];

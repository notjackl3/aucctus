import {
  IImpactSizingAssumptionEntryV2,
  ImpactSizingUnit,
  ImpactSizingOperator,
} from '@libs/api/types/concept/financialProjectionV2';

// Helper function to create base impact sizing assumption
const createBaseImpactAssumption = (
  overrides: Partial<IImpactSizingAssumptionEntryV2>,
): IImpactSizingAssumptionEntryV2 => ({
  uuid: Math.random().toString(36).substr(2, 9),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  impactSizing: 'impact-sizing-uuid',
  order: 0,
  scalar: 0,
  unit: '$' as ImpactSizingUnit,
  unitDescription: 'Dollar amount',
  title: 'Test Impact Assumption',
  description: 'Test impact assumption description',
  impactAssumptionSources: [],
  ...overrides,
});

// 1. WORKING IMPACT EQUATION - Basic cost reduction calculation
// Expected: 500 * 12 * 52 * 5 = 1,560,000
export const MOCK_WORKING_IMPACT_EQUATION: IImpactSizingAssumptionEntryV2[] = [
  createBaseImpactAssumption({
    uuid: 'impact-1',
    order: 1,
    scalar: 500,
    unit: '$',
    unitDescription: 'Cost reduction per process',
    operator: '*',
    title: 'Process Cost Reduction',
    description: 'Cost reduction per automated process',
  }),
  createBaseImpactAssumption({
    uuid: 'impact-2',
    order: 2,
    scalar: 12,
    unit: 'magnitude',
    unitDescription: 'Number of processes automated',
    operator: '*',
    title: 'Automated Processes',
    description: 'Number of processes automated per month',
  }),
  createBaseImpactAssumption({
    uuid: 'impact-3',
    order: 3,
    scalar: 52,
    unit: 'magnitude',
    unitDescription: 'Weeks per year',
    operator: '*',
    title: 'Weeks per Year',
    description: 'Operating weeks per year',
  }),
  createBaseImpactAssumption({
    uuid: 'impact-4',
    order: 4,
    scalar: 5,
    unit: 'magnitude',
    unitDescription: 'Efficiency multiplier',
    title: 'Efficiency Multiplier',
    description: 'Process efficiency improvement factor',
  }),
];

// 2. BROKEN IMPACT EQUATION - Division by zero
// Expected: 100000 / 0 = Infinity (or error in calculation)
export const MOCK_BROKEN_IMPACT_EQUATION: IImpactSizingAssumptionEntryV2[] = [
  createBaseImpactAssumption({
    uuid: 'broken-impact-1',
    order: 1,
    scalar: 100000,
    unit: '$',
    unitDescription: 'Total operational cost',
    operator: '/',
    title: 'Total Operational Cost',
    description: 'Total operational cost to be saved',
  }),
  createBaseImpactAssumption({
    uuid: 'broken-impact-2',
    order: 2,
    scalar: 0,
    unit: 'magnitude',
    unitDescription: 'Number of implementations',
    title: 'Implementation Count',
    description: 'Number of implementations (zero causes division by zero)',
  }),
];

// 3. PERCENTAGE IMPACT HANDLING - Mix of percentages and amounts
// Expected: 2000000 * (25/100) * 1.5 = 2000000 * 0.25 * 1.5 = 750,000
export const MOCK_PERCENTAGE_IMPACT_EQUATION: IImpactSizingAssumptionEntryV2[] =
  [
    createBaseImpactAssumption({
      uuid: 'percent-impact-1',
      order: 1,
      scalar: 2000000,
      unit: '$',
      unitDescription: 'Total operational budget',
      operator: '*',
      title: 'Total Operational Budget',
      description: 'Total annual operational budget',
    }),
    createBaseImpactAssumption({
      uuid: 'percent-impact-2',
      order: 2,
      scalar: 25,
      unit: '%',
      unitDescription: 'Percentage cost reduction',
      operator: '*',
      title: 'Cost Reduction Percentage',
      description: 'Percentage of costs that can be reduced',
    }),
    createBaseImpactAssumption({
      uuid: 'percent-impact-3',
      order: 3,
      scalar: 1.5,
      unit: 'magnitude',
      unitDescription: 'Impact multiplier',
      title: 'Impact Multiplier',
      description: 'Additional impact from process improvements',
    }),
  ];

// 4. PARENTHETICAL IMPACT OPERATIONS - Complex cost reduction logic
// Expected: (1000 + 500) * (200 - 50) * 10 = 1500 * 150 * 10 = 2,250,000
export const MOCK_PARENTHETICAL_IMPACT_EQUATION: IImpactSizingAssumptionEntryV2[] =
  [
    createBaseImpactAssumption({
      uuid: 'paren-impact-1',
      order: 1,
      scalar: 1000,
      unit: '$',
      unitDescription: 'Base labor cost reduction',
      operator: '(+)',
      title: 'Base Labor Cost Reduction',
      description: 'Base labor cost reduction per unit',
    }),
    createBaseImpactAssumption({
      uuid: 'paren-impact-2',
      order: 2,
      scalar: 500,
      unit: '$',
      unitDescription: 'Additional material savings',
      operator: '*',
      title: 'Material Cost Reduction',
      description: 'Additional material cost reduction',
    }),
    createBaseImpactAssumption({
      uuid: 'paren-impact-3',
      order: 3,
      scalar: 200,
      unit: 'magnitude',
      unitDescription: 'Processing time saved',
      operator: '(-)',
      title: 'Time Savings (Hours)',
      description: 'Hours of processing time saved',
    }),
    createBaseImpactAssumption({
      uuid: 'paren-impact-4',
      order: 4,
      scalar: 50,
      unit: 'magnitude',
      unitDescription: 'Overhead time reduction',
      operator: '*',
      title: 'Overhead Reduction (Hours)',
      description: 'Hours of overhead time reduced',
    }),
    createBaseImpactAssumption({
      uuid: 'paren-impact-5',
      order: 5,
      scalar: 10,
      unit: 'magnitude',
      unitDescription: 'Implementation scale',
      title: 'Implementation Scale',
      description: 'Scale factor for implementation',
    }),
  ];

// 5. MALFORMED IMPACT OPERATORS - Invalid operators
// Expected: Error - Invalid JavaScript expression with malformed operators
export const MOCK_MALFORMED_IMPACT_OPERATORS: IImpactSizingAssumptionEntryV2[] =
  [
    createBaseImpactAssumption({
      uuid: 'malformed-impact-1',
      order: 1,
      scalar: 50000,
      unit: '$',
      unitDescription: 'Base cost savings',
      operator: '***' as ImpactSizingOperator, // Invalid operator
      title: 'Base Cost Savings',
      description: 'Base cost savings with invalid operator',
    }),
    createBaseImpactAssumption({
      uuid: 'malformed-impact-2',
      order: 2,
      scalar: 10,
      unit: 'magnitude',
      unitDescription: 'Multiplier factor',
      operator: '??' as ImpactSizingOperator, // Invalid operator
      title: 'Multiplier Factor',
      description: 'Multiplier factor with invalid operator',
    }),
    createBaseImpactAssumption({
      uuid: 'malformed-impact-3',
      order: 3,
      scalar: 2,
      unit: 'magnitude',
      unitDescription: 'Final multiplier',
      title: 'Final Multiplier',
      description: 'Final multiplier value',
    }),
  ];

// 6. NEGATIVE IMPACT NUMBERS - Testing negative cost impacts
// Expected: 10000 + (-2000) * 3 = 10000 + (-6000) = 4000
export const MOCK_NEGATIVE_IMPACT_NUMBERS: IImpactSizingAssumptionEntryV2[] = [
  createBaseImpactAssumption({
    uuid: 'negative-impact-1',
    order: 1,
    scalar: 10000,
    unit: '$',
    unitDescription: 'Positive cost savings',
    operator: '+',
    title: 'Positive Cost Savings',
    description: 'Positive cost savings amount',
  }),
  createBaseImpactAssumption({
    uuid: 'negative-impact-2',
    order: 2,
    scalar: -2000,
    unit: '$',
    unitDescription: 'Implementation cost',
    operator: '*',
    title: 'Implementation Cost',
    description: 'Negative cost (implementation expense)',
  }),
  createBaseImpactAssumption({
    uuid: 'negative-impact-3',
    order: 3,
    scalar: 3,
    unit: 'magnitude',
    unitDescription: 'Implementation instances',
    title: 'Implementation Count',
    description: 'Number of implementations',
  }),
];

// 7. LARGE IMPACT NUMBERS - Testing overflow scenarios
// Expected: 999999999999999 * 999999999999999 = 9.999999999999978e+29 (potential overflow)
export const MOCK_LARGE_IMPACT_NUMBERS: IImpactSizingAssumptionEntryV2[] = [
  createBaseImpactAssumption({
    uuid: 'large-impact-1',
    order: 1,
    scalar: 999999999999999,
    unit: '$',
    unitDescription: 'Extremely large cost base',
    operator: '*',
    title: 'Extremely Large Cost Base',
    description: 'Extremely large cost base for testing',
  }),
  createBaseImpactAssumption({
    uuid: 'large-impact-2',
    order: 2,
    scalar: 999999999999999,
    unit: 'magnitude',
    unitDescription: 'Extremely large multiplier',
    title: 'Extremely Large Multiplier',
    description: 'Extremely large multiplier for testing',
  }),
];

// 8. DECIMAL PRECISION IMPACT - Testing floating point issues
// Expected: 0.1 + 0.2 + 0.3 = 0.6000000000000001 (floating point precision issues)
export const MOCK_DECIMAL_PRECISION_IMPACT: IImpactSizingAssumptionEntryV2[] = [
  createBaseImpactAssumption({
    uuid: 'decimal-impact-1',
    order: 1,
    scalar: 0.1,
    unit: '$',
    unitDescription: 'First decimal cost',
    operator: '+',
    title: 'First Decimal Cost',
    description: 'First decimal cost value',
  }),
  createBaseImpactAssumption({
    uuid: 'decimal-impact-2',
    order: 2,
    scalar: 0.2,
    unit: '$',
    unitDescription: 'Second decimal cost',
    operator: '+',
    title: 'Second Decimal Cost',
    description: 'Second decimal cost value (0.1 + 0.2 precision issue)',
  }),
  createBaseImpactAssumption({
    uuid: 'decimal-impact-3',
    order: 3,
    scalar: 0.3,
    unit: '$',
    unitDescription: 'Third decimal cost',
    title: 'Third Decimal Cost',
    description: 'Third decimal cost for comparison',
  }),
];

// 9. MISSING IMPACT OPERATORS - Incomplete operator chain
// Expected: 5000 * 10 = 50000 (calculation stops at missing operator, third value ignored)
export const MOCK_MISSING_IMPACT_OPERATORS: IImpactSizingAssumptionEntryV2[] = [
  createBaseImpactAssumption({
    uuid: 'missing-impact-1',
    order: 1,
    scalar: 5000,
    unit: '$',
    unitDescription: 'Base impact value',
    operator: '*',
    title: 'Base Impact Value',
    description: 'Base impact value with operator',
  }),
  createBaseImpactAssumption({
    uuid: 'missing-impact-2',
    order: 2,
    scalar: 10,
    unit: 'magnitude',
    unitDescription: 'Multiplier value',
    // No operator - should break the chain
    title: 'Multiplier Value',
    description: 'Multiplier value without operator',
  }),
  createBaseImpactAssumption({
    uuid: 'missing-impact-3',
    order: 3,
    scalar: 3,
    unit: 'magnitude',
    unitDescription: 'Additional multiplier',
    operator: '+',
    title: 'Additional Multiplier',
    description: 'Additional multiplier that should not be processed',
  }),
];

// 10. EMPTY IMPACT ASSUMPTIONS - Edge case with no data
// Expected: 0 (returns 0 when no assumptions provided)
export const MOCK_EMPTY_IMPACT_ASSUMPTIONS: IImpactSizingAssumptionEntryV2[] =
  [];

// 11. SINGLE IMPACT ASSUMPTION - Edge case with only one assumption
// Expected: 75000 (single value with no operations)
export const MOCK_SINGLE_IMPACT_ASSUMPTION: IImpactSizingAssumptionEntryV2[] = [
  createBaseImpactAssumption({
    uuid: 'single-impact-1',
    order: 1,
    scalar: 75000,
    unit: '$',
    unitDescription: 'Single cost savings',
    title: 'Single Cost Savings',
    description: 'Single cost savings value',
  }),
];

// 12. UNORDERED IMPACT ASSUMPTIONS - Test sorting behavior
// Expected: 1000 + 2000 + 3000 = 6000 (after sorting by order: 1, 2, 3)
export const MOCK_UNORDERED_IMPACT_ASSUMPTIONS: IImpactSizingAssumptionEntryV2[] =
  [
    createBaseImpactAssumption({
      uuid: 'unordered-impact-3',
      order: 3,
      scalar: 3000,
      unit: '$',
      unitDescription: 'Third cost savings',
      title: 'Third Cost Savings',
      description: 'Third cost savings value (order 3)',
    }),
    createBaseImpactAssumption({
      uuid: 'unordered-impact-1',
      order: 1,
      scalar: 1000,
      unit: '$',
      unitDescription: 'First cost savings',
      operator: '+',
      title: 'First Cost Savings',
      description: 'First cost savings value (order 1)',
    }),
    createBaseImpactAssumption({
      uuid: 'unordered-impact-2',
      order: 2,
      scalar: 2000,
      unit: '$',
      unitDescription: 'Second cost savings',
      operator: '+',
      title: 'Second Cost Savings',
      description: 'Second cost savings value (order 2)',
    }),
  ];

// 13. NESTED IMPACT PARENTHETICAL - Complex nested cost reduction
// Expected: (5000 + 2000 - 1000) * 3 = 6000 * 3 = 18,000
export const MOCK_NESTED_IMPACT_PARENTHETICAL: IImpactSizingAssumptionEntryV2[] =
  [
    createBaseImpactAssumption({
      uuid: 'nested-impact-1',
      order: 1,
      scalar: 5000,
      unit: '$',
      unitDescription: 'Base cost reduction',
      operator: '(+)',
      title: 'Base Cost Reduction',
      description: 'Base cost reduction for nested calculation',
    }),
    createBaseImpactAssumption({
      uuid: 'nested-impact-2',
      order: 2,
      scalar: 2000,
      unit: '$',
      unitDescription: 'Additional savings',
      operator: '(-)',
      title: 'Additional Savings',
      description: 'Additional savings in parentheses',
    }),
    createBaseImpactAssumption({
      uuid: 'nested-impact-3',
      order: 3,
      scalar: 1000,
      unit: '$',
      unitDescription: 'Implementation cost',
      operator: '*',
      title: 'Implementation Cost',
      description: 'Implementation cost to subtract',
    }),
    createBaseImpactAssumption({
      uuid: 'nested-impact-4',
      order: 4,
      scalar: 3,
      unit: 'magnitude',
      unitDescription: 'Scale multiplier',
      title: 'Scale Multiplier',
      description: 'Scale multiplier for the impact',
    }),
  ];

// 14. DEEPLY NESTED IMPACT PARENTHETICAL - Multiple levels
// Expected: (10000 + 5000 - 2000) * (20 + 10) * 2 = 13000 * 30 * 2 = 780,000
export const MOCK_DEEPLY_NESTED_IMPACT_PARENTHETICAL: IImpactSizingAssumptionEntryV2[] =
  [
    createBaseImpactAssumption({
      uuid: 'deep-impact-1',
      order: 1,
      scalar: 10000,
      unit: '$',
      unitDescription: 'Primary cost reduction',
      operator: '(+)',
      title: 'Primary Cost Reduction',
      description: 'Primary cost reduction amount',
    }),
    createBaseImpactAssumption({
      uuid: 'deep-impact-2',
      order: 2,
      scalar: 5000,
      unit: '$',
      unitDescription: 'Secondary savings',
      operator: '(-)',
      title: 'Secondary Savings',
      description: 'Secondary savings to add',
    }),
    createBaseImpactAssumption({
      uuid: 'deep-impact-3',
      order: 3,
      scalar: 2000,
      unit: '$',
      unitDescription: 'Implementation overhead',
      operator: '*',
      title: 'Implementation Overhead',
      description: 'Implementation overhead to deduct',
    }),
    createBaseImpactAssumption({
      uuid: 'deep-impact-4',
      order: 4,
      scalar: 20,
      unit: 'magnitude',
      unitDescription: 'Base frequency',
      operator: '(+)',
      title: 'Base Frequency',
      description: 'Base frequency of impact',
    }),
    createBaseImpactAssumption({
      uuid: 'deep-impact-5',
      order: 5,
      scalar: 10,
      unit: 'magnitude',
      unitDescription: 'Additional frequency',
      operator: '*',
      title: 'Additional Frequency',
      description: 'Additional frequency multiplier',
    }),
    createBaseImpactAssumption({
      uuid: 'deep-impact-6',
      order: 6,
      scalar: 2,
      unit: 'magnitude',
      unitDescription: 'Scale factor',
      title: 'Scale Factor',
      description: 'Final scale factor for impact',
    }),
  ];

// 15. TRIPLE NESTED IMPACT PARENTHETICAL - Three levels of grouping
// Expected: (8000 + 4000) * (100 - 25 + 15) * (5 + 2 - 1) = 12000 * 90 * 6 = 6,480,000
export const MOCK_TRIPLE_NESTED_IMPACT_PARENTHETICAL: IImpactSizingAssumptionEntryV2[] =
  [
    createBaseImpactAssumption({
      uuid: 'triple-impact-1',
      order: 1,
      scalar: 8000,
      unit: '$',
      unitDescription: 'Primary impact base',
      operator: '(+)',
      title: 'Primary Impact Base',
      description: 'Primary impact base amount',
    }),
    createBaseImpactAssumption({
      uuid: 'triple-impact-2',
      order: 2,
      scalar: 4000,
      unit: '$',
      unitDescription: 'Secondary impact',
      operator: '*',
      title: 'Secondary Impact',
      description: 'Secondary impact addition',
    }),
    createBaseImpactAssumption({
      uuid: 'triple-impact-3',
      order: 3,
      scalar: 100,
      unit: 'magnitude',
      unitDescription: 'Process count base',
      operator: '(-)',
      title: 'Process Count Base',
      description: 'Base process count',
    }),
    createBaseImpactAssumption({
      uuid: 'triple-impact-4',
      order: 4,
      scalar: 25,
      unit: 'magnitude',
      unitDescription: 'Process reduction',
      operator: '(+)',
      title: 'Process Reduction',
      description: 'Process count reduction',
    }),
    createBaseImpactAssumption({
      uuid: 'triple-impact-5',
      order: 5,
      scalar: 15,
      unit: 'magnitude',
      unitDescription: 'Process addition',
      operator: '*',
      title: 'Process Addition',
      description: 'Additional process count',
    }),
    createBaseImpactAssumption({
      uuid: 'triple-impact-6',
      order: 6,
      scalar: 5,
      unit: 'magnitude',
      unitDescription: 'Efficiency base',
      operator: '(+)',
      title: 'Efficiency Base',
      description: 'Base efficiency factor',
    }),
    createBaseImpactAssumption({
      uuid: 'triple-impact-7',
      order: 7,
      scalar: 2,
      unit: 'magnitude',
      unitDescription: 'Efficiency boost',
      operator: '(-)',
      title: 'Efficiency Boost',
      description: 'Additional efficiency boost',
    }),
    createBaseImpactAssumption({
      uuid: 'triple-impact-8',
      order: 8,
      scalar: 1,
      unit: 'magnitude',
      unitDescription: 'Efficiency loss',
      title: 'Efficiency Loss',
      description: 'Efficiency loss factor',
    }),
  ];

// 16. MIXED PERCENTAGE NESTED IMPACT - Percentages within nested groups
// Expected: (5000000 * 0.10) * (0.85 + 0.15) / (0.05 + 0.02) = 500000 * 1.00 / 0.07 = 7,142,857
export const MOCK_MIXED_PERCENTAGE_NESTED_IMPACT: IImpactSizingAssumptionEntryV2[] =
  [
    createBaseImpactAssumption({
      uuid: 'mixed-impact-1',
      order: 1,
      scalar: 5000000,
      unit: '$',
      unitDescription: 'Total operational budget',
      operator: '*',
      title: 'Total Operational Budget',
      description: 'Total annual operational budget',
    }),
    createBaseImpactAssumption({
      uuid: 'mixed-impact-2',
      order: 2,
      scalar: 10,
      unit: '%',
      unitDescription: 'Cost reduction percentage',
      operator: '*',
      title: 'Cost Reduction Rate',
      description: 'Percentage of costs that can be reduced',
    }),
    createBaseImpactAssumption({
      uuid: 'mixed-impact-3',
      order: 3,
      scalar: 85,
      unit: '%',
      unitDescription: 'Implementation efficiency',
      operator: '(+)',
      title: 'Implementation Efficiency',
      description: 'Base implementation efficiency rate',
    }),
    createBaseImpactAssumption({
      uuid: 'mixed-impact-4',
      order: 4,
      scalar: 15,
      unit: '%',
      unitDescription: 'Efficiency improvement',
      operator: '/',
      title: 'Efficiency Improvement',
      description: 'Additional efficiency improvement',
    }),
    createBaseImpactAssumption({
      uuid: 'mixed-impact-5',
      order: 5,
      scalar: 5,
      unit: '%',
      unitDescription: 'Implementation risk',
      operator: '(+)',
      title: 'Implementation Risk',
      description: 'Risk factor for implementation',
    }),
    createBaseImpactAssumption({
      uuid: 'mixed-impact-6',
      order: 6,
      scalar: 2,
      unit: '%',
      unitDescription: 'Additional risk factor',
      title: 'Additional Risk Factor',
      description: 'Additional risk considerations',
    }),
  ];

// 17. STRESS TEST MEGA IMPACT NESTED - Maximum complexity
// Expected: Complex calculation with 5 nested groups
// (50000 + 25000 - 10000) * (80 + 20 - 15 + 5) * (12 - 2) / (4 + 1) + (30000 - 5000)
// = 65000 * 90 * 10 / 5 + 25000 = 65000 * 90 * 2 + 25000 = 11,700,000 + 25000 = 11,725,000
export const MOCK_STRESS_TEST_MEGA_IMPACT_NESTED: IImpactSizingAssumptionEntryV2[] =
  [
    createBaseImpactAssumption({
      uuid: 'stress-impact-1',
      order: 1,
      scalar: 50000,
      unit: '$',
      unitDescription: 'Mega base cost reduction',
      operator: '(+)',
      title: 'Mega Base Cost Reduction',
      description: 'Primary mega cost reduction',
    }),
    createBaseImpactAssumption({
      uuid: 'stress-impact-2',
      order: 2,
      scalar: 25000,
      unit: '$',
      unitDescription: 'Secondary cost reduction',
      operator: '(-)',
      title: 'Secondary Cost Reduction',
      description: 'Secondary cost reduction addition',
    }),
    createBaseImpactAssumption({
      uuid: 'stress-impact-3',
      order: 3,
      scalar: 10000,
      unit: '$',
      unitDescription: 'Implementation cost',
      operator: '*',
      title: 'Implementation Cost',
      description: 'Implementation cost deduction',
    }),
    createBaseImpactAssumption({
      uuid: 'stress-impact-4',
      order: 4,
      scalar: 80,
      unit: 'magnitude',
      unitDescription: 'Primary scale factor',
      operator: '(+)',
      title: 'Primary Scale Factor',
      description: 'Primary scale factor base',
    }),
    createBaseImpactAssumption({
      uuid: 'stress-impact-5',
      order: 5,
      scalar: 20,
      unit: 'magnitude',
      unitDescription: 'Scale boost',
      operator: '(-)',
      title: 'Scale Boost',
      description: 'Scale boost value',
    }),
    createBaseImpactAssumption({
      uuid: 'stress-impact-6',
      order: 6,
      scalar: 15,
      unit: 'magnitude',
      unitDescription: 'Scale reduction',
      operator: '(+)',
      title: 'Scale Reduction',
      description: 'Scale reduction value',
    }),
    createBaseImpactAssumption({
      uuid: 'stress-impact-7',
      order: 7,
      scalar: 5,
      unit: 'magnitude',
      unitDescription: 'Scale recovery',
      operator: '*',
      title: 'Scale Recovery',
      description: 'Scale recovery value',
    }),
    createBaseImpactAssumption({
      uuid: 'stress-impact-8',
      order: 8,
      scalar: 12,
      unit: 'magnitude',
      unitDescription: 'Time base',
      operator: '(-)',
      title: 'Time Base',
      description: 'Base time factor',
    }),
    createBaseImpactAssumption({
      uuid: 'stress-impact-9',
      order: 9,
      scalar: 2,
      unit: 'magnitude',
      unitDescription: 'Time reduction',
      operator: '/',
      title: 'Time Reduction',
      description: 'Time reduction factor',
    }),
    createBaseImpactAssumption({
      uuid: 'stress-impact-10',
      order: 10,
      scalar: 4,
      unit: 'magnitude',
      unitDescription: 'Divisor base',
      operator: '(+)',
      title: 'Divisor Base',
      description: 'Base divisor value',
    }),
    createBaseImpactAssumption({
      uuid: 'stress-impact-11',
      order: 11,
      scalar: 1,
      unit: 'magnitude',
      unitDescription: 'Divisor addition',
      operator: '+',
      title: 'Divisor Addition',
      description: 'Divisor addition value',
    }),
    createBaseImpactAssumption({
      uuid: 'stress-impact-12',
      order: 12,
      scalar: 30000,
      unit: '$',
      unitDescription: 'Final base',
      operator: '(-)',
      title: 'Final Base',
      description: 'Final calculation base',
    }),
    createBaseImpactAssumption({
      uuid: 'stress-impact-13',
      order: 13,
      scalar: 5000,
      unit: '$',
      unitDescription: 'Final deduction',
      title: 'Final Deduction',
      description: 'Final calculation deduction',
    }),
  ];

// Export all impact test cases for easy import
export const ALL_IMPACT_TEST_CASES = {
  MOCK_WORKING_IMPACT_EQUATION,
  MOCK_BROKEN_IMPACT_EQUATION,
  MOCK_PERCENTAGE_IMPACT_EQUATION,
  MOCK_PARENTHETICAL_IMPACT_EQUATION,
  MOCK_MALFORMED_IMPACT_OPERATORS,
  MOCK_NEGATIVE_IMPACT_NUMBERS,
  MOCK_LARGE_IMPACT_NUMBERS,
  MOCK_DECIMAL_PRECISION_IMPACT,
  MOCK_MISSING_IMPACT_OPERATORS,
  MOCK_EMPTY_IMPACT_ASSUMPTIONS,
  MOCK_SINGLE_IMPACT_ASSUMPTION,
  MOCK_UNORDERED_IMPACT_ASSUMPTIONS,
  MOCK_NESTED_IMPACT_PARENTHETICAL,
  MOCK_DEEPLY_NESTED_IMPACT_PARENTHETICAL,
  MOCK_TRIPLE_NESTED_IMPACT_PARENTHETICAL,
  MOCK_MIXED_PERCENTAGE_NESTED_IMPACT,
  MOCK_STRESS_TEST_MEGA_IMPACT_NESTED,
};

// Usage examples:
// import { MOCK_DEEPLY_NESTED_IMPACT_PARENTHETICAL } from './mockTestData';
// <ImpactResultsPanel assumptions={MOCK_DEEPLY_NESTED_IMPACT_PARENTHETICAL} ... />

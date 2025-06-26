import { IMarketSizingAssumptionEntryV2 } from '@libs/api/types/concept/financialProjectionV2';

// Helper function to create base assumption
const createBaseAssumption = (
  overrides: Partial<IMarketSizingAssumptionEntryV2>,
): IMarketSizingAssumptionEntryV2 => ({
  uuid: Math.random().toString(36).substr(2, 9),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  order: 0,
  scalar: 0,
  unit: '$',
  unitDescription: 'Dollar amount',
  title: 'Test Assumption',
  description: 'Test assumption description',
  assumptionSources: [],
  ...overrides,
});

// 1. WORKING EQUATION - Basic multiplication
// Expected: 4612 * 50 * 52 * 5.67 = 68,103,024
export const MOCK_WORKING_EQUATION: IMarketSizingAssumptionEntryV2[] = [
  createBaseAssumption({
    uuid: 'assumption-1',
    order: 1,
    scalar: 4612,
    unit: 'stores',
    unitDescription: 'Number of Walmart stores',
    operator: '*',
    title: 'Walmart Store Count',
    description: 'Number of Walmart stores in the U.S.',
  }),
  createBaseAssumption({
    uuid: 'assumption-2',
    order: 2,
    scalar: 50,
    unit: 'packs',
    unitDescription: 'Weekly pack sales per store',
    operator: '*',
    title: 'Weekly Pack Sales per Store',
    description: 'Average weekly pack sales per store',
  }),
  createBaseAssumption({
    uuid: 'assumption-3',
    order: 3,
    scalar: 52,
    unit: 'weeks',
    unitDescription: 'Weeks per year',
    operator: '*',
    title: 'Weeks per Year',
    description: 'Number of weeks in a year',
  }),
  createBaseAssumption({
    uuid: 'assumption-4',
    order: 4,
    scalar: 5.67,
    unit: '$',
    unitDescription: 'Price per pack',
    title: 'Price per Pack',
    description: 'Average price per pack',
  }),
];

// 2. BROKEN EQUATION - Division by zero
// Expected: 1000 / 0 = Infinity (or error in calculation)
export const MOCK_BROKEN_EQUATION: IMarketSizingAssumptionEntryV2[] = [
  createBaseAssumption({
    uuid: 'broken-1',
    order: 1,
    scalar: 1000,
    unit: '$',
    operator: '/',
    title: 'Total Revenue',
    description: 'Total revenue amount',
  }),
  createBaseAssumption({
    uuid: 'broken-2',
    order: 2,
    scalar: 0,
    unit: 'customers',
    title: 'Customer Count',
    description: 'Number of customers (zero causes division by zero)',
  }),
];

// 3. PERCENTAGE HANDLING - Mix of percentages and numbers
// Expected: 1000000 * (35/100) * 0.8 = 1000000 * 0.35 * 0.8 = 280,000
export const MOCK_PERCENTAGE_EQUATION: IMarketSizingAssumptionEntryV2[] = [
  createBaseAssumption({
    uuid: 'percent-1',
    order: 1,
    scalar: 1000000,
    unit: '$',
    operator: '*',
    title: 'Total Market Size',
    description: 'Total addressable market',
  }),
  createBaseAssumption({
    uuid: 'percent-2',
    order: 2,
    scalar: 35,
    unit: '%',
    operator: '*',
    title: 'Market Penetration',
    description: 'Percentage of market we can capture',
  }),
  createBaseAssumption({
    uuid: 'percent-3',
    order: 3,
    scalar: 0.8,
    unit: 'multiplier',
    title: 'Conversion Rate',
    description: 'Conversion rate multiplier',
  }),
];

// 4. PARENTHETICAL OPERATIONS - Complex parenthetical logic
// Expected: (4612 + 1981) * (624 + 601) * 50 = 6593 * 1225 * 50 = 403,888,250
export const MOCK_PARENTHETICAL_EQUATION: IMarketSizingAssumptionEntryV2[] = [
  createBaseAssumption({
    uuid: 'paren-1',
    order: 1,
    scalar: 4612,
    unit: 'stores',
    operator: '(+)',
    title: 'Walmart Store Count',
    description: 'Walmart stores',
  }),
  createBaseAssumption({
    uuid: 'paren-2',
    order: 2,
    scalar: 1981,
    unit: 'stores',
    operator: '*',
    title: 'Target Store Count',
    description: 'Target stores',
  }),
  createBaseAssumption({
    uuid: 'paren-3',
    order: 3,
    scalar: 624,
    unit: 'stores',
    operator: '(+)',
    title: 'Costco Warehouse Count',
    description: 'Costco warehouses',
  }),
  createBaseAssumption({
    uuid: 'paren-4',
    order: 4,
    scalar: 601,
    unit: 'stores',
    operator: '*',
    title: "Sam's Club Warehouse Count",
    description: "Sam's Club warehouses",
  }),
  createBaseAssumption({
    uuid: 'paren-5',
    order: 5,
    scalar: 50,
    unit: 'packs',
    title: 'Weekly Pack Sales',
    description: 'Weekly pack sales per store',
  }),
];

// 5. MALFORMED OPERATORS - Invalid operators
// Expected: Error - Invalid JavaScript expression with '***' and '??' operators
export const MOCK_MALFORMED_OPERATORS: IMarketSizingAssumptionEntryV2[] = [
  createBaseAssumption({
    uuid: 'malformed-1',
    order: 1,
    scalar: 100,
    unit: '$',
    operator: '***', // Invalid operator
    title: 'Base Amount',
    description: 'Base amount with invalid operator',
  }),
  createBaseAssumption({
    uuid: 'malformed-2',
    order: 2,
    scalar: 50,
    unit: '$',
    operator: '??', // Invalid operator
    title: 'Additional Amount',
    description: 'Additional amount with invalid operator',
  }),
  createBaseAssumption({
    uuid: 'malformed-3',
    order: 3,
    scalar: 25,
    unit: '$',
    title: 'Final Amount',
    description: 'Final amount',
  }),
];

// 6. NEGATIVE NUMBERS - Testing negative values
// Expected: 1000 + (-200) * 5 = 1000 + (-1000) = 0
export const MOCK_NEGATIVE_NUMBERS: IMarketSizingAssumptionEntryV2[] = [
  createBaseAssumption({
    uuid: 'negative-1',
    order: 1,
    scalar: 1000,
    unit: '$',
    operator: '+',
    title: 'Positive Revenue',
    description: 'Positive revenue amount',
  }),
  createBaseAssumption({
    uuid: 'negative-2',
    order: 2,
    scalar: -200,
    unit: '$',
    operator: '*',
    title: 'Negative Cost',
    description: 'Negative cost (should cause issues)',
  }),
  createBaseAssumption({
    uuid: 'negative-3',
    order: 3,
    scalar: 5,
    unit: 'multiplier',
    title: 'Multiplier',
    description: 'Multiplier value',
  }),
];

// 7. EXTREMELY LARGE NUMBERS - Testing overflow
// Expected: 999999999999999 * 999999999999999 = 9.999999999999978e+29 (potential overflow/precision issues)
export const MOCK_LARGE_NUMBERS: IMarketSizingAssumptionEntryV2[] = [
  createBaseAssumption({
    uuid: 'large-1',
    order: 1,
    scalar: 999999999999999,
    unit: '$',
    operator: '*',
    title: 'Extremely Large Base',
    description: 'Extremely large base number',
  }),
  createBaseAssumption({
    uuid: 'large-2',
    order: 2,
    scalar: 999999999999999,
    unit: 'multiplier',
    title: 'Extremely Large Multiplier',
    description: 'Extremely large multiplier',
  }),
];

// 8. DECIMAL PRECISION - Testing floating point issues
// Expected: 0.1 + 0.2 + 0.3 = 0.6000000000000001 (floating point precision issues)
export const MOCK_DECIMAL_PRECISION: IMarketSizingAssumptionEntryV2[] = [
  createBaseAssumption({
    uuid: 'decimal-1',
    order: 1,
    scalar: 0.1,
    unit: '$',
    operator: '+',
    title: 'First Decimal',
    description: 'First decimal value',
  }),
  createBaseAssumption({
    uuid: 'decimal-2',
    order: 2,
    scalar: 0.2,
    unit: '$',
    operator: '+',
    title: 'Second Decimal',
    description: 'Second decimal value (0.1 + 0.2 = 0.30000000000000004)',
  }),
  createBaseAssumption({
    uuid: 'decimal-3',
    order: 3,
    scalar: 0.3,
    unit: '$',
    title: 'Third Decimal',
    description: 'Third decimal for comparison',
  }),
];

// 9. MISSING OPERATORS - Incomplete operator chain
// Expected: 100 * 50 = 5000 (calculation stops at missing operator, third value ignored)
export const MOCK_MISSING_OPERATORS: IMarketSizingAssumptionEntryV2[] = [
  createBaseAssumption({
    uuid: 'missing-1',
    order: 1,
    scalar: 100,
    unit: '$',
    operator: '*',
    title: 'First Value',
    description: 'First value with operator',
  }),
  createBaseAssumption({
    uuid: 'missing-2',
    order: 2,
    scalar: 50,
    unit: '$',
    // No operator - should break the chain
    title: 'Second Value',
    description: 'Second value without operator',
  }),
  createBaseAssumption({
    uuid: 'missing-3',
    order: 3,
    scalar: 25,
    unit: '$',
    operator: '+',
    title: 'Third Value',
    description: 'Third value that should not be processed',
  }),
];

// 10. EMPTY ASSUMPTIONS - Edge case with no data
// Expected: 0 (returns 0 when no assumptions provided)
export const MOCK_EMPTY_ASSUMPTIONS: IMarketSizingAssumptionEntryV2[] = [];

// 11. SINGLE ASSUMPTION - Edge case with only one assumption
// Expected: 42 (single value with no operations)
export const MOCK_SINGLE_ASSUMPTION: IMarketSizingAssumptionEntryV2[] = [
  createBaseAssumption({
    uuid: 'single-1',
    order: 1,
    scalar: 42,
    unit: '$',
    title: 'Single Value',
    description: 'Single assumption value',
  }),
];

// 12. UNORDERED ASSUMPTIONS - Test sorting behavior
// Expected: 10 + 20 + 30 = 60 (after sorting by order: 1, 2, 3)
export const MOCK_UNORDERED_ASSUMPTIONS: IMarketSizingAssumptionEntryV2[] = [
  createBaseAssumption({
    uuid: 'unordered-3',
    order: 3,
    scalar: 30,
    unit: '$',
    title: 'Third Value',
    description: 'Third value (order 3)',
  }),
  createBaseAssumption({
    uuid: 'unordered-1',
    order: 1,
    scalar: 10,
    unit: '$',
    operator: '+',
    title: 'First Value',
    description: 'First value (order 1)',
  }),
  createBaseAssumption({
    uuid: 'unordered-2',
    order: 2,
    scalar: 20,
    unit: '$',
    operator: '+',
    title: 'Second Value',
    description: 'Second value (order 2)',
  }),
];

// 13. NESTED PARENTHETICAL - Complex nested operations
// Expected: (100 + 50 - 25) * 2 = 125 * 2 = 250
export const MOCK_NESTED_PARENTHETICAL: IMarketSizingAssumptionEntryV2[] = [
  createBaseAssumption({
    uuid: 'nested-1',
    order: 1,
    scalar: 100,
    unit: '$',
    operator: '(+)',
    title: 'Base Value',
    description: 'Base value for nested calculation',
  }),
  createBaseAssumption({
    uuid: 'nested-2',
    order: 2,
    scalar: 50,
    unit: '$',
    operator: '(-)',
    title: 'First Addition',
    description: 'First addition in parentheses',
  }),
  createBaseAssumption({
    uuid: 'nested-3',
    order: 3,
    scalar: 25,
    unit: '$',
    operator: '*',
    title: 'Subtraction Value',
    description: 'Value to subtract in nested parentheses',
  }),
  createBaseAssumption({
    uuid: 'nested-4',
    order: 4,
    scalar: 2,
    unit: 'multiplier',
    title: 'Final Multiplier',
    description: 'Final multiplier for the result',
  }),
];

// 14. DEEPLY NESTED PARENTHETICAL - Multiple levels of nesting
// Expected: (1000 + 500 - 200) * (10 + 5) * 2 = 1300 * 15 * 2 = 39,000
export const MOCK_DEEPLY_NESTED_PARENTHETICAL: IMarketSizingAssumptionEntryV2[] =
  [
    createBaseAssumption({
      uuid: 'deep-1',
      order: 1,
      scalar: 1000,
      unit: '$',
      operator: '(+)',
      title: 'Base Revenue',
      description: 'Base revenue amount',
    }),
    createBaseAssumption({
      uuid: 'deep-2',
      order: 2,
      scalar: 500,
      unit: '$',
      operator: '(-)',
      title: 'Additional Revenue',
      description: 'Additional revenue to add',
    }),
    createBaseAssumption({
      uuid: 'deep-3',
      order: 3,
      scalar: 200,
      unit: '$',
      operator: '*',
      title: 'Cost Deduction',
      description: 'Cost to deduct from revenue',
    }),
    createBaseAssumption({
      uuid: 'deep-4',
      order: 4,
      scalar: 10,
      unit: 'multiplier',
      operator: '(+)',
      title: 'Base Multiplier',
      description: 'Base multiplier value',
    }),
    createBaseAssumption({
      uuid: 'deep-5',
      order: 5,
      scalar: 5,
      unit: 'multiplier',
      operator: '*',
      title: 'Additional Multiplier',
      description: 'Additional multiplier to add',
    }),
    createBaseAssumption({
      uuid: 'deep-6',
      order: 6,
      scalar: 2,
      unit: 'multiplier',
      title: 'Final Multiplier',
      description: 'Final multiplier for the calculation',
    }),
  ];

// 15. TRIPLE NESTED PARENTHETICAL - Three levels of grouping
// Expected: (100 + 50) * (200 - 75 + 25) * (10 + 5 - 3) = 150 * 150 * 12 = 270,000
export const MOCK_TRIPLE_NESTED_PARENTHETICAL: IMarketSizingAssumptionEntryV2[] =
  [
    createBaseAssumption({
      uuid: 'triple-1',
      order: 1,
      scalar: 100,
      unit: '$',
      operator: '(+)',
      title: 'First Base',
      description: 'First group base amount',
    }),
    createBaseAssumption({
      uuid: 'triple-2',
      order: 2,
      scalar: 50,
      unit: '$',
      operator: '*',
      title: 'First Addition',
      description: 'First group addition',
    }),
    createBaseAssumption({
      uuid: 'triple-3',
      order: 3,
      scalar: 200,
      unit: '$',
      operator: '(-)',
      title: 'Second Base',
      description: 'Second group base amount',
    }),
    createBaseAssumption({
      uuid: 'triple-4',
      order: 4,
      scalar: 75,
      unit: '$',
      operator: '(+)',
      title: 'Second Subtraction',
      description: 'Second group subtraction',
    }),
    createBaseAssumption({
      uuid: 'triple-5',
      order: 5,
      scalar: 25,
      unit: '$',
      operator: '*',
      title: 'Second Addition',
      description: 'Second group addition',
    }),
    createBaseAssumption({
      uuid: 'triple-6',
      order: 6,
      scalar: 10,
      unit: 'multiplier',
      operator: '(+)',
      title: 'Third Base',
      description: 'Third group base multiplier',
    }),
    createBaseAssumption({
      uuid: 'triple-7',
      order: 7,
      scalar: 5,
      unit: 'multiplier',
      operator: '(-)',
      title: 'Third Addition',
      description: 'Third group addition',
    }),
    createBaseAssumption({
      uuid: 'triple-8',
      order: 8,
      scalar: 3,
      unit: 'multiplier',
      title: 'Third Subtraction',
      description: 'Third group subtraction',
    }),
  ];

// 16. MIXED PERCENTAGE NESTED - Percentages within nested groups
// Expected: (1000000 * 0.15) * (0.80 + 0.10) / (0.05 + 0.03) = 150000 * 0.90 / 0.08 = 1,687,500
export const MOCK_MIXED_PERCENTAGE_NESTED: IMarketSizingAssumptionEntryV2[] = [
  createBaseAssumption({
    uuid: 'mixed-1',
    order: 1,
    scalar: 1000000,
    unit: '$',
    operator: '*',
    title: 'Total Market',
    description: 'Total addressable market',
  }),
  createBaseAssumption({
    uuid: 'mixed-2',
    order: 2,
    scalar: 15,
    unit: '%',
    operator: '*',
    title: 'Market Share',
    description: 'Our market share percentage',
  }),
  createBaseAssumption({
    uuid: 'mixed-3',
    order: 3,
    scalar: 80,
    unit: '%',
    operator: '(+)',
    title: 'Base Conversion',
    description: 'Base conversion rate',
  }),
  createBaseAssumption({
    uuid: 'mixed-4',
    order: 4,
    scalar: 10,
    unit: '%',
    operator: '/',
    title: 'Bonus Conversion',
    description: 'Additional conversion boost',
  }),
  createBaseAssumption({
    uuid: 'mixed-5',
    order: 5,
    scalar: 5,
    unit: '%',
    operator: '(+)',
    title: 'Churn Rate',
    description: 'Customer churn rate',
  }),
  createBaseAssumption({
    uuid: 'mixed-6',
    order: 6,
    scalar: 3,
    unit: '%',
    title: 'Additional Churn',
    description: 'Additional churn factors',
  }),
];

// 17. ALTERNATING NESTED PATTERN - Complex alternating nested operations
// Expected: (500 + 300) * 2 * (100 - 25) * 3 * (50 + 10) = 800 * 2 * 75 * 3 * 60 = 21,600,000
export const MOCK_ALTERNATING_NESTED: IMarketSizingAssumptionEntryV2[] = [
  createBaseAssumption({
    uuid: 'alt-1',
    order: 1,
    scalar: 500,
    unit: '$',
    operator: '(+)',
    title: 'Revenue Base',
    description: 'Base revenue amount',
  }),
  createBaseAssumption({
    uuid: 'alt-2',
    order: 2,
    scalar: 300,
    unit: '$',
    operator: '*',
    title: 'Revenue Boost',
    description: 'Additional revenue',
  }),
  createBaseAssumption({
    uuid: 'alt-3',
    order: 3,
    scalar: 2,
    unit: 'multiplier',
    operator: '*',
    title: 'First Multiplier',
    description: 'Simple multiplier',
  }),
  createBaseAssumption({
    uuid: 'alt-4',
    order: 4,
    scalar: 100,
    unit: '$',
    operator: '(-)',
    title: 'Cost Base',
    description: 'Base cost amount',
  }),
  createBaseAssumption({
    uuid: 'alt-5',
    order: 5,
    scalar: 25,
    unit: '$',
    operator: '*',
    title: 'Cost Reduction',
    description: 'Cost reduction amount',
  }),
  createBaseAssumption({
    uuid: 'alt-6',
    order: 6,
    scalar: 3,
    unit: 'multiplier',
    operator: '*',
    title: 'Second Multiplier',
    description: 'Another simple multiplier',
  }),
  createBaseAssumption({
    uuid: 'alt-7',
    order: 7,
    scalar: 50,
    unit: 'units',
    operator: '(+)',
    title: 'Units Base',
    description: 'Base units',
  }),
  createBaseAssumption({
    uuid: 'alt-8',
    order: 8,
    scalar: 10,
    unit: 'units',
    title: 'Additional Units',
    description: 'Additional units',
  }),
];

// 18. LONG CHAIN NESTED - Very long chain with multiple nested groups
// Expected: (1000 + 500 - 200 + 100) * (50 + 25 - 10) * (5 + 3 + 2) * (10 - 2) = 1400 * 65 * 10 * 8 = 7,280,000
export const MOCK_LONG_CHAIN_NESTED: IMarketSizingAssumptionEntryV2[] = [
  createBaseAssumption({
    uuid: 'long-1',
    order: 1,
    scalar: 1000,
    unit: '$',
    operator: '(+)',
    title: 'Primary Revenue',
    description: 'Primary revenue source',
  }),
  createBaseAssumption({
    uuid: 'long-2',
    order: 2,
    scalar: 500,
    unit: '$',
    operator: '(-)',
    title: 'Secondary Revenue',
    description: 'Secondary revenue source',
  }),
  createBaseAssumption({
    uuid: 'long-3',
    order: 3,
    scalar: 200,
    unit: '$',
    operator: '(+)',
    title: 'Primary Cost',
    description: 'Primary cost deduction',
  }),
  createBaseAssumption({
    uuid: 'long-4',
    order: 4,
    scalar: 100,
    unit: '$',
    operator: '*',
    title: 'Cost Recovery',
    description: 'Cost recovery addition',
  }),
  createBaseAssumption({
    uuid: 'long-5',
    order: 5,
    scalar: 50,
    unit: 'units',
    operator: '(+)',
    title: 'Base Units',
    description: 'Base unit count',
  }),
  createBaseAssumption({
    uuid: 'long-6',
    order: 6,
    scalar: 25,
    unit: 'units',
    operator: '(-)',
    title: 'Additional Units',
    description: 'Additional unit count',
  }),
  createBaseAssumption({
    uuid: 'long-7',
    order: 7,
    scalar: 10,
    unit: 'units',
    operator: '*',
    title: 'Unit Reduction',
    description: 'Unit count reduction',
  }),
  createBaseAssumption({
    uuid: 'long-8',
    order: 8,
    scalar: 5,
    unit: 'multiplier',
    operator: '(+)',
    title: 'Base Multiplier',
    description: 'Base multiplier value',
  }),
  createBaseAssumption({
    uuid: 'long-9',
    order: 9,
    scalar: 3,
    unit: 'multiplier',
    operator: '(+)',
    title: 'Secondary Multiplier',
    description: 'Secondary multiplier value',
  }),
  createBaseAssumption({
    uuid: 'long-10',
    order: 10,
    scalar: 2,
    unit: 'multiplier',
    operator: '*',
    title: 'Tertiary Multiplier',
    description: 'Tertiary multiplier value',
  }),
  createBaseAssumption({
    uuid: 'long-11',
    order: 11,
    scalar: 10,
    unit: 'factor',
    operator: '(-)',
    title: 'Base Factor',
    description: 'Base factor value',
  }),
  createBaseAssumption({
    uuid: 'long-12',
    order: 12,
    scalar: 2,
    unit: 'factor',
    title: 'Factor Reduction',
    description: 'Factor reduction value',
  }),
];

// 19. EDGE CASE SINGLE VALUES - Single values in nested groups
// Expected: (1000) * (500) / (10) + (25) = 1000 * 500 / 10 + 25 = 50,025
export const MOCK_SINGLE_VALUE_NESTED: IMarketSizingAssumptionEntryV2[] = [
  createBaseAssumption({
    uuid: 'single-nest-1',
    order: 1,
    scalar: 1000,
    unit: '$',
    operator: '*',
    title: 'Single Revenue',
    description: 'Single revenue value in parentheses',
  }),
  createBaseAssumption({
    uuid: 'single-nest-2',
    order: 2,
    scalar: 500,
    unit: 'multiplier',
    operator: '/',
    title: 'Single Multiplier',
    description: 'Single multiplier value in parentheses',
  }),
  createBaseAssumption({
    uuid: 'single-nest-3',
    order: 3,
    scalar: 10,
    unit: 'divisor',
    operator: '+',
    title: 'Single Divisor',
    description: 'Single divisor value in parentheses',
  }),
  createBaseAssumption({
    uuid: 'single-nest-4',
    order: 4,
    scalar: 25,
    unit: '$',
    title: 'Single Addition',
    description: 'Single addition value in parentheses',
  }),
];

// 20. STRESS TEST MEGA NESTED - Maximum complexity stress test
// Expected: Complex calculation with 5 nested groups - testing implementation limits
// (2000 + 1000 - 500) * (100 + 50 - 25 + 10) * (20 - 5) / (3 + 2) + (1000 - 200)
// = 2500 * 135 * 15 / 5 + 800 = 2500 * 135 * 3 + 800 = 1,012,500 + 800 = 1,013,300
export const MOCK_STRESS_TEST_MEGA_NESTED: IMarketSizingAssumptionEntryV2[] = [
  createBaseAssumption({
    uuid: 'stress-1',
    order: 1,
    scalar: 2000,
    unit: '$',
    operator: '(+)',
    title: 'Mega Base Revenue',
    description: 'Primary mega revenue',
  }),
  createBaseAssumption({
    uuid: 'stress-2',
    order: 2,
    scalar: 1000,
    unit: '$',
    operator: '(-)',
    title: 'Secondary Revenue',
    description: 'Secondary revenue addition',
  }),
  createBaseAssumption({
    uuid: 'stress-3',
    order: 3,
    scalar: 500,
    unit: '$',
    operator: '*',
    title: 'Revenue Deduction',
    description: 'Revenue deduction amount',
  }),
  createBaseAssumption({
    uuid: 'stress-4',
    order: 4,
    scalar: 100,
    unit: 'multiplier',
    operator: '(+)',
    title: 'Primary Multiplier',
    description: 'Primary multiplier base',
  }),
  createBaseAssumption({
    uuid: 'stress-5',
    order: 5,
    scalar: 50,
    unit: 'multiplier',
    operator: '(-)',
    title: 'Multiplier Boost',
    description: 'Multiplier boost value',
  }),
  createBaseAssumption({
    uuid: 'stress-6',
    order: 6,
    scalar: 25,
    unit: 'multiplier',
    operator: '(+)',
    title: 'Multiplier Reduction',
    description: 'Multiplier reduction value',
  }),
  createBaseAssumption({
    uuid: 'stress-7',
    order: 7,
    scalar: 10,
    unit: 'multiplier',
    operator: '*',
    title: 'Multiplier Recovery',
    description: 'Multiplier recovery value',
  }),
  createBaseAssumption({
    uuid: 'stress-8',
    order: 8,
    scalar: 20,
    unit: 'factor',
    operator: '(-)',
    title: 'Factor Base',
    description: 'Base factor value',
  }),
  createBaseAssumption({
    uuid: 'stress-9',
    order: 9,
    scalar: 5,
    unit: 'factor',
    operator: '/',
    title: 'Factor Reduction',
    description: 'Factor reduction value',
  }),
  createBaseAssumption({
    uuid: 'stress-10',
    order: 10,
    scalar: 3,
    unit: 'divisor',
    operator: '(+)',
    title: 'Divisor Base',
    description: 'Base divisor value',
  }),
  createBaseAssumption({
    uuid: 'stress-11',
    order: 11,
    scalar: 2,
    unit: 'divisor',
    operator: '+',
    title: 'Divisor Addition',
    description: 'Divisor addition value',
  }),
  createBaseAssumption({
    uuid: 'stress-12',
    order: 12,
    scalar: 1000,
    unit: '$',
    operator: '(-)',
    title: 'Final Base',
    description: 'Final calculation base',
  }),
  createBaseAssumption({
    uuid: 'stress-13',
    order: 13,
    scalar: 200,
    unit: '$',
    title: 'Final Deduction',
    description: 'Final calculation deduction',
  }),
];

// Export all test cases for easy import
export const ALL_TEST_CASES = {
  MOCK_WORKING_EQUATION,
  MOCK_BROKEN_EQUATION,
  MOCK_PERCENTAGE_EQUATION,
  MOCK_PARENTHETICAL_EQUATION,
  MOCK_MALFORMED_OPERATORS,
  MOCK_NEGATIVE_NUMBERS,
  MOCK_LARGE_NUMBERS,
  MOCK_DECIMAL_PRECISION,
  MOCK_MISSING_OPERATORS,
  MOCK_EMPTY_ASSUMPTIONS,
  MOCK_SINGLE_ASSUMPTION,
  MOCK_UNORDERED_ASSUMPTIONS,
  MOCK_NESTED_PARENTHETICAL,
  MOCK_DEEPLY_NESTED_PARENTHETICAL,
  MOCK_TRIPLE_NESTED_PARENTHETICAL,
  MOCK_MIXED_PERCENTAGE_NESTED,
  MOCK_ALTERNATING_NESTED,
  MOCK_LONG_CHAIN_NESTED,
  MOCK_SINGLE_VALUE_NESTED,
  MOCK_STRESS_TEST_MEGA_NESTED,
};

// Usage examples:
// import { MOCK_BROKEN_EQUATION } from './mockTestData';
// <ResultsPanel assumptions={MOCK_BROKEN_EQUATION} ... />

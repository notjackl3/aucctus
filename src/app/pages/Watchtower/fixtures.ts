import type {
  Signal,
  ImpactedConcept,
  Prediction,
  TrendBullet,
  TimePeriod,
  FutureDomain,
  ConceptOpportunity,
} from './types';

/**
 * Mock signals data for Watchtower
 */
export const mockSignals: Signal[] = [
  {
    id: '1',
    title:
      'Lactalis acquires Kraft natural cheese business for $3.2B — becomes #1 US cheese producer overnight',
    type: 'threat',
    category: 'competition',
    confidence: 'high',
    timeHorizon: 'immediate',
    timeHorizonLabel: '0-6 months',
    radarDistance: 0.15,
    radarAngle: 45,
    isNew: true,
    dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
    recommendedAction:
      'Immediately engage top 10 retail accounts to reinforce Schreiber value proposition before Lactalis integration completes. Evaluate opportunistic hiring of displaced Kraft talent. Prepare competitive response for any price compression in natural cheese.',
    whatChanged:
      "Lactalis Group announced definitive agreement to acquire Kraft Heinz's natural cheese business including Cracker Barrel, Polly-O, and Breakstone's brands. Deal closes Q2 2026. Combined entity will control ~28% of US retail cheese market.",
    whyItMatters:
      'Lactalis already owns Président, Galbani, and Stonyfield. This acquisition vaults them past Schreiber in total US cheese volume and gives them unprecedented retail leverage. Integration will likely trigger aggressive pricing and shelf-space consolidation within 12 months.',
    likelyImpact:
      "Direct threat to Schreiber's private label positioning. Expect 5-8% margin pressure in natural cheese as Lactalis flexes scale. Risk of losing 2-3 major retail accounts during transition chaos if Schreiber doesn't proactively engage.",
    evidence: [],
    sources: [
      {
        title: 'Reuters M&A Wire',
        excerpt:
          'Lactalis to acquire Kraft natural cheese unit in $3.2B deal, creating largest US cheese company...',
        type: 'News',
      },
      {
        title: 'Wall Street Journal',
        excerpt:
          'Deal reshapes competitive landscape as Lactalis gains 28% market share in US cheese...',
        type: 'News',
      },
      {
        title: 'Kraft Heinz SEC Filing',
        excerpt:
          'Transaction expected to close Q2 2026 pending regulatory approval...',
        type: 'Filing',
      },
    ],
  },
  {
    id: '2',
    title:
      'Walmart demands 15% cost reduction from all dairy suppliers by March — contract renewals at risk',
    type: 'threat',
    category: 'market',
    confidence: 'high',
    timeHorizon: 'immediate',
    timeHorizonLabel: '0-6 months',
    radarDistance: 0.1,
    radarAngle: 120,
    isNew: true,
    dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(),
    recommendedAction:
      'Schedule executive meeting with Walmart procurement leadership within 2 weeks. Prepare counter-proposal showing value-engineering options vs. flat price cuts. Identify 2-3 SKU rationalizations that maintain margin while showing cost reduction.',
    whatChanged:
      "Walmart issued formal letter to all private label dairy suppliers requiring 15% landed cost reduction for 2026 contract renewals. Deadline for proposals is March 15, 2026. Non-responsive suppliers will face 'competitive rebid process.'",
    whyItMatters:
      'Walmart represents ~$340M of Schreiber annual revenue. A 15% cut would eliminate ~$18M in gross margin. Losing the contract entirely would be catastrophic. This is not negotiable posturing — Walmart executed similar demands in bakery category last year.',
    likelyImpact:
      'Best case: negotiate to 8-10% through operational efficiencies. Worst case: contract loss or margin destruction. Either outcome requires immediate executive engagement.',
    evidence: [],
    sources: [
      {
        title: 'Walmart Supplier Letter',
        excerpt:
          'Cost reduction targets for 2026 contracts require 15% improvement across dairy categories...',
        type: 'Internal',
      },
      {
        title: 'Bloomberg Retail',
        excerpt:
          'Walmart intensifies supplier cost pressure as inflation concerns persist...',
        type: 'News',
      },
    ],
  },
  {
    id: '3',
    title:
      'Precision fermentation startup Remilk secures FDA GRAS — animal-free dairy proteins now legal for US market',
    type: 'watch',
    category: 'technology',
    confidence: 'high',
    timeHorizon: 'strategic',
    timeHorizonLabel: '6-18 months',
    radarDistance: 0.55,
    radarAngle: 30,
    isNew: true,
    dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    recommendedAction:
      'Initiate technology assessment of precision fermentation capabilities. Explore partnership or licensing discussions with Remilk or competitors (Perfect Day, New Culture). Begin internal scenario planning for 10-year category disruption.',
    whatChanged:
      'Remilk received FDA Generally Recognized as Safe (GRAS) determination for its precision fermentation-derived whey protein. First commercial production begins Q3 2026 at new 50,000 sq ft facility in Denmark with US distribution rights secured.',
    whyItMatters:
      'Precision fermentation produces molecularly identical dairy proteins without cows. At scale, cost parity with traditional dairy is projected by 2028. This is the first credible threat to commodity dairy in 50 years. Early movers will define the category.',
    likelyImpact:
      "Near-term: minimal direct impact. 3-5 year: potential 5-10% erosion in protein ingredient category. 10+ year: existential category risk if Schreiber doesn't participate in transition.",
    evidence: [],
    sources: [
      {
        title: 'FDA GRAS Notice GRN 001023',
        excerpt:
          'Remilk whey protein concentrate meets GRAS requirements for use in food products...',
        type: 'Filing',
      },
      {
        title: 'TechCrunch',
        excerpt:
          'Remilk announces $120M Series B, plans US market entry following FDA clearance...',
        type: 'News',
      },
      {
        title: 'McKinsey Agrifood Report',
        excerpt:
          'Precision fermentation projected to capture 8-12% of dairy protein market by 2030...',
        type: 'Report',
      },
    ],
  },
  {
    id: '4',
    title:
      'USDA proposes mandatory methane reporting for dairy suppliers — compliance costs estimated at $2-4M annually',
    type: 'threat',
    category: 'regulatory',
    confidence: 'medium',
    timeHorizon: 'strategic',
    timeHorizonLabel: '6-18 months',
    radarDistance: 0.6,
    radarAngle: 90,
    dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    recommendedAction:
      'Engage IDFA and NMPF lobbying efforts on rule implementation timeline. Begin supplier audit program for emissions baseline. Evaluate capital investment in methane capture technology for owned/partnered farms.',
    whatChanged:
      'USDA published proposed rule requiring Scope 3 emissions reporting from all dairy processors with >$100M revenue. Comment period closes April 2026. If enacted, implementation required by January 2027.',
    whyItMatters:
      'Schreiber sources from 500+ farms across 8 states. Aggregating and verifying emissions data will require new systems and supplier agreements. Early movers will gain competitive advantage with ESG-focused retailers like Kroger and Whole Foods.',
    likelyImpact:
      "Compliance investment of $2-4M annually. Opportunity to differentiate with 'verified sustainable' positioning. Risk of retailer penalties if competitors achieve certification first.",
    evidence: [],
    sources: [
      {
        title: 'USDA Federal Register',
        excerpt:
          'Proposed rule for greenhouse gas emissions reporting in dairy supply chains...',
        type: 'Filing',
      },
      {
        title: 'Dairy Herd Management',
        excerpt:
          'Industry estimates $2-4M annual compliance costs for mid-size processors...',
        type: 'News',
      },
    ],
  },
  {
    id: '5',
    title:
      'Kroger RFP for $180M private label cheese contract — decision in 90 days',
    type: 'opportunity',
    category: 'market',
    confidence: 'high',
    timeHorizon: 'immediate',
    timeHorizonLabel: '0-6 months',
    radarDistance: 0.2,
    radarAngle: 135,
    isNew: true,
    dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    recommendedAction:
      'Assemble cross-functional RFP response team. Prepare manufacturing capacity analysis for incremental 45M lbs annually. Develop differentiated proposal emphasizing quality consistency, innovation pipeline, and sustainability credentials.',
    whatChanged:
      'Kroger issued RFP for private label natural and processed cheese supply. Current supplier (TreeHouse Foods) contract expires June 2026. Volume represents ~$180M annually across 2,800 stores. Proposals due February 28.',
    whyItMatters:
      'TreeHouse Foods announced strategic exit from dairy category — Kroger must find new supplier. This is the largest private label cheese contract to hit market in 3 years. Winning would add 12% to Schreiber revenue.',
    likelyImpact:
      'Win: $180M revenue, 45M lbs volume, 150+ jobs at manufacturing facilities. Requires $15-20M capex for capacity. Loss: contract goes to Lactalis or Saputo, strengthening competitor positioning.',
    evidence: [],
    sources: [
      {
        title: 'Kroger Procurement Portal',
        excerpt:
          'RFP #2026-DC-4892: Private label cheese supply agreement, proposals due Feb 28...',
        type: 'Internal',
      },
      {
        title: 'Food Business News',
        excerpt:
          'TreeHouse Foods exits dairy category, creating $500M+ supply void in private label...',
        type: 'News',
      },
    ],
  },
  {
    id: '6',
    title:
      'Saputo announces $400M Wisconsin mega-plant — direct threat to Schreiber Midwest operations',
    type: 'threat',
    category: 'competition',
    confidence: 'high',
    timeHorizon: 'strategic',
    timeHorizonLabel: '6-18 months',
    radarDistance: 0.45,
    radarAngle: 160,
    dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    recommendedAction:
      'Accelerate automation investments at Green Bay and Carthage facilities. Engage Wisconsin Economic Development Corporation for matching incentives. Prepare workforce retention strategy — Saputo will recruit heavily from local talent pool.',
    whatChanged:
      'Saputo announced $400M investment in new 500,000 sq ft cheese production facility in Fond du Lac, Wisconsin. Groundbreaking Q3 2026, operational by Q4 2027. Will produce mozzarella and cheddar for retail and foodservice.',
    whyItMatters:
      "Located 45 miles from Schreiber's Green Bay facility and 90 miles from Carthage. Saputo will compete directly for milk supply, labor, and regional customers. Their scale economics will pressure Schreiber pricing in core markets.",
    likelyImpact:
      'Milk procurement costs may rise 3-5% due to competition. Labor costs will increase as Saputo offers signing bonuses. Risk of losing regional foodservice accounts to Saputo proximity advantage.',
    evidence: [],
    sources: [
      {
        title: 'Milwaukee Journal Sentinel',
        excerpt:
          'Saputo selects Fond du Lac for $400M cheese facility, creating 350 jobs...',
        type: 'News',
      },
      {
        title: 'Saputo Investor Call Transcript',
        excerpt:
          'CEO confirms Wisconsin facility will target retail private label and QSR channels...',
        type: 'Filing',
      },
    ],
  },
  {
    id: '7',
    title:
      'Chipotle seeking new queso supplier after Leprino quality issues — $45M annual contract available',
    type: 'opportunity',
    category: 'market',
    confidence: 'medium',
    timeHorizon: 'immediate',
    timeHorizonLabel: '0-6 months',
    radarDistance: 0.25,
    radarAngle: 100,
    dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    recommendedAction:
      'Request meeting with Chipotle supply chain leadership. Prepare samples of Schreiber queso formulations. Develop quick-turn capability proposal emphasizing quality control and traceability systems.',
    whatChanged:
      'Chipotle experienced 3 separate queso quality incidents in Q4 2025 with current supplier Leprino Foods. Internal sources indicate Chipotle procurement is actively seeking secondary supplier or full replacement. Volume is ~$45M annually.',
    whyItMatters:
      'Chipotle is the #1 premium fast-casual chain with 3,400+ locations. Their quality standards are rigorous but winning this contract would establish Schreiber in premium QSR segment. Leprino vulnerability is time-limited.',
    likelyImpact:
      'Win: $45M revenue, premium margin foodservice volume, reference customer for other QSR prospects. Window of opportunity is 60-90 days before Leprino stabilizes relationship.',
    evidence: [],
    sources: [
      {
        title: 'Restaurant Business Online',
        excerpt:
          'Chipotle addresses queso quality concerns, hints at supply chain changes...',
        type: 'News',
      },
      {
        title: 'Industry Source',
        excerpt:
          'Multiple foodservice suppliers confirm Chipotle is evaluating alternatives to Leprino...',
        type: 'Internal',
      },
    ],
  },
  {
    id: '8',
    title:
      'California SB 1287 mandates cage-free eggs in dairy-containing products — affects 23% of Schreiber SKUs',
    type: 'threat',
    category: 'regulatory',
    confidence: 'high',
    timeHorizon: 'immediate',
    timeHorizonLabel: '0-6 months',
    radarDistance: 0.3,
    radarAngle: 75,
    isNew: true,
    dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    recommendedAction:
      'Audit all California-distributed SKUs for egg-derived ingredients. Engage cage-free egg suppliers for transition pricing. Communicate compliance timeline to California retail customers.',
    whatChanged:
      'California SB 1287 signed into law December 2025. Requires all egg-containing food products sold in California to use cage-free eggs by July 1, 2026. Includes processed foods with egg-derived ingredients like lecithin.',
    whyItMatters:
      'California represents 18% of Schreiber retail volume. 23% of SKUs contain egg-derived ingredients. Non-compliance means product ban from California market. Reformulation and supplier transition required within 5 months.',
    likelyImpact:
      'Ingredient cost increase of $3-5M annually. Reformulation investment of $1-2M. Failure to comply: loss of ~$65M California revenue.',
    evidence: [],
    sources: [
      {
        title: 'California Legislative Record',
        excerpt:
          'SB 1287 Animal Welfare in Food Production Act signed by Governor...',
        type: 'Filing',
      },
      {
        title: 'Los Angeles Times',
        excerpt:
          'New California law extends cage-free requirements to processed foods...',
        type: 'News',
      },
    ],
  },
  {
    id: '9',
    title:
      'Tetra Pak launches AI-powered predictive maintenance — early adopters seeing 23% downtime reduction',
    type: 'opportunity',
    category: 'technology',
    confidence: 'high',
    timeHorizon: 'strategic',
    timeHorizonLabel: '6-18 months',
    radarDistance: 0.5,
    radarAngle: 55,
    dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    recommendedAction:
      'Schedule Tetra Pak demo for operations leadership. Request case studies from early adopter dairy processors. Develop business case for pilot deployment at highest-volume facility.',
    whatChanged:
      'Tetra Pak launched PlantMaster AI module with predictive maintenance capabilities. Early adopter Arla Foods reports 23% reduction in unplanned downtime and 15% improvement in OEE. Available for retrofit on existing Tetra Pak lines.',
    whyItMatters:
      'Schreiber operates 47 Tetra Pak processing lines across 8 facilities. At current downtime rates, a 23% improvement would recover ~$8M in lost production annually. Arla achieved payback in 14 months.',
    likelyImpact:
      'Investment: $2-3M for full deployment. Return: $6-8M annually in recovered capacity. Competitive necessity as peers adopt similar capabilities.',
    evidence: [],
    sources: [
      {
        title: 'Tetra Pak Press Release',
        excerpt:
          'PlantMaster AI delivers 23% downtime reduction for Arla Foods...',
        type: 'News',
      },
      {
        title: 'Dairy Foods Magazine',
        excerpt:
          'Predictive maintenance becoming table stakes for dairy processing efficiency...',
        type: 'Report',
      },
    ],
  },
  {
    id: '10',
    title:
      'Bel Group acquires Boursin and Nurishh brands — signals aggressive US plant-based entry',
    type: 'watch',
    category: 'capital',
    confidence: 'medium',
    timeHorizon: 'strategic',
    timeHorizonLabel: '6-18 months',
    radarDistance: 0.65,
    radarAngle: 40,
    dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    recommendedAction:
      'Monitor Bel Group US distribution expansion. Assess competitive overlap in cream cheese and spreadable segments. Evaluate defensive innovation in plant-based spreadables.',
    whatChanged:
      'Bel Group completed acquisition of remaining Boursin stake from Lactalis and announced US expansion of Nurishh plant-based cheese line. $50M marketing investment planned for 2026. Targeting Whole Foods, Sprouts, and natural channel.',
    whyItMatters:
      "Bel's Babybel and Laughing Cow brands already compete with Schreiber snacking cheese. Adding premium Boursin and plant-based Nurishh creates full portfolio threat. Their DTC and natural channel focus indicates premiumization strategy.",
    likelyImpact:
      'Minimal near-term threat to core Schreiber business. Strategic concern in premium/specialty segments where margins are highest. Watch for private label disruption as Bel seeks manufacturing partners.',
    evidence: [],
    sources: [
      {
        title: 'Food Navigator',
        excerpt:
          'Bel Group consolidates Boursin ownership, plans aggressive US growth...',
        type: 'News',
      },
      {
        title: 'Progressive Grocer',
        excerpt: 'Nurishh plant-based cheese expands to 3,000 US stores...',
        type: 'News',
      },
    ],
  },
  {
    id: '11',
    title:
      'Class III milk futures surge 18% on drought concerns — margin protection needed',
    type: 'threat',
    category: 'capital',
    confidence: 'high',
    timeHorizon: 'immediate',
    timeHorizonLabel: '0-6 months',
    radarDistance: 0.2,
    radarAngle: 150,
    isNew: true,
    dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(),
    recommendedAction:
      'Immediately review hedging positions with treasury. Lock in forward contracts for Q2-Q3 2026. Initiate customer pricing discussions for contracts with commodity pass-through clauses.',
    whatChanged:
      'CME Class III milk futures for Q2 2026 jumped 18% in past 2 weeks following USDA drought forecast for California Central Valley. Spot milk prices already up 12% in Western region.',
    whyItMatters:
      'Class III milk is primary input for cheese production. Each 10% increase in milk costs compresses gross margin by ~$15M annually. Current hedging coverage only extends through Q1 2026.',
    likelyImpact:
      'Unhedged exposure: potential $25-30M margin compression if prices hold. Hedging at current levels locks in higher costs but limits downside. Customer contracts need pricing adjustment or margin sacrifice.',
    evidence: [],
    sources: [
      {
        title: 'CME Group Market Data',
        excerpt:
          'Class III milk futures May 2026 contract up 18% month-over-month...',
        type: 'Analysis',
      },
      {
        title: 'USDA Drought Monitor',
        excerpt:
          'California Central Valley downgraded to severe drought, affecting dairy production...',
        type: 'Report',
      },
    ],
  },
  {
    id: '12',
    title:
      'Amazon Fresh expands private label dairy to 45 states — seeking regional cheese partners',
    type: 'opportunity',
    category: 'market',
    confidence: 'medium',
    timeHorizon: 'strategic',
    timeHorizonLabel: '6-18 months',
    radarDistance: 0.4,
    radarAngle: 15,
    dateAdded: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    recommendedAction:
      'Initiate contact with Amazon Fresh private label team. Prepare capabilities presentation emphasizing logistics, food safety, and regional manufacturing footprint. Develop proposal for Midwest and Northeast regions.',
    whatChanged:
      'Amazon Fresh announced expansion of private label grocery program to 45 states, up from 12. Specifically seeking regional dairy partners for cheese, yogurt, and milk. RFI process begins Q1 2026.',
    whyItMatters:
      "Amazon disrupted every category they've entered. Private label dairy is no exception. Early partnership provides first-mover advantage and shapes Amazon's supplier expectations. Late entry means competing against established relationships.",
    likelyImpact:
      'Potential: $30-50M annual revenue in 3-5 year horizon. Requires investment in e-commerce fulfillment capabilities. Risk of channel conflict with traditional retail customers.',
    evidence: [],
    sources: [
      {
        title: 'Supermarket News',
        excerpt:
          'Amazon Fresh private label expansion seeks regional food manufacturing partners...',
        type: 'News',
      },
      {
        title: 'Amazon Supplier Portal',
        excerpt: 'RFI for regional dairy suppliers opens January 2026...',
        type: 'Internal',
      },
    ],
  },
];

/**
 * Mock impacted concepts data per signal
 */
export const mockImpactedConcepts: Record<string, ImpactedConcept[]> = {
  '1': [
    {
      id: 'ic-1',
      conceptName: 'Premium Snack Cheese Line Extension',
      impact:
        'Direct competitive threat from Lactalis-Kraft synergies in retail pricing',
      suggestedChange:
        'Accelerate launch timeline by 3 months to establish market position before competitor price cuts',
      image:
        'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&h=200&fit=crop',
    },
    {
      id: 'ic-2',
      conceptName: 'Retail Partnership Strategy',
      impact: 'Lactalis integration may shift retailer negotiations leverage',
      suggestedChange:
        'Add contingency pricing tiers and lock in current agreements with key accounts',
      image:
        'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=200&fit=crop',
    },
  ],
  '2': [
    {
      id: 'ic-3',
      conceptName: 'Walmart Private Label Contract',
      impact:
        '15% cost reduction demand directly threatens current contract margins',
      suggestedChange:
        'Revise cost structure to identify 8-10% savings through operational efficiencies',
      image:
        'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=200&fit=crop',
    },
    {
      id: 'ic-4',
      conceptName: 'Value-Tier Cheese Line',
      impact: 'Price pressure may accelerate need for value-tier offerings',
      suggestedChange:
        'Fast-track value-tier SKU development to demonstrate cost leadership',
      image:
        'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=400&h=200&fit=crop',
    },
  ],
  '3': [
    {
      id: 'ic-5',
      conceptName: 'Plant-Based Cheese Line',
      impact: 'Precision fermentation advances threaten differentiation',
      suggestedChange:
        'Partner with fermentation startups rather than competing directly',
      image:
        'https://images.unsplash.com/photo-1628689469838-524a4a973b8e?w=400&h=200&fit=crop',
    },
  ],
  '4': [
    {
      id: 'ic-6',
      conceptName: 'Sustainability Initiative',
      impact: 'Methane reporting adds compliance burden',
      suggestedChange: 'Accelerate ESG certification timeline',
      image:
        'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=400&h=200&fit=crop',
    },
  ],
  '5': [
    {
      id: 'ic-7',
      conceptName: 'Kroger Account Strategy',
      impact: 'Major opportunity to capture $180M contract',
      suggestedChange: 'Assemble cross-functional RFP team',
      image:
        'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=200&fit=crop',
    },
  ],
};

/**
 * Future predictions mock data
 */
export const mockPredictions: Prediction[] = [
  {
    id: '1',
    title: 'Lactalis expected to integrate Kraft cheese operations by Q3 2026',
    description:
      'Post-acquisition synergies will likely trigger aggressive pricing strategies in retail channels, potentially compressing margins for regional players by 15-20%.',
    sources: [
      {
        uuid: 'src-1a',
        title: 'Lactalis-Kraft Merger Analysis',
        url: 'https://www.bloomberg.com/news/articles/2025/lactalis-kraft-merger',
        description:
          'Post-acquisition synergies will likely trigger aggressive pricing strategies in retail channels.',
        classification: 'News',
      },
      {
        uuid: 'src-1b',
        title: 'Dairy Industry Consolidation Report',
        url: 'https://www.dairyreporter.com/Article/2025/industry-consolidation',
        description:
          'Regional players face margin compression of 15-20% from major acquisitions.',
        classification: 'Report',
      },
    ],
    hasAiReasoning: true,
  },
  {
    id: '2',
    title: 'FDA likely to finalize sodium reduction guidelines in 2026',
    description:
      'New voluntary sodium targets for cheese products could require reformulation investments. Early movers on low-sodium offerings may capture growing health-conscious segment.',
    sources: [
      {
        uuid: 'src-2a',
        title: 'FDA Sodium Reduction Initiative',
        url: 'https://www.fda.gov/food/sodium-reduction-guidelines-2026',
        description:
          'New voluntary sodium targets for cheese products will be finalized in 2026.',
        classification: 'Filing',
      },
      {
        uuid: 'src-2b',
        title: 'Reformulation Trends in Dairy',
        url: 'https://www.foodnavigator-usa.com/Article/2025/sodium-reduction',
        description:
          'Early movers on low-sodium offerings capturing health-conscious segment.',
        classification: 'News',
      },
    ],
    hasAiReasoning: true,
  },
  {
    id: '3',
    title: 'Plant-based cheese segment to reach $5B by 2028',
    description:
      'Accelerating consumer adoption and improving product quality suggest traditional cheese makers need hybrid strategies or risk losing younger demographic entirely.',
    sources: [
      {
        uuid: 'src-3a',
        title: 'Plant-Based Dairy Market Forecast',
        url: 'https://www.nielsen.com/insights/plant-based-dairy-2028',
        description:
          'Plant-based cheese market projected to reach $5B by 2028.',
        classification: 'Report',
      },
      {
        uuid: 'src-3b',
        title: 'Alternative Protein Industry Report',
        url: 'https://gfi.org/resource/plant-based-cheese-market/',
        description:
          'Traditional cheese makers need hybrid strategies to retain younger demographics.',
        classification: 'Analysis',
      },
    ],
    hasAiReasoning: true,
  },
  {
    id: '4',
    title: 'Amazon Fresh to become top-5 cheese retailer by 2027',
    description:
      'E-commerce dairy growth trajectory suggests online channels will capture 12% of cheese sales. Brands without direct-to-consumer capabilities will depend on wholesale relationships.',
    sources: [
      {
        uuid: 'src-4a',
        title: 'E-commerce Grocery Trends',
        url: 'https://www.emarketer.com/content/e-commerce-grocery-2027',
        description:
          'Online channels projected to capture 12% of cheese sales.',
        classification: 'Report',
      },
      {
        uuid: 'src-4b',
        title: 'Amazon Fresh Expansion Analysis',
        url: 'https://www.supermarketnews.com/online-retail/amazon-fresh-growth',
        description:
          'Amazon Fresh on track to become top-5 cheese retailer by 2027.',
        classification: 'News',
      },
    ],
    hasAiReasoning: true,
  },
  {
    id: '5',
    title: 'California drought conditions to persist through 2027',
    description:
      'Extended drought forecasts indicate sustained pressure on Class III milk prices. Strategic hedging and supply chain diversification become critical risk management priorities.',
    sources: [
      {
        uuid: 'src-5a',
        title: 'California Agricultural Water Report',
        url: 'https://www.usda.gov/oce/commodity/wasde/drought-impact-2027',
        description:
          'Extended drought forecasts indicate sustained pressure on milk prices.',
        classification: 'Filing',
      },
      {
        uuid: 'src-5b',
        title: 'Class III Milk Futures Analysis',
        url: 'https://www.cmegroup.com/market-data/dairy/class-iii-milk.html',
        description: 'Class III futures rising due to supply chain pressures.',
        classification: 'Analysis',
      },
    ],
    hasAiReasoning: true,
  },
];

/**
 * Trend bullets by time period
 */
export const trendBullets: Record<TimePeriod, TrendBullet[]> = {
  '6mo': [
    {
      text: 'reshaping dynamics as Lactalis integrates Kraft cheese operations',
      highlight: 'Industry consolidation',
    },
    {
      text: 'in Central Valley threatening supply chains; Class III futures rising',
      highlight: 'Drought conditions',
    },
    {
      text: 'from private label brands entering premium snack segments',
      highlight: 'Margin pressure',
    },
  ],
  '12mo': [
    {
      text: 'accelerating across dairy with heavy investment in predictive systems',
      highlight: 'AI adoption',
    },
    {
      text: 'from yogurt and plant-based categories targeting premium cheese',
      highlight: 'New entrants',
    },
    {
      text: 'flowing into alternative protein and precision fermentation ventures',
      highlight: 'Venture capital',
    },
  ],
  '12plus': [
    {
      text: 'achieving quality parity, threatening younger demographics',
      highlight: 'Plant-based alternatives',
    },
    {
      text: 'advancing with potential to produce dairy proteins without cows',
      highlight: 'Precision fermentation',
    },
    {
      text: 'around carbon footprint likely to create new compliance requirements',
      highlight: 'Climate regulations',
    },
  ],
};

export const periodLabels: Record<TimePeriod, string> = {
  '6mo': 'Past 6 Months',
  '12mo': 'Past 12 Months',
  '12plus': 'Past 12+ Months',
};

/**
 * Future domains mock data
 */
export const futureDomains: FutureDomain[] = [
  {
    id: '1',
    name: 'Precision Fermentation Partnerships',
    description:
      'Strategic alliances with biotech firms developing animal-free dairy proteins',
    opportunity:
      'First-mover advantage in hybrid traditional/fermented cheese products',
    relatedSignals: ['Remilk FDA GRAS', 'Plant-based growth'],
    timeframe: '18-36 months',
  },
  {
    id: '2',
    name: 'QSR Premium Cheese Solutions',
    description:
      'Specialized cheese formulations for quick-service restaurant chains',
    opportunity:
      'Capture $500M+ QSR cheese market with quality-focused offerings',
    relatedSignals: ['Chipotle seeking supplier', 'Leprino quality issues'],
    timeframe: '6-12 months',
  },
  {
    id: '3',
    name: 'Carbon-Neutral Dairy Line',
    description:
      'Vertically integrated sustainable cheese with verified carbon credits',
    opportunity:
      'Premium positioning for ESG-focused retailers like Whole Foods',
    relatedSignals: ['USDA methane reporting', 'California regulations'],
    timeframe: '12-24 months',
  },
  {
    id: '4',
    name: 'Direct-to-Consumer Cheese Subscriptions',
    description:
      'Artisanal and premium cheese subscription boxes bypassing retail',
    opportunity: 'Capture 12% e-commerce cheese growth with higher margins',
    relatedSignals: ['Amazon Fresh growth', 'Walmart pressure'],
    timeframe: '6-18 months',
  },
];

/**
 * Concept opportunities mock data
 */
export const conceptOpportunities: ConceptOpportunity[] = [
  {
    id: '1',
    title: 'Value-Tier Shredded Cheese Line',
    description:
      'Economy-positioned shredded cheese to address Walmart cost reduction demands while protecting premium margins',
    signalBasis: 'Walmart 15% cost reduction mandate',
    urgency: 'immediate',
    potentialImpact: 'Protect $340M Walmart relationship',
    image:
      'https://images.unsplash.com/photo-1552767059-ce182ead6c1b?w=400&h=200&fit=crop',
  },
  {
    id: '2',
    title: 'Premium QSR Queso Formulation',
    description:
      'Restaurant-grade queso with enhanced meltability and consistency for fast-casual chains',
    signalBasis: 'Chipotle supplier opportunity',
    urgency: 'immediate',
    potentialImpact: 'Capture $45M annual contract',
    image:
      'https://images.unsplash.com/photo-1582169296194-e4d644c48063?w=400&h=200&fit=crop',
  },
  {
    id: '3',
    title: 'Kroger Private Label Partnership',
    description:
      'Comprehensive proposal for natural and processed cheese supply replacing TreeHouse Foods',
    signalBasis: 'Kroger $180M RFP opportunity',
    urgency: 'immediate',
    potentialImpact: '+12% revenue, 45M lbs volume',
    image:
      'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=400&h=200&fit=crop',
  },
  {
    id: '4',
    title: 'Hybrid Fermented Cheese Pilot',
    description:
      'Blend traditional dairy with precision fermentation proteins for next-gen sustainability claims',
    signalBasis: 'Remilk FDA approval, plant-based trends',
    urgency: 'strategic',
    potentialImpact: 'Category leadership in alt-dairy',
    image:
      'https://images.unsplash.com/photo-1628689469838-524a4a973b8e?w=400&h=200&fit=crop',
  },
  {
    id: '5',
    title: 'Cage-Free Reformulation Program',
    description:
      'Systematic reformulation of California-distributed SKUs to comply with SB 1287',
    signalBasis: 'California SB 1287 mandate',
    urgency: 'immediate',
    potentialImpact: 'Protect $65M California revenue',
    image:
      'https://images.unsplash.com/photo-1569127959161-2b1297b2d9a6?w=400&h=200&fit=crop',
  },
];

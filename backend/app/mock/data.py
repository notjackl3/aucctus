"""Mock analysis result data matching the frontend contract.

This is the Phase 1 stand-in for real agent orchestration.
Phase 2+ will replace `build_mock_result` with real pipeline output.
"""

from app.shared.utils import utc_now


def build_mock_result(
    analysis_id: str,
    company_name: str,
    market_space: str,
    company_context: str | None,
) -> dict:
    """Build a realistic mock AnalysisResult matching the frontend TypeScript types.

    Uses the same shape as frontend/src/data/mockData.ts but parameterized
    by the actual request values.
    """
    now = utc_now()
    return {
        "id": analysis_id,
        "request": {
            "companyName": company_name,
            "marketSpace": market_space,
            "companyContext": company_context,
        },
        "status": "completed",
        "steps": [
            {"step": "incumbents", "label": "Incumbents", "status": "completed",
             "startedAt": now, "completedAt": now},
            {"step": "emerging_competitors", "label": "Emerging Competitors", "status": "completed",
             "startedAt": now, "completedAt": now},
            {"step": "market_sizing", "label": "Market Sizing", "status": "completed",
             "startedAt": now, "completedAt": now},
            {"step": "synthesis", "label": "Opportunity Assessment", "status": "completed",
             "startedAt": now, "completedAt": now},
        ],
        "incumbents": {
            "summary": f"The {market_space} space features several established players with strong enterprise distribution. Market leaders have deep integrations and significant switching costs, though newer entrants are challenging with modern AI-native approaches.",
            "players": [
                {
                    "name": "Market Leader Alpha",
                    "description": f"Dominant enterprise player in {market_space} with deep legacy integrations and broad Fortune 500 adoption.",
                    "marketPosition": "Leader",
                    "strengths": [
                        "Massive enterprise installed base",
                        "Deep ERP and workflow integrations",
                        "Global compliance coverage",
                        "End-to-end platform approach",
                    ],
                    "weaknesses": [
                        "Legacy UX frequently cited as pain point",
                        "Slow AI adoption compared to newer entrants",
                        "Complex pricing and implementation",
                        "High total cost of ownership",
                    ],
                    "estimatedRevenue": "$1.5B",
                    "founded": "2005",
                    "headquarters": "San Francisco, CA",
                },
                {
                    "name": "Challenger Corp",
                    "description": f"Modern platform targeting mid-market with AI-first tools for {market_space}.",
                    "marketPosition": "Challenger",
                    "strengths": [
                        "AI-native architecture",
                        "Real-time controls and policy enforcement",
                        "Strong developer API",
                        "Modern UX driving high NPS",
                    ],
                    "weaknesses": [
                        "Limited enterprise penetration",
                        "Narrow geographic coverage",
                        "Still building advanced features",
                        "Dependent on single revenue stream",
                    ],
                    "estimatedRevenue": "$400M",
                    "founded": "2018",
                    "headquarters": "New York, NY",
                },
                {
                    "name": "FastGrow Inc",
                    "description": f"Fast-growing platform emphasizing cost savings and automation in {market_space}.",
                    "marketPosition": "Challenger",
                    "strengths": [
                        "Best-in-class AI for duplicate detection and savings",
                        "Aggressive product velocity",
                        "Strong word-of-mouth growth",
                        "Developer-friendly integrations",
                    ],
                    "weaknesses": [
                        "US-only operations",
                        "Limited to mid-market segment",
                        "Narrow product scope",
                        "Unproven at enterprise scale",
                    ],
                    "estimatedRevenue": "$250M",
                    "founded": "2019",
                    "headquarters": "New York, NY",
                },
            ],
            "marketConcentration": "Moderate — top 3 players control ~50% of the market, but a long tail of regional and vertical solutions persists",
            "confidence": {
                "level": "high",
                "score": 82,
                "reasoning": "Well-documented public market with clear leaders. Revenue estimates triangulated from analyst reports and press coverage.",
            },
            "sources": [
                {
                    "title": f"Industry Analysis: {market_space} Market 2025",
                    "url": "https://example.com/industry-report",
                    "publisher": "Industry Analysts",
                    "date": "2025-09",
                    "snippet": "Market leadership remains concentrated among established players, though challengers are gaining share rapidly.",
                },
                {
                    "title": f"The State of {market_space}",
                    "url": "https://example.com/state-of-market",
                    "publisher": "McKinsey & Company",
                    "date": "2025-06",
                },
            ],
        },
        "emergingCompetitors": {
            "summary": f"Significant venture capital activity in {market_space}, with $600M+ deployed in the last 18 months across multiple funded startups. The funding trend is accelerating, with particular focus on AI-native and vertical-specific solutions.",
            "competitors": [
                {
                    "name": "NovaTech AI",
                    "description": f"AI-powered platform that works with existing infrastructure for {market_space}. No rip-and-replace required.",
                    "fundingStage": "Series B",
                    "fundingAmount": "$45M",
                    "fundingDate": "2025-08",
                    "investors": ["Tiger Global", "DST Global Partners"],
                    "differentiator": "Infrastructure-agnostic approach eliminates switching costs. AI learns company-specific patterns automatically.",
                },
                {
                    "name": "AutoFlow (stealth)",
                    "description": f"Building autonomous AI agents for end-to-end {market_space} workflows.",
                    "fundingStage": "Series A",
                    "fundingAmount": "$28M",
                    "fundingDate": "2026-01",
                    "investors": ["a16z", "Elad Gil"],
                    "differentiator": "Agentic AI that learns company-specific rules and autonomously handles 95% of workflows without human review.",
                },
                {
                    "name": "VerticalEdge",
                    "description": f"Vertical-specific solution for {market_space} in construction and field services.",
                    "fundingStage": "Seed",
                    "fundingAmount": "$12M",
                    "fundingDate": "2025-11",
                    "investors": ["Founders Fund", "Brick & Mortar Ventures"],
                    "differentiator": "Purpose-built for industries where requirements differ fundamentally from standard office workflows.",
                },
            ],
            "totalFundingInSpace": "$600M+",
            "fundingTrend": "accelerating",
            "confidence": {
                "level": "medium",
                "score": 70,
                "reasoning": "Funding data from public sources is reasonably reliable for announced rounds. Stealth startups and undisclosed rounds likely undercount total activity by 20-30%.",
            },
            "sources": [
                {
                    "title": f"{market_space} Startups Funding Tracker",
                    "url": "https://example.com/funding-tracker",
                    "publisher": "Crunchbase",
                    "date": "2026-03",
                },
                {
                    "title": "FinTech Funding Report Q4 2025",
                    "url": "https://example.com/fintech-funding",
                    "publisher": "CB Insights",
                    "date": "2025-12",
                    "snippet": "AI-powered solutions in this category attracted $200M in Q4 alone, a 40% increase over Q3.",
                },
            ],
        },
        "marketSizing": {
            "summary": f"The global {market_space} market is projected to reach $10B by 2030, growing at a 13% CAGR from its current $4.5B base. Growth is driven by enterprise AI adoption, remote work normalization, and increasing regulatory complexity.",
            "tam": "$10B",
            "sam": "$4.5B",
            "som": "$700M",
            "cagr": "13.0%",
            "growthDrivers": [
                "Enterprise AI adoption accelerating across business functions",
                "Remote/hybrid work driving demand for automated solutions",
                "Increasing regulatory complexity across jurisdictions",
                "Executive mandate to reduce costs via automation",
                "Real-time visibility becoming table-stakes",
            ],
            "constraints": [
                "Enterprise procurement cycles remain 6-12 months",
                "Data privacy regulations limit AI training on sensitive data",
                "Integration complexity with legacy systems",
                "Employee resistance to AI-automated workflows",
            ],
            "timeframe": "2025-2030",
            "confidence": {
                "level": "medium",
                "score": 66,
                "reasoning": "Market sizing estimates vary across analyst reports by +/-20%. TAM definition is broad and includes adjacent categories.",
            },
            "sources": [
                {
                    "title": f"Global {market_space} Market Report 2025-2030",
                    "url": "https://example.com/market-report",
                    "publisher": "Grand View Research",
                    "date": "2025-04",
                    "snippet": "The market is expected to grow at a CAGR of 13% from 2025 to 2030, driven by AI integration.",
                },
                {
                    "title": "AI in Enterprise Software: Market Forecast",
                    "url": "https://example.com/ai-forecast",
                    "publisher": "MarketsandMarkets",
                    "date": "2025-07",
                },
            ],
        },
        "opportunityAssessment": {
            "recommendation": "maybe",
            "score": 68,
            "headline": f"Moderate strategic fit — {company_name}'s existing capabilities create a plausible entry path into {market_space}, but competitive intensity warrants careful positioning.",
            "reasoning": f"{company_name} has relevant domain adjacency that could provide a natural wedge into {market_space}. The market is large (~$10B TAM) and growing rapidly (13% CAGR), with incumbents vulnerable on UX and AI capabilities. However, the space is increasingly crowded with well-funded startups, and {company_name} would need to move quickly to establish position before the next wave of consolidation.",
            "reasonsToBelieve": [
                f"{company_name}'s existing infrastructure provides data and distribution advantages",
                "Incumbent leader is widely disliked, creating switching opportunity",
                "Strong CAGR indicates sustained demand growth, not hype cycle",
                f"{company_name}'s brand and technical reputation support credibility in this space",
            ],
            "reasonsToChallenge": [
                "Entering a market with $600M+ in recent startup funding signals crowded competition",
                "Well-capitalized challengers are executing aggressively in this exact space",
                f"Domain expertise gap — {market_space} requires specialized knowledge not core to {company_name}",
                "Enterprise sales motion may differ significantly from current go-to-market",
                "Risk of distracting from core business during a critical period",
            ],
            "whiteSpaceOpportunities": [
                f"Integrated solution leveraging {company_name}'s existing platform",
                "Cross-border capabilities using existing global infrastructure",
                "Embedded tools for platform partners and ecosystem",
                "Predictive analytics using proprietary data signals",
            ],
            "keyRisks": [
                "Competitors could partner to neutralize data advantage",
                "Enterprise go-to-market requires significant investment",
                "Regulatory complexity across jurisdictions",
            ],
            "confidence": {
                "level": "medium",
                "score": 72,
                "reasoning": "Moderate confidence in strategic logic and market dynamics. Uncertainty around execution risk and competitive response timelines.",
            },
        },
        "createdAt": now,
        "completedAt": now,
    }

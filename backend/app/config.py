"""Application configuration."""

import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

# ── Paths ──
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
DATABASE_PATH = DATA_DIR / "aucctus.db"

# ── Server ──
API_PREFIX = "/api"
CORS_ORIGINS = ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"]

# ── API keys ──
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "")

# ── LLM models ──
LLM_MODEL_STRONG = "gpt-4o"
LLM_MODEL_FAST = "gpt-4o-mini"
EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMENSIONS = 1536

# ── Analysis steps ──
ANALYSIS_STEPS = [
    ("incumbents", "Incumbents"),
    ("emerging_competitors", "Emerging Competitors"),
    ("market_sizing", "Market Sizing"),
    ("synthesis", "Opportunity Assessment"),
]

# ── Tavily budgets ──
TAVILY_MAX_RESULTS = 5
TAVILY_SEARCHES_PER_AGENT = 3
TAVILY_DEFAULT_SEARCH_DEPTH = "basic"  # "basic" = 1 credit, "advanced" = 2 credits
TAVILY_CACHE_TTL_HOURS = 24

# ── Evaluation posture ──
DEFAULT_EVALUATION_POSTURE = "established_company"  # established_company | adjacency_expansion | new_market_entry | new_venture

# ── Claim extraction ──
MAX_CLAIMS_PER_AGENT = 8

# ── Insight budgets ──
INITIAL_INSIGHTS_PER_ANALYSIS = 16
INSIGHTS_PER_RESEARCH_AGENT = 4
INSIGHTS_FROM_SYNTHESIS = 4
INSIGHTS_PER_EXPLORATION_QUESTION = 3
FOLLOW_UPS_PER_QUESTION = 3
MAX_INSIGHTS_PER_WORKSPACE = 60
MAX_QUESTIONS_PER_WORKSPACE = 20
MAX_EXPLORATION_DEPTH = 5

# ── Confidence thresholds ──
CONFIDENCE_HIDE_THRESHOLD = 30
CONFIDENCE_COLLAPSE_THRESHOLD = 50
CONFIDENCE_PIN_THRESHOLD = 80

# ── Dedup thresholds ──
INSIGHT_SIMILARITY_MERGE_THRESHOLD = 0.88
INSIGHT_SIMILARITY_GROUP_THRESHOLD = 0.72

# ── Scale limits ──
MAX_DOCUMENTS_PER_COMPANY = 10
MAX_CHUNKS_PER_DOCUMENT = 100
MAX_REPORT_SECTIONS = 6

# ── Feature flags ──
_force_mock: bool = False

def use_real_apis() -> bool:
    """Check if real API keys are configured."""
    if _force_mock:
        return False
    return bool(OPENAI_API_KEY and TAVILY_API_KEY)

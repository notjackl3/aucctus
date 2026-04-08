"""Domain enumerations."""

from enum import Enum


class AnalysisStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    ERROR = "error"


class OperationStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    COMPLETED_WITH_WARNINGS = "completed_with_warnings"
    ERROR = "error"


class SourceTier(str, Enum):
    TIER_1 = "tier_1"  # Major publications, analyst firms
    TIER_2 = "tier_2"  # Industry press, established tech media
    TIER_3 = "tier_3"  # Blogs, unknown sources
    UNKNOWN = "unknown"


class ClaimType(str, Enum):
    MARKET_SIZE = "market_size"
    FUNDING = "funding"
    REVENUE = "revenue"
    PRODUCT = "product"
    COMPETITIVE = "competitive"
    TREND = "trend"
    GENERAL = "general"


class DisplayStatus(str, Enum):
    PINNED = "pinned"
    SUGGESTED = "suggested"
    VISIBLE = "visible"
    COLLAPSED = "collapsed"
    ARCHIVED = "archived"


class QuestionStatus(str, Enum):
    PENDING = "pending"
    ANSWERING = "answering"
    ANSWERED = "answered"
    ERROR = "error"

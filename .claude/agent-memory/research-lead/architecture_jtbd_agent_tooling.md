---
name: JTBD Agent Tooling and Source Attribution Flow
description: Complete map of which JTBD agents have which tools, how sources flow from Perplexity through sub-agents to evidence extraction, and how the pattern compares to Watchtower/CompetitorAssessment
type: project
---

## JTBD Agent Tool Inventory

### Job Discovery Orchestrator (gemini-3.1-pro-preview)
- `search_nucleus_knowledge` (via `.with_nucleus_search(include_sources=False)`)
- `dispatch_jtbd_sub_agent` (custom closure tool via `.with_tools([dispatch_tool])`)
- **No** web_query_tool, **no** fetch_web_content
- Max 10 function calls

### Job Discovery Sub-agents (gemini-3-flash-preview)
- `web_query_tool` (Perplexity "sonar" model, 3-month recency, max 5 queries/call)
- `fetch_web_content` (WebScrapper, max 5 URLs/call)
- `search_nucleus_knowledge`
- `search_persona_*` (optional, per tagged Living Persona)
- Max 15 function calls, 8192 thinking budget
- Added via `.with_research_tools().with_nucleus_search()`

### Evidence Extraction Agent
- **ZERO tools** -- pure structured output agent
- Receives sources as markdown text in the user prompt via `_format_sources_text()`
- Cannot verify, fetch, or discover new URLs
- Uses `builder.run()` convenience path (no `.build()` + manual generate)

## Source URL Lifecycle
1. `web_query_tool` -> Perplexity citations (URLs)
2. Sub-agent selects best URLs -> `fetch_web_content` scrapes content
3. Sub-agent populates `JTBDJobSourceOutput.url` in structured output
4. Orchestrator deduplicates across sub-agents -> `JTBDJobOutput.sources`
5. `_format_sources_text()` renders sources as markdown text
6. Evidence agent copies URLs from prompt text into widget `source_url` fields
7. Persisted to `JTBDJobSource` rows + widget item fields

## Pattern Comparison
- **Watchtower**: Identical orchestrator+sub-agent dispatch pattern (clone of JTBD)
- **Competitor Assessment**: Single-agent pattern with direct `.with_research_tools()`, no dispatch tool

## Key Implication
Evidence extraction agent trusts source URLs blindly. If sub-agents produce bad URLs, there is no verification layer. Adding `.with_web_fetch()` to evidence extraction would allow URL validation without full search capability.

## Builder Tool Methods (BaseGeminiAgentBuilder)
- `with_research_tools()` -> [web_query_tool, fetch_web_content] (Perplexity-powered)
- `with_nucleus_search(include_sources=bool)` -> search_nucleus_knowledge
- `with_concept_search(concept_uuid?)` -> search_concept
- `with_concept_document_search(concept_uuid)` -> search_concept_documents
- `with_living_personas(personas)` -> search_persona_* per persona
- `with_grounded_search()` -> flag for use_search=True (Gemini native Google Search)
- `with_web_fetch()` -> fetch_web_content only (no web_query_tool)
- `with_tools(tools)` -> custom tool functions

Also exists: `create_gemini_research_tools()` -> [web_search_tool, fetch_web_content] (Google Search grounding alternative to Perplexity)

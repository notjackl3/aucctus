---
name: JTBD Card Expansion Architecture
description: How JTBD cards expand from collapsed to full-screen view -- Framer Motion layoutId pattern, parent wrappers, and known pitfalls
type: project
last_modified: 2026-04-06
---

JTBD card expansion uses a conditional render pattern in JTBDCard.tsx (line 70): `if (isSelected)` returns the fixed-position expanded card, else the collapsed card. Both share `layoutId={jtbd-card-${job.uuid}}`.

**Why:** This was identified as the root cause of a "competing expansion" bug. The pattern lacks AnimatePresence, so Framer Motion cannot orchestrate exit/enter animations, causing visual fighting.

**How to apply:**
- When modifying JTBD card expansion, ensure AnimatePresence wraps the state toggle or use a Portal-based approach
- The masonry wrapper (JTBDMasonryColumns.tsx:150) applies a continuous float animation (`y: [0, -6, 0]`) that must be suspended when a card is selected
- The LayoutGroup in JTBDCanvas.tsx:342 scopes all layoutId animations together -- keep filter bar layoutIds isolated
- The liquid-glass-dark SCSS class (global.scss:443) sets overflow:hidden and position:relative -- expanded card overrides with overflow-auto
- The Playground root (IdeaPlaygroundQBased.tsx:455) has overflow-hidden on h-screen; expanded card uses fixed positioning to escape it

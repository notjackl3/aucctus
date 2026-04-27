---
name: design-audit
description: Audit and improve UI/UX design of Aucctus application pages using Playwright browser automation. Only invoke when user explicitly requests "design-audit" or "/design-audit". Do NOT invoke automatically for general UI/UX mentions.
---

# Design Audit Expert

This skill uses Playwright browser automation to act as a design audit expert for Aucctus. It navigates application pages, captures visual state, evaluates against the glassmorphic design system, and makes code changes to fix issues.

## When to Use

**Only invoke this skill when the user explicitly requests it** by saying:
- "design-audit" or "/design-audit"
- "run the design audit skill"
- "use design-audit on..."

**Do NOT automatically invoke** for general UI/UX discussions.

## Design Vocabulary — Aucctus Glassmorphic System

Aucctus uses a dual-surface design language. Understanding which surface you're on is the single most important piece of context for a design audit.

### Surface 1 — Light Report Surface
Clean, tab-driven pages for reading structured AI output: Concept Report, Nucleus, Settings, Concepts List.

- Near-white background (`aucctus-bg-primary` / `aucctus-bg-secondary`)
- Black/dark text (`aucctus-text-primary`)
- Borders with `aucctus-border-primary`
- Section cards are rectangles with `rounded-lg`, subtle `shadow-sm`
- Search pill at bottom uses glass (`liquid-glass-search-shell`) but overlays a light page

Reference screenshots:
- `screenshots/06a-concept-report-full.png` — concept report full-page
- `screenshots/07-nucleus.png` — Nucleus hub
- `screenshots/07a-nucleus-full.png` — Nucleus card grid
- `screenshots/07c-nucleus-living-personas.png` — Living Personas tab
- `screenshots/05-concepts-list.png` — Concepts index
- `screenshots/09-settings.png` — Settings

### Surface 2 — Dark Glass Canvas
Exploratory, canvas-style workspaces with dark gradient backgrounds, floating glass objects, and liquid-glass rims. This is where the glassmorphic identity lives.

- Radial/linear gradient background (black → deep burgundy for Schreiber brand tint)
- All primary UI is translucent glass (`.liquid-glass-dark`, `.liquid-glass-search-shell`)
- White-on-dark typography
- Cards float — no hard boundaries, backdrop-blur instead of solid fills

Reference screenshots:
- `screenshots/01-playground-home.png` — Idea Playground landing
- `screenshots/01a-playground-full.png` — full Playground scroll
- `screenshots/02-playground-idea-mode.png` — Idea Mode tab
- `screenshots/03-playground-jtbd.png` — JTBD canvas with hero search
- `screenshots/03a-jtbd-full.png` — full JTBD scroll with floating cards

### Surface 3 — Glass Rim Modals
Modals are layered: overlay (blurred backdrop) → shell (geometry) → rim (frosted refractive ring, the visible "glass edge") → surface (inner content panel). The rim is what the user means when they say "glass rims."

- Built on `@radix-ui/react-dialog`
- Component: `@components/ui/LiquidGlassModal` (wrapper around Radix)
- Overlay: `.glass-modal-overlay` (blurred dark wash over the page behind)
- Shell: `.liquid-glass-modal-shell` — outer geometry, padding, lift shadow
- Rim: `.liquid-glass-modal-rim` — frosted glass ring with prismatic highlight (the "rim")
- Rim variants: `.liquid-glass-modal-rim-animated` (rotating conic gradient, used for Create Persona, Overseer), `.liquid-glass-modal-rim-danger` (red tint for destructive)
- Sizes: `sm` 400px, `md` 560px, `lg` 720px, `xl` 900px

Reference screenshots:
- `screenshots/04-jtbd-detail-modal.png` — JTBD detail modal (viewport)
- `screenshots/04a-jtbd-detail-modal-full.png` — same, full-page
- `screenshots/08-modal-jtbd-detail-glass.png` / `08a-modal-jtbd-detail-glass-full.png` — additional rim angles

When auditing modals, **always check the rim is present and intact** — missing rim (flat dark panel on dark backdrop) is the most common regression.

See [AUCCTUS-THEME.md](AUCCTUS-THEME.md) for the full class and CSS-variable reference.

## Workflow

### Phase 1 — Setup & Authentication

Playwright MCP connects to a containerized headless Chromium over CDP (`http://localhost:9222`). See `CLAUDE.local.md` for the full stack.

1. Verify Vite dev server is reachable: `curl -s http://localhost:5173 -o /dev/null -w "%{http_code}"` should return `200`.
2. Navigate with `mcp__playwright__browser_navigate` using `http://host.docker.internal:5173/...` (never `localhost` — that resolves inside the container).
3. If the page redirects to `/login`, log in using the local test account matching the feature's target company (see `CLAUDE.local.md` → `.claude-local/credentials.md` for aliases: Schreiber, Beem, Gore).
4. Resize viewport to `1440x900` for consistent layout (`mcp__playwright__browser_resize`).

**Known gotcha — clock drift:** The Tart VM clock drifts. If Clerk login bounces back to `/login` or the API logs show `Invalid Clerk token: The token is not yet valid (iat)`, resync the clock:
```bash
TRUE_DATE=$(curl -sI https://www.google.com | awk -F': ' 'tolower($1)=="date" {sub(/\r$/,""); print $2}')
sudo date -s "$TRUE_DATE"
```

**Known gotcha — screenshot timeout:** `mcp__playwright__browser_take_screenshot` has a hard 5s timeout that fires on heavy glassmorphic pages (many `backdrop-filter` layers). Prefer CDP-direct screenshots instead — see Phase 2.

### Phase 2 — Capturing Visual State

**Preferred: CDP-direct screenshots** (no 5s cap, also captures full page). Requires Chromium started with `--remote-allow-origins=*`:

```python
# /tmp/screenshot.py — reusable helper
import json, base64, sys, urllib.request
import websocket
arg, out = sys.argv[1], sys.argv[2]
full = len(sys.argv) > 3 and sys.argv[3] == 'full'
if arg == 'auto':
    tabs = json.loads(urllib.request.urlopen("http://localhost:9222/json/list").read())
    tab_id = [t['id'] for t in tabs if t['type']=='page'][0]
else:
    tab_id = arg
ws = websocket.create_connection(f"ws://localhost:9222/devtools/page/{tab_id}",
                                 timeout=30, origin="http://localhost:9222")
params = {"format":"png"}
if full:
    params["captureBeyondViewport"] = True
ws.send(json.dumps({"id":1,"method":"Page.captureScreenshot","params":params}))
while True:
    msg = json.loads(ws.recv())
    if msg.get("id")==1:
        open(out,"wb").write(base64.b64decode(msg["result"]["data"]))
        break
```

Usage:
```bash
python3 /tmp/screenshot.py auto /path/to/viewport.png       # visible viewport
python3 /tmp/screenshot.py auto /path/to/fullpage.png full  # full scrollable page
```

If the WebSocket handshake returns 403, Chromium was not started with `--remote-allow-origins=*`. Restart it per `CLAUDE.local.md` adding that flag to the run.sh argument list.

**Fallback: MCP tools**
- `mcp__playwright__browser_snapshot` — accessibility tree (cheap, structured, best for finding refs before clicking)
- `mcp__playwright__browser_take_screenshot` — works when pages are light; times out on heavy glass pages
- `mcp__playwright__browser_evaluate` — run JS to click elements that Playwright refuses because they're "not stable" (glass cards animate continuously, so Playwright's stability check never settles — `.liquid-glass-dark` cards almost always need a JS-driven click)

### Phase 3 — Evaluate Against Criteria

See [CHECKLIST.md](CHECKLIST.md) for the full audit checklist, which is organized by surface type. The non-glass criteria (hierarchy, spacing, typography, contrast, a11y) apply to every page. The glass-specific criteria apply only to Surface 2 (dark canvas) and Surface 3 (modals).

The highest-leverage glass checks:

- **Rim integrity on modals** — is `.liquid-glass-modal-rim` present, visible, and not clipped?
- **Backdrop contrast** — dark-glass cards on a mid-tone gradient can become unreadable when the gradient lightens; text needs to hold contrast across the whole gradient range
- **Stacking** — glass on glass on glass produces mud; most pages should have exactly one glass layer over either a dark gradient (Surface 2) or an overlay (Surface 3)
- **Hover state is visible** — glass hover is usually a small opacity bump (`bg-white/10` → `bg-white/15`); easy to forget and easy to make too subtle

### Phase 4 — Locate Source

```
aucctus/src/app/pages/                               # Page components
aucctus/src/app/components/                          # Shared components
aucctus/src/app/components/ui/LiquidGlassModal.tsx   # Canonical modal wrapper
aucctus/src/app/components/ui/LiquidGlass.tsx        # Card/surface wrapper
aucctus/src/app/components/ui/GlassSurface.tsx
aucctus/src/app/components/ui/ChromaticGlass.tsx
aucctus/src/app/assets/styles/global.scss            # .liquid-glass-* definitions + CSS variables
```

Grep for `liquid-glass` or `glass-modal` to find existing usages before adding a new variant.

### Phase 5 — Implement Fixes

**For non-glass surfaces**, use Aucctus theme classes (`aucctus-bg-*`, `aucctus-text-*`, `aucctus-border-*`, `btn btn-*`). Never use raw Tailwind colors.

**For dark canvas surfaces**:
- Cards: `.liquid-glass-dark` (preferred) or inline `bg-white/10 border border-white/20 backdrop-blur-md rounded-xl`
- Pills / segmented controls: `bg-white/10 border border-white/20 backdrop-blur-md rounded-full px-4 py-2`
- Search input: the composed `liquid-glass-search-shell` + `liquid-glass-search-rim` pattern — don't roll your own

**For modals**:
- Always go through `<LiquidGlassModal>` — never mount Radix `<Dialog.Content>` directly, the rim won't apply
- Pick the size (`sm`/`md`/`lg`/`xl`) by content density, not viewport
- Use `animatedRim` for rare, attention-worthy modals (Create Persona, Overseer intro); default rim everywhere else
- Use `variant="danger"` for destructive confirmations

### Phase 6 — Verify

1. Re-navigate to the affected page.
2. Take comparison screenshots at both viewport and full-page (CDP direct).
3. Trigger hover states via `mcp__playwright__browser_evaluate` — e.g. `el.dispatchEvent(new MouseEvent('mouseenter',{bubbles:true}))`.
4. Test light + dark theme if the change touched shared styles. Glass tokens are defined for both in `global.scss` under `:root` and `.dark`.

## Example Usage

### Example 1 — Audit Only
> "Run design-audit on the JTBD canvas"

1. Navigate to `/playground?mode=jtbd&scans=<uuid>`.
2. Capture viewport + full-page screenshots.
3. Walk the checklist — surface type = Dark Glass Canvas.
4. Report issues grouped by severity; do not edit code.

### Example 2 — Fix Specific Issue
> "The Nucleus card hover is too subtle"

1. Screenshot current state.
2. Inspect `aucctus-bg-secondary-hover` token or the Nucleus card component directly.
3. Adjust the hover token OR override at the component level.
4. Verify with a before/after screenshot.

### Example 3 — Complete Overhaul
> "Redesign the JTBD search hero"

1. Capture the existing glass pattern.
2. Locate `aucctus/src/app/pages/JTBD/...` and the `liquid-glass-search-*` classes.
3. Propose a direction that stays within the glass system (don't introduce a new surface type).
4. Implement incrementally, screenshotting each step.

## Reference Files

- [AUCCTUS-THEME.md](AUCCTUS-THEME.md) — full theme + glassmorphic class reference
- [CHECKLIST.md](CHECKLIST.md) — surface-aware audit checklist
- `screenshots/` — current visual context for each major surface and feature

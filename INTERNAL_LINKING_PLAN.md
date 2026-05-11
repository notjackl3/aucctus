# Plan: Complete Internal Linking System + Code Quality

## Context

PR #761 introduces an `aucctus://` internal URI scheme and unified `SourceBadge` component. The URI parsing, adapters, and badge rendering all work correctly. **The gap**: deep-links navigate to the right page but don't scroll to or highlight the target section. Params are literally `void`-ed. The core promise — "click a nucleus citation → land on that section" — is undelivered.

Additionally, the PR has duplicated components and inconsistent patterns that should be cleaned up.

---

## Part 1: Make Nucleus Deep-Links Scroll + Highlight

### Step 1: Add `data-section-id` to CategoryCard

**File:** `src/app/components/Nucleus/CategoriesGrid/CategoryCard.tsx` (line 182)

Add `data-section-id={category.uuid}` to the outer `<div>`. The `category` prop is `NucleusReportSection` which already has `.uuid` (confirmed in `nucleus.d.ts:79`). The existing `SectionHighlightOverlay` queries `[data-section-id="..."]` and the `resolveSectionElement` function passes unknown IDs through directly to the DOM query — no changes needed to `sectionMap.ts`.

```tsx
// Before:
<div id={`category-${category.sectionType}`} ...>

// After:
<div id={`category-${category.sectionType}`} data-section-id={category.uuid} ...>
```

### Step 2: Wire `nucleusSectionUuid` into highlight system

**File:** `src/app/components/Nucleus/NucleusPage/NucleusPage.tsx` (lines 94-97)

Replace the void pattern with an effect that:
1. Ensures the `?tab=company-context` and `?section=intelligence` params are set (categories live under intelligence)
2. After a delay (to let the tab/section switch render), calls `setHighlightedSection(nucleusSectionUuid)` from the Overseer store
3. Clears `?nucleusSection=` param afterward so page refresh doesn't re-trigger

The existing `SectionHighlightOverlay` will then:
- Find the element via `data-section-id={uuid}`
- `scrollIntoView({ behavior: 'smooth', block: 'center' })`
- Render the glow overlay

### Step 3: Add auto-clear for dynamic section highlights

**File:** `src/app/components/Overseer/sectionHighlight/SectionHighlightOverlay.tsx` (~line 98)

Currently the overlay doesn't auto-dismiss for non-concept sections. Add a ~2s auto-clear when the highlighted section ID isn't in `SECTION_TO_ROUTE` (meaning it's a dynamic UUID target from a deep-link, not an Overseer navigation):

```tsx
// After scrollIntoView + updateRect:
if (!targetRoute) {
  setTimeout(() => setHighlightedSection(null), 2000);
}
```

---

## Part 2: Code Quality Fixes

### Step 4: Extract shared `ResolvedSourceRow`

**Create:** `src/app/components/SourceBadge/ResolvedSourceRow.tsx`

Deduplicate from:
- `src/app/components/EcosystemV2/components/FuturePredictions.tsx` (lines 23-47)
- `src/app/pages/Concept/Report/MarketScan/v3/components/SourceBadgeList.tsx` (lines 31-58)

Standardize on the `SourceBadge` pattern (not legacy `Badge.SourceInfo`). Update both consumers to import the shared component.

### Step 5: Extract shared `LinkButton`

**Create:** `src/app/components/SourceBadge/LinkButton.tsx`

Deduplicate from:
- `src/app/components/Card/InsightCard.tsx` (lines 12-31)
- `src/app/components/Modal/ConclusionVisualizationModal/Tabs/ConclusionVisualizationSources.tsx` (lines 17-35)

Both use `useCitationResolver` + `ExternalLink` icon with identical logic. Update both consumers.

### Step 6: Migrate `SourceBadgeList.tsx` to new `SourceBadge`

**File:** `src/app/pages/Concept/Report/MarketScan/v3/components/SourceBadgeList.tsx`

Replace `Badge.SourceInfo` usage with `SourceBadge` + `adaptISource`, matching the pattern in `FuturePredictions.tsx`. This becomes straightforward after Step 4 extracts `ResolvedSourceRow`.

### Step 7: Remove dead `onClick` prop from `SourceInfoBadge`

**File:** `src/app/components/Badges/SourceInfoBadge.tsx`

Remove `onClick` from the interface (line 35) — it's `@deprecated`, not destructured, and not used. Check callers to ensure none depend on it doing something.

### Step 8: Add sync comment to inlined `getBaseDomain`

**File:** `src/app/components/SourceBadge/adapters.ts` (lines 84-92)

The inlined `getBaseDomain` duplicates `getBaseUrl` from `src/libs/utils/source.ts`. The comment says it's inlined for vitest compatibility. Add a `// SYNC:` comment linking to the canonical implementation. Low-risk, not worth changing the test infrastructure for.

---

## Files Modified

| File | Change |
|------|--------|
| `src/app/components/Nucleus/CategoriesGrid/CategoryCard.tsx` | Add `data-section-id={category.uuid}` |
| `src/app/components/Nucleus/NucleusPage/NucleusPage.tsx` | Wire `nucleusSectionUuid` → highlight overlay |
| `src/app/components/Overseer/sectionHighlight/SectionHighlightOverlay.tsx` | Auto-clear for dynamic UUIDs |
| `src/app/components/SourceBadge/ResolvedSourceRow.tsx` | **New** — shared component |
| `src/app/components/SourceBadge/LinkButton.tsx` | **New** — shared component |
| `src/app/components/SourceBadge/index.ts` | Export new shared components |
| `src/app/components/EcosystemV2/components/FuturePredictions.tsx` | Use shared `ResolvedSourceRow` |
| `src/app/pages/Concept/Report/MarketScan/v3/components/SourceBadgeList.tsx` | Use shared `ResolvedSourceRow` + migrate to `SourceBadge` |
| `src/app/components/Card/InsightCard.tsx` | Use shared `LinkButton` |
| `src/app/components/Modal/ConclusionVisualizationModal/Tabs/ConclusionVisualizationSources.tsx` | Use shared `LinkButton` |
| `src/app/components/Badges/SourceInfoBadge.tsx` | Remove dead `onClick` prop |
| `src/app/components/SourceBadge/adapters.ts` | Add SYNC comment |

## Existing Utilities to Reuse

- `resolveSectionElement()` from `src/app/components/Overseer/sectionHighlight/sectionMap.ts:140` — already queries `[data-section-id]`
- `setHighlightedSection()` from Overseer store actions — already sets `highlightedSectionId`
- `SectionHighlightOverlay` — already handles scroll + glow overlay rendering
- `useCitationResolver` from `src/app/hooks/useCitationResolver.ts` — for shared LinkButton
- `adaptISource` from `src/app/components/SourceBadge/adapters.ts` — for SourceBadgeList migration

## Verification

1. **Type check + lint**: `npm run type-check && npm run lint`
2. **Unit tests**: `npm run test` — existing adapter/resolver tests should still pass
3. **Manual deep-link test**: Navigate to a nucleus section link (use a known section UUID). Verify:
   - Lands on `/nucleus`
   - Tab auto-switches to company-context, section to intelligence
   - Target CategoryCard scrolls into view with crimson glow overlay
   - Glow auto-dismisses after ~2 seconds
   - URL param `?nucleusSection=` is cleared after highlight fires
4. **Regression**: Verify Overseer's existing section navigation on concept pages still works (glow should NOT auto-clear on those — only on dynamic UUID targets)
5. **Shared components**: Verify FuturePredictions and SourceBadgeList still render source badges + overflow tooltips correctly

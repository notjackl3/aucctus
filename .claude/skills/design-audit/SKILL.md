---
name: design-audit
description: Audit and improve UI/UX design of application pages using Chrome browser automation. Only invoke when user explicitly requests "design-audit" or "/design-audit". Do NOT invoke automatically for general UI/UX mentions.
---

# Design Audit Expert

This skill uses Chrome browser automation to act as a design audit expert. It navigates to application pages, analyzes the visual design, identifies UI/UX issues, and makes code changes to fix or overhaul the design.

## When to Use

**Only invoke this skill when the user explicitly requests it** by saying:
- "design-audit" or "/design-audit"
- "run the design audit skill"
- "use design-audit on..."

**Do NOT automatically invoke** for general UI/UX discussions or when user mentions design topics without explicitly requesting this skill.

## Quick Start

User provides a page URL (e.g., `http://localhost:5173/concept/SF002/poc-plan`) and describes what they want:
- **Audit only**: Review and report issues without making changes
- **Fix issues**: Identify and fix specific UI/UX problems
- **Overhaul**: Complete redesign of the page or component

## Workflow

### Phase 1: Setup & Navigation

1. **Get browser context**: Call `mcp__claude-in-chrome__tabs_context_mcp` to check existing tabs
2. **Create new tab**: Call `mcp__claude-in-chrome__tabs_create_mcp` for a fresh session
3. **Navigate to page**: Use `mcp__claude-in-chrome__navigate` with the provided URL
4. **Take initial screenshot**: Use `mcp__claude-in-chrome__computer` with `action: "screenshot"` to capture the page state

### Phase 2: Visual Analysis

1. **Capture full page**: Take screenshots at different scroll positions to see all content
2. **Check responsive behavior**: Use `mcp__claude-in-chrome__resize_window` to test different viewport sizes:
   - Desktop: 1920x1080, 1440x900
   - Tablet: 768x1024
   - Mobile: 375x812
3. **Analyze page structure**: Use `mcp__claude-in-chrome__read_page` to understand DOM hierarchy
4. **Document findings**: Note all UI/UX issues found

### Phase 3: Identify Issues

Evaluate the page against these UI/UX criteria:

#### Visual Hierarchy
- Is the most important content emphasized?
- Are headings properly sized and weighted?
- Is there clear visual flow?

#### Spacing & Layout
- Consistent padding/margins?
- Proper alignment of elements?
- Adequate whitespace?
- Responsive grid behavior?

#### Typography
- Readable font sizes (minimum 14px for body)?
- Proper line heights?
- Consistent font weights?
- Good contrast ratios?

#### Color Usage
- Following Aucctus theme system?
- Proper contrast for accessibility (WCAG AA)?
- Consistent semantic colors?
- Dark mode compatibility?

#### Interactive Elements
- Clear button states (hover, active, disabled)?
- Proper focus indicators?
- Touch-friendly sizes (minimum 44x44px)?

#### Accessibility
- Proper heading hierarchy (h1, h2, h3)?
- Sufficient color contrast?
- Focus states visible?
- Screen reader friendly?

See [CHECKLIST.md](CHECKLIST.md) for the complete audit checklist.

### Phase 4: Locate Source Files

1. **Identify component**: Use page URL to find the corresponding React component
2. **Search codebase**: Use Glob and Grep to locate relevant files:
   ```
   src/app/pages/     # Page components
   src/app/components/ # Shared components
   ```
3. **Read component code**: Understand current implementation before making changes

### Phase 5: Implement Fixes

Apply fixes using the Aucctus theme system. See [AUCCTUS-THEME.md](AUCCTUS-THEME.md) for class reference.

**Key principles:**
- Use Aucctus theme classes (`aucctus-*`) as primary styling
- Add micro-interactions with Framer Motion for polish
- Leverage Radix UI primitives for accessible components
- Supplement with Tailwind utilities where needed
- Use `-hover` suffix directly (NOT `hover:` prefix)
- Use `cn()` utility for conditional classes

**Common fixes:**

```tsx
// Typography - use aucctus-text-* for size, aucctus-text-* for color
className="aucctus-text-md aucctus-text-primary"
className="aucctus-header-sm-semibold aucctus-text-secondary"

// Backgrounds
className="aucctus-bg-primary rounded-lg p-4"
className="aucctus-bg-secondary-hover" // includes hover state

// Borders
className="aucctus-border-primary border rounded-md"

// Buttons
className="btn btn-primary btn-sm"
className="btn btn-light btn-md"

// Icons
<Icon variant="check" className="aucctus-stroke-primary h-5 w-5" />
```

### Phase 6: Verify Changes

1. **Refresh page**: Navigate to the page again after saving changes
2. **Take comparison screenshots**: Capture before/after views
3. **Test interactions**: Click buttons, hover states, form inputs
4. **Check responsive**: Resize to verify responsive behavior
5. **Test dark mode**: If applicable, toggle theme and verify

## Example Usage

### Example 1: Quick Audit

**User Request:**
"Audit the design of http://localhost:5173/concept/SF002/poc-plan"

**Response:**
1. Navigate to page, take screenshots
2. Analyze visual hierarchy, spacing, typography, colors
3. Report findings with specific issues and recommendations
4. Ask if user wants fixes implemented

### Example 2: Fix Specific Issues

**User Request:**
"The spacing is inconsistent on the POC Plan page. Fix it."

**Response:**
1. Navigate to page, identify spacing inconsistencies
2. Locate source files
3. Apply consistent spacing using Tailwind/Aucctus classes
4. Verify changes with screenshots

### Example 3: Complete Overhaul

**User Request:**
"Completely redesign the header section of the customer profile page"

**Response:**
1. Navigate to page, screenshot current state
2. Analyze what's working and what's not
3. Propose new design direction
4. Implement changes incrementally
5. Capture progress screenshots
6. Iterate based on visual feedback

## Important Notes

- **Always screenshot before making changes** - provides visual reference
- **Make incremental changes** - easier to track what worked
- **Verify in browser** - don't assume changes look correct
- **Consider dark mode** - Aucctus supports both themes
- **Use TodoWrite** - track progress on multi-step fixes

## Reference Files

- [CHECKLIST.md](CHECKLIST.md) - Complete design audit checklist
- [AUCCTUS-THEME.md](AUCCTUS-THEME.md) - Theme class reference

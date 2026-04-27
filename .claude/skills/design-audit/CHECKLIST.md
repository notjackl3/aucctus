# Design Audit Checklist

Use this checklist to systematically evaluate UI/UX quality.

## Step 0 — Identify the Surface

Every Aucctus page is one of three surface types. Audit criteria differ by surface.

- [ ] **Surface 1 — Light Report** (Concepts list, Concept Report, Nucleus, Settings): near-white bg, dark text, rectangular cards, no glass
- [ ] **Surface 2 — Dark Glass Canvas** (Idea Playground, JTBD, Watchtower): dark gradient bg, floating `.liquid-glass-dark` cards, white text
- [ ] **Surface 3 — Glass Rim Modal** (any `<LiquidGlassModal>`): blurred overlay, rim-shell-surface modal

If the page doesn't fit any of these, flag it — it may be introducing a new surface type that needs design alignment.

## Visual Hierarchy

- [ ] Primary content is immediately visible
- [ ] Headings use visually appropriate sizes
- [ ] Important actions are visually prominent
- [ ] Secondary information is de-emphasized
- [ ] Clear visual flow guides the eye

## Spacing & Layout

### Consistency
- [ ] Consistent padding within similar components
- [ ] Consistent margins between sections
- [ ] Grid alignment is maintained
- [ ] No random spacing values

### Spacing Scale (Tailwind)
- `p-1` (4px) - Tight internal spacing
- `p-2` (8px) - Compact components
- `p-3` (12px) - Default internal spacing
- `p-4` (16px) - Standard padding
- `p-6` (24px) - Generous padding
- `p-8` (32px) - Section padding

### Common Issues
- [ ] Elements not aligned to grid
- [ ] Inconsistent gaps between similar items
- [ ] Too much or too little whitespace
- [ ] Crowded content areas

## Typography

### Readability
- [ ] Line height is adequate (built into aucctus-text-*)
- [ ] Line length is reasonable (max ~80 characters)
- [ ] Proper font weights for emphasis
- [ ] No walls of text without breaks

### Common Issues
- [ ] Text too small (below 12px), or Text too big (use your judgement)
- [ ] Inconsistent heading hierarchy
- [ ] Wrong font weight for context
- [ ] Missing text truncation on overflow

## Color Usage

### Text Colors
- [ ] Primary content uses `aucctus-text-primary`
- [ ] Secondary content uses `aucctus-text-secondary`
- [ ] Tertiary/muted uses `aucctus-text-tertiary`
- [ ] Brand emphasis uses `aucctus-text-brand-*`
- [ ] Error states use `aucctus-text-error-primary`
- [ ] Success states use `aucctus-text-success-primary`

### Background Colors
- [ ] Page background uses `aucctus-bg-primary`
- [ ] Cards/sections use `aucctus-bg-secondary` or `aucctus-bg-tertiary`
- [ ] Brand sections use `aucctus-bg-brand-*`
- [ ] Proper contrast between layers

### Contrast (WCAG AA)
- [ ] Normal text: 4.5:1 minimum
- [ ] Large text (18px+): 3:1 minimum
- [ ] UI components: 3:1 minimum
- [ ] Test with contrast checker

### Common Issues
- [ ] Using raw Tailwind colors instead of theme classes
- [ ] Low contrast text
- [ ] Inconsistent semantic colors
- [ ] Not considering dark mode

## Interactive Elements

### Buttons
- [ ] Clear visual hierarchy (primary, secondary, tertiary)
- [ ] Proper sizing (`btn-sm`, `btn-md`, `btn-lg`)
- [ ] Hover states work (`-hover` suffix)
- [ ] Disabled state is clear
- [ ] Loading state if applicable

### Links
- [ ] Distinguishable from regular text
- [ ] Hover state visible
- [ ] Focus state visible

### Form Inputs
- [ ] Clear focus states
- [ ] Error states visible
- [ ] Placeholder text readable
- [ ] Labels associated with inputs
- [ ] Adequate touch targets

### Common Issues
- [ ] Missing hover states
- [ ] No visual feedback on click
- [ ] Disabled states unclear
- [ ] Focus states invisible or removed

## Accessibility

### Structure
- [ ] Single h1 per page
- [ ] Logical heading hierarchy (h1 > h2 > h3)
- [ ] Landmarks used appropriately
- [ ] Skip links if needed

### Keyboard Navigation
- [ ] All interactive elements focusable
- [ ] Focus order is logical
- [ ] Focus visible at all times
- [ ] No keyboard traps

### Screen Readers
- [ ] Images have alt text
- [ ] Icons have aria-label
- [ ] Forms have labels
- [ ] Dynamic content announced

### Color Independence
- [ ] Information not conveyed by color alone
- [ ] Icons/text supplement color coding

## Responsive Design

### Breakpoints to Test
- Mobile: 375px
- Tablet: 768px
- Desktop: 1024px
- Large: 1440px
- XL: 1920px

### Checklist
- [ ] Content readable at all sizes
- [ ] No horizontal scrolling
- [ ] Touch targets adequate on mobile (44x44px min)
- [ ] Navigation adapts appropriately
- [ ] Images scale correctly
- [ ] Tables handle narrow widths

## Dark Mode

- [ ] All theme classes support dark mode
- [ ] Sufficient contrast in dark theme
- [ ] No hardcoded light-only colors
- [ ] Images/icons visible in both modes
- [ ] Brand colors adapt appropriately

## Performance Considerations

- [ ] No layout shift on load
- [ ] Skeleton loaders for async content
- [ ] Images optimized
- [ ] Animations smooth (60fps)
- [ ] No unnecessary re-renders

## Glassmorphic System (Surface 2 and Surface 3)

Apply these checks **in addition** to the sections above when auditing dark canvas or modal surfaces. See `AUCCTUS-THEME.md` for the class reference.

### Dark Canvas Surface (Surface 2)

- [ ] Background is a deep gradient (not a flat color); confirm the radial/linear gradient is defined at the page-level container, not inherited accidentally
- [ ] Cards use a named `.liquid-glass-*` class (preferred `.liquid-glass-dark`) rather than hand-rolled `bg-white/10 border backdrop-blur` combos
- [ ] Text is white or `white/90`; sub-text uses `white/70` or `white/60`
- [ ] Glass contrast holds across the entire gradient — sample the card against both the darkest and lightest region of the bg
- [ ] No glass-on-glass stacking: one glass layer per depth
- [ ] Hover state is a visible opacity bump (e.g. `bg-white/10` → `bg-white/15`) and a border shift, not nothing
- [ ] `overflow: hidden` is preserved on glass containers — the rim/chromatic `::before` overlays depend on it
- [ ] No heavy solid shadows on glass cards — rely on the inner-glow / rim for separation

### Glass Rim Modal (Surface 3)

- [ ] Modal is a `<LiquidGlassModal>` (or a legacy modal that still applies `.liquid-glass-modal-shell` + `.liquid-glass-modal-rim`) — not a raw `Dialog.Content`
- [ ] The rim is visible around all four sides — if the content pushes flush to the edge, the rim is broken
- [ ] Overlay uses `.glass-modal-overlay` (blurred, slightly dark) — not a raw `bg-black/50`
- [ ] Size token (`sm` / `md` / `lg` / `xl`) matches content density
- [ ] Destructive actions use `variant="danger"` (red rim) — not a default rim with a red button
- [ ] `animatedRim` is used sparingly (Create Persona, Overseer) — default rim everywhere else
- [ ] Close button is present unless intentionally hidden (`hideCloseButton`)
- [ ] Focus is trapped inside the modal; Escape closes it (Radix handles this — confirm by tabbing)
- [ ] Content inside the modal uses the light-surface theme classes (`aucctus-text-primary`, `aucctus-bg-primary`, etc.) — the rim provides the glass, the surface stays readable

### CSS Variables

- [ ] No direct override of `--glass-*` variables at the component level unless intentional; prefer composing the provided classes
- [ ] `--persona-color` is set on the parent when using `.liquid-glass-persona`

## Common Anti-Patterns to Fix

1. **Hardcoded colors**: Replace with `aucctus-*` classes
2. **Inline styles**: Move to className with theme classes
3. **`hover:` prefix with theme classes**: Use `-hover` suffix instead
4. **Inconsistent spacing**: Use spacing scale consistently
5. **Missing states**: Add hover, focus, disabled, loading states
6. **Raw Tailwind colors**: Use semantic theme colors
7. **Fixed pixel values**: Use responsive/relative units
8. **Hand-rolled glass**: Replace `bg-white/10 border border-white/20 backdrop-blur-md` chains with the matching `.liquid-glass-*` class
9. **Raw Radix `<Dialog.Content>`**: Replace with `<LiquidGlassModal>` so the rim + overlay apply
10. **Glass on light surfaces**: Don't use `.liquid-glass-dark` on a white report page — either switch the surface to dark canvas or drop the glass
11. **Missing rim**: A flat dark panel on a dark overlay is almost always a `<LiquidGlassModal>` regression — grep the component and restore the wrapper

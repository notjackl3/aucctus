# Design Audit Checklist

Use this checklist to systematically evaluate UI/UX quality.

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

## Common Anti-Patterns to Fix

1. **Hardcoded colors**: Replace with `aucctus-*` classes
2. **Inline styles**: Move to className with theme classes
3. **`hover:` prefix with theme classes**: Use `-hover` suffix instead
4. **Inconsistent spacing**: Use spacing scale consistently
5. **Missing states**: Add hover, focus, disabled, loading states
6. **Raw Tailwind colors**: Use semantic theme colors
7. **Fixed pixel values**: Use responsive/relative units

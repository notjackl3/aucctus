# Aucctus Theme System Reference

Quick reference for Aucctus theme classes. Always prefer these over raw Tailwind colors.

## Text Colors

### Base Text
| Class | Usage |
|-------|-------|
| `aucctus-text-primary` | Main content text |
| `aucctus-text-secondary` | Supporting text |
| `aucctus-text-tertiary` | Muted/subtle text |
| `aucctus-text-quaternary` | Very subtle text |
| `aucctus-text-white` | White text (static) |
| `aucctus-text-light` | Light text |

### State Text
| Class | Usage |
|-------|-------|
| `aucctus-text-disabled` | Disabled state |
| `aucctus-text-placeholder` | Placeholder text |

### Brand Text
| Class | Usage |
|-------|-------|
| `aucctus-text-brand-primary` | Primary brand emphasis |
| `aucctus-text-brand-secondary` | Secondary brand |
| `aucctus-text-brand-tertiary` | Tertiary brand |

### Semantic Text
| Class | Usage |
|-------|-------|
| `aucctus-text-error-primary` | Error messages |
| `aucctus-text-warning-primary` | Warnings |
| `aucctus-text-success-primary` | Success messages |
| `aucctus-text-info-primary` | Information |

### Hover Variants
Add `-hover` suffix for hover states:
- `aucctus-text-secondary-hover`
- `aucctus-text-tertiary-hover`

## Background Colors

### Base Backgrounds
| Class | Usage |
|-------|-------|
| `aucctus-bg-primary` | Main page background |
| `aucctus-bg-primary-alt` | Alternative primary |
| `aucctus-bg-secondary` | Cards, sections |
| `aucctus-bg-secondary-alt` | Alternative secondary |
| `aucctus-bg-tertiary` | Nested containers |
| `aucctus-bg-quaternary` | Deep nesting |
| `aucctus-bg-quinary` | Deepest level |

### Solid Backgrounds
| Class | Usage |
|-------|-------|
| `aucctus-bg-primary-solid` | Dark solid background |
| `aucctus-bg-secondary-solid` | Gray solid |

### State Backgrounds
| Class | Usage |
|-------|-------|
| `aucctus-bg-active` | Active/selected state |
| `aucctus-bg-disabled` | Disabled state |
| `aucctus-bg-overlay` | Modal overlays |

### Brand Backgrounds
| Class | Usage |
|-------|-------|
| `aucctus-bg-brand-primary` | Light brand bg |
| `aucctus-bg-brand-secondary` | Medium brand bg |
| `aucctus-bg-brand-solid` | Solid brand bg |
| `aucctus-bg-brand-section` | Brand section headers |

### Semantic Backgrounds
| Class | Usage |
|-------|-------|
| `aucctus-bg-error-primary` | Error background |
| `aucctus-bg-error-solid` | Solid error |
| `aucctus-bg-warning-primary` | Warning background |
| `aucctus-bg-warning-solid` | Solid warning |
| `aucctus-bg-success-primary` | Success background |
| `aucctus-bg-success-solid` | Solid success |
| `aucctus-bg-info-primary` | Info background |
| `aucctus-bg-info-solid` | Solid info |

### Glass Effects
| Class | Usage |
|-------|-------|
| `aucctus-bg-error-glass` | Error glass effect |
| `aucctus-bg-warning-glass` | Warning glass effect |
| `aucctus-bg-success-glass` | Success glass effect |
| `aucctus-bg-frosted-glass` | Neutral glass effect |

### Hover Variants
Add `-hover` suffix:
- `aucctus-bg-primary-hover`
- `aucctus-bg-secondary-hover`
- `aucctus-bg-brand-primary-hover`
- `aucctus-bg-brand-solid-hover`

**IMPORTANT**: Use `-hover` suffix directly, NOT `hover:` prefix:
```tsx
// CORRECT
className="aucctus-bg-secondary-hover"

// INCORRECT
className="hover:aucctus-bg-secondary"
```

## Border Colors

| Class | Usage |
|-------|-------|
| `aucctus-border-primary` | Primary borders |
| `aucctus-border-secondary` | Secondary borders |
| `aucctus-border-brand` | Brand accent borders |
| `aucctus-border-disabled` | Disabled state |
| `aucctus-border-error` | Error state |
| `aucctus-border-warning` | Warning state |
| `aucctus-border-success` | Success state |

## Stroke Colors (SVG)

| Class | Usage |
|-------|-------|
| `aucctus-stroke-primary` | Primary icon stroke |
| `aucctus-stroke-secondary` | Secondary icon stroke |
| `aucctus-stroke-brand` | Brand icon stroke |

## Fill Colors (SVG)

| Class | Usage |
|-------|-------|
| `aucctus-fill-brand-primary` | Brand icon fill |
| `aucctus-fill-error` | Error icon fill |
| `aucctus-fill-success` | Success icon fill |

## Typography

### Headers
| Class | Size |
|-------|------|
| `aucctus-header-2xl` | 72px |
| `aucctus-header-xl` | 60px |
| `aucctus-header-lg` | 48px |
| `aucctus-header-md` | 36px |
| `aucctus-header-sm` | 30px |
| `aucctus-header-xs` | 24px |

### Body Text
| Class | Size |
|-------|------|
| `aucctus-text-xl` | 20px |
| `aucctus-text-lg` | 18px |
| `aucctus-text-md` | 16px |
| `aucctus-text-sm` | 14px |
| `aucctus-text-xs` | 12px |
| `aucctus-text-2xs` | 10px |

### Weight Variants
Add suffix for weight:
- `-medium` (500)
- `-semibold` (600)
- `-bold` (700)

Examples:
- `aucctus-header-sm-semibold`
- `aucctus-text-md-medium`
- `aucctus-text-sm-bold`

## Buttons

### Base Class
Always start with `btn`:
```tsx
className="btn btn-primary"
```

### Variants
| Class | Usage |
|-------|-------|
| `btn-primary` | Primary action (dark) |
| `btn-primary-light` | Light brand button |
| `btn-secondary` | Secondary action |
| `btn-light` | Light/subtle button |
| `btn-grey` | Neutral button |
| `btn-success` | Success action |
| `btn-danger` | Destructive action |
| `btn-warning` | Warning action |
| `btn-info` | Info action |

### Sizes
| Class | Usage |
|-------|-------|
| `btn-xs` | Extra small |
| `btn-sm` | Small |
| `btn-md` | Medium (default) |
| `btn-lg` | Large |

### Modifiers
| Class | Usage |
|-------|-------|
| `btn-bold` | Bold text |
| `btn-no-border` | Remove border |
| `btn-link` | Link style |
| `btn-generating` | Loading/generating state |

### Example
```tsx
<button className="btn btn-primary btn-sm">
  Save Changes
</button>
```

## Icons

```tsx
import { Icon } from '@components';

<Icon
  variant="clipboard"  // Icon name from icons.d.ts
  className="aucctus-stroke-primary h-5 w-5"
/>
```

### Size Mapping
| Tailwind | Pixels |
|----------|--------|
| `h-4 w-4` | 16px |
| `h-5 w-5` | 20px |
| `h-6 w-6` | 24px |

## Utility: cn()

Use `cn()` for conditional classes:

```tsx
import { cn } from '@libs/utils';

<div className={cn(
  'aucctus-bg-primary rounded-lg p-4',
  isActive && 'aucctus-bg-active',
  isError && 'aucctus-bg-error-primary'
)}>
```

## Common Patterns

### Card
```tsx
<div className="aucctus-bg-primary aucctus-border-secondary rounded-lg border p-4 shadow-sm">
  {/* content */}
</div>
```

### Section Header
```tsx
<h2 className="aucctus-header-xs-semibold aucctus-text-primary mb-4">
  Section Title
</h2>
```

### Muted Text
```tsx
<p className="aucctus-text-sm aucctus-text-secondary">
  Supporting information
</p>
```

### Interactive List Item
```tsx
<div className="aucctus-bg-secondary-hover rounded-md p-3 cursor-pointer">
  {/* content */}
</div>
```

### Status Badge
```tsx
<span className="aucctus-bg-success-primary aucctus-text-success-primary rounded-full px-2 py-1 aucctus-text-xs-medium">
  Active
</span>
```

### Icon Button
```tsx
<button
  className="aucctus-bg-secondary-hover rounded-full p-2 transition-colors"
  aria-label="Copy to clipboard"
>
  <Icon variant="clipboard" className="aucctus-stroke-secondary h-4 w-4" />
</button>
```

## Glassmorphic System (`.liquid-glass-*`)

Aucctus's dark canvas surfaces (Idea Playground, JTBD, Watchtower, and all modals) use a dedicated glassmorphic layer defined in `aucctus/src/app/assets/styles/global.scss`. These classes compose `backdrop-filter: blur()`, translucent fills, border highlights, and inner shadows to produce refractive glass.

**Do not compose these by hand from Tailwind utilities.** Always use the named classes or the React wrappers in `src/app/components/ui/` (`LiquidGlass.tsx`, `LiquidGlassModal.tsx`, `LiquidGlassDropdown.tsx`, `GlassSurface.tsx`, `ChromaticGlass.tsx`).

### CSS variables (defined at `:root` and overridden in `.dark`)

| Variable | Light | Dark | Purpose |
|---|---|---|---|
| `--glass-background` | `rgba(255,255,255,0.7)` | `rgba(255,255,255,0.05)` | Default surface fill |
| `--glass-background-elevated` | `rgba(255,255,255,0.55)` | `rgba(255,255,255,0.08)` | Elevated surfaces |
| `--glass-border` | `rgba(0,0,0,0.06)` | `rgba(255,255,255,0.1)` | Border ring |
| `--glass-border-subtle` | `rgba(0,0,0,0.06)` | `rgba(255,255,255,0.04)` | Subtle border |
| `--glass-shadow` | `0 1px 3px rgba(0,0,0,0.04)` | `0 8px 32px rgba(0,0,0,0.4)` | Resting shadow |
| `--glass-shadow-elevated` | — | — | Hover/elevated shadow |
| `--glass-blur` | `16px` | `16px` | Backdrop blur radius |
| `--glass-inner-glow` | — | — | `inset` highlight |

Chromatic tint variables (`--glass-chromatic-primary`, `-secondary`, `-tertiary`, `-accent`, `-intensity`) drive the prismatic highlights on modal rims and `ChromaticGlass`.

### Surface classes

| Class | Use for |
|---|---|
| `.liquid-glass` | Default glass card |
| `.liquid-glass-elevated` | Raised / popover glass with stronger shadow |
| `.liquid-glass-vibrant` | Higher-contrast hero surfaces |
| `.liquid-glass-vibrant-selected` | Selected state for vibrant |
| `.liquid-glass-contextual` | Neutral white glass for content areas |
| `.liquid-glass-persona` | Glass tinted by `--persona-color` CSS var |
| `.liquid-glass-persona-active` | Selected persona glass |
| `.liquid-glass-dark` | Floating cards on dark canvas (JTBD cards, Playground tiles) |
| `.liquid-glass-dark-selected` | Selected dark card |
| `.liquid-glass-light` | Dark-canvas chips with a lighter fill |
| `.liquid-glass-light-selected` | Selected light chip |
| `.liquid-glass-clean` | Minimal-chrome glass (tabs, toolbars) |
| `.liquid-glass-clean-selected` | Selected clean |
| `.liquid-glass-minimal` | Lightweight glass for nested/secondary elements |
| `.liquid-glass-chromatic` | Glass with brand-color gradient overlay |
| `.liquid-glass-immersive` | Full-depth glass for hero layers |
| `.liquid-glass-animate` | Adds the 8s shimmer keyframe |

### Modal architecture

Modals are composed of four layers. The rim is the visible "glass edge" users mean when they say "glass rim":

```
glass-modal-overlay       // blurred dark wash over the page
 └─ liquid-glass-modal-shell      // outer geometry, padding, lift shadow
     └─ liquid-glass-modal-rim    // frosted refractive ring (the "rim")
         └─ <content>             // bright inner surface
```

| Class | Purpose |
|---|---|
| `.glass-modal-overlay` | Radix overlay — `blur(6–8px)` + dark wash |
| `.liquid-glass-modal-shell` / `.liquid-glass-modal` | Outer geometry, `border-radius: 18px`, lift shadow, padding = rim thickness |
| `.liquid-glass-modal-rim` | Frosted ring: `blur(30px) saturate(2.2)`, prismatic `::before` tint, top-edge specular `::after` |
| `.liquid-glass-modal-rim-danger` | Red-tinted rim for destructive dialogs |
| `.liquid-glass-modal-rim-animated` | Slowly rotating conic gradient — use sparingly (Create Persona, Overseer) |

Rim-level CSS variables (set on the shell, cascade to the rim):

| Variable | Default | Purpose |
|---|---|---|
| `--lg-modal-radius` | `18px` | Modal corner radius |
| `--lg-rim` | `clamp(10px, 1.1vw + 8px, 14px)` | Rim thickness |
| `--lg-rim-blur` | `30px` | Rim backdrop-filter blur |
| `--lg-rim-saturate` | `2.2` | Rim saturation |
| `--lg-rim-alpha` | `0.12` light / `0.10` dark | Rim fill opacity |
| `--lg-surface-alpha` | `0.90` light / `0.78` dark | Inner surface opacity |

### The canonical modal wrapper — `<LiquidGlassModal>`

```tsx
import { LiquidGlassModal } from '@components/ui/LiquidGlassModal';

<LiquidGlassModal
  open={open}
  onOpenChange={setOpen}
  size="md"                     // 'sm' | 'md' | 'lg' | 'xl'
  variant="default"             // 'default' | 'danger'
  title="Rename Persona"
  description="This only affects the display name."
  animatedRim={false}           // true = rotating-conic rim
  hideCloseButton={false}
>
  {/* content */}
</LiquidGlassModal>
```

Sizes: `sm` 400px, `md` 560px, `lg` 720px, `xl` 900px — pick by content density, not viewport.

**Do not mount Radix `<Dialog.Content>` directly** — the rim and overlay won't apply. Always compose through `<LiquidGlassModal>`.

### Dark-canvas primitives you'll reach for

```tsx
// Floating card on a dark gradient
<div className="liquid-glass-dark rounded-xl p-4">…</div>

// Segmented glass pill (Idea Mode / Jobs to Be Done)
<div className="flex items-center gap-0.5 rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur-md">
  <button className="rounded-full border border-white/40 bg-white/20 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md shadow-lg">
    Idea Mode
  </button>
</div>

// Hero search (don't roll your own — use the composed shell + rim)
<div className="liquid-glass-search-shell">
  <div className="liquid-glass-search-rim" />
  <input className="…" />
</div>
```

### Glass do's and don'ts

**Do**
- Use a named `.liquid-glass-*` class or a wrapper component
- Keep glass layered exactly once over a contrasting base (dark gradient or modal overlay)
- Let the rim do the work for separation — avoid adding hard `border` on top of it
- Test hover states visually — opacity bumps are easy to make too subtle

**Don't**
- Stack glass on glass on glass (produces mud)
- Apply `backdrop-blur-*` utilities directly when a named class already covers the pattern
- Remove `overflow: hidden` from the shell — the rim's `::before` gradient depends on it
- Use glass on pages that are already light surfaces (Concepts list, Settings, Nucleus cards) — those should stay flat

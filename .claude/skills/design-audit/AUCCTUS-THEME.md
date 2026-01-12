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

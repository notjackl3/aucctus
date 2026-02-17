---
name: lovable-porting
description: Port code from external sources (Lovable/shadcn) to Aucctus codebase. Use when porting Lovable components, converting shadcn/ui to Aucctus, or migrating external React code.
---

# Lovable to Aucctus Porting

This skill guides you through porting code from external sources (specifically Lovable/shadcn-based code) to the internal Aucctus codebase.

## When to Use

- Porting components from `@lovable` directory
- Converting shadcn/ui components to Aucctus equivalents
- Migrating external React TypeScript code to Aucctus patterns

## Porting Process Overview

1. **Analyze External Component** - Understand purpose, UI elements, state flow
2. **Identify Internal Equivalents** - Map external to internal components
3. **Transform Imports** - Replace external libraries with Aucctus equivalents
4. **Convert UI Components** - Apply component mapping
5. **Update State Management** - Use mock data patterns
6. **Apply Aucctus Theme Classes** - Replace Tailwind with Aucctus classes
7. **Add Performance Optimizations** - useMemo, useCallback, React.memo
8. **Test and Validate** - Use the validation checklist

## Quick Reference: Import Transformations

```tsx
// EXTERNAL
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, ArrowDown, Plus } from 'lucide-react';
import { toast } from 'sonner';

// INTERNAL
import { Briefcase, ArrowDown, Plus } from 'lucide-react';  // Keep lucide icons as-is
import { toast, SectionHeader } from '@components';
import { motion } from 'framer-motion';  // For micro-interactions
```

## Animation & Interaction Libraries

**Framer Motion** is the primary animation library for micro-interactions:
- Entry/exit animations
- Hover effects and gestures
- Layout animations
- Stagger effects for lists

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
  whileHover={{ scale: 1.02 }}
>
  Content
</motion.div>
```

**Radix UI** provides accessible, unstyled primitives:
- `@radix-ui/react-dialog` - Modals
- `@radix-ui/react-dropdown-menu` - Dropdowns
- `@radix-ui/react-popover` - Popovers
- `@radix-ui/react-tooltip` - Tooltips
- `@radix-ui/react-tabs` - Tabs
- `@radix-ui/react-accordion` - Accordions
- And 10+ more components

When porting shadcn components, prefer Radix UI primitives over custom implementations.

## Component Mapping

| External | Internal |
|----------|----------|
| `Card` | `<div className="aucctus-bg-primary aucctus-border-secondary rounded-lg border shadow-sm">` |
| `CardHeader` | `<SectionHeader noDivider={true} />` |
| `Button variant="ghost"` | `<button className="aucctus-bg-secondary-hover rounded-full p-2 transition-colors">` |
| `Button variant="outline"` | `<button className="btn btn-light">` |
| `Button variant="default"` | `<button className="btn btn-primary">` |
| Lucide icons | Keep as-is - Aucctus uses `lucide-react` directly |
| `toast` (sonner) | `toast` from `@components` |

## Styling Transformations

### Text Colors
- `text-primary` → `aucctus-text-primary`
- `text-muted-foreground` → `aucctus-text-secondary`
- `text-destructive` → `aucctus-text-error-primary`

### Backgrounds
- `bg-background` → `aucctus-bg-primary`
- `bg-muted` → `aucctus-bg-secondary`

### Typography
- `text-sm` → `aucctus-text-sm`
- `text-lg` → `aucctus-text-lg`
- `font-semibold` → append `-semibold` to size class

### Hover Classes (Important!)
```tsx
// CORRECT - Use -hover suffix directly
className="aucctus-bg-primary-hover"

// INCORRECT - Don't use hover: prefix
className="hover:aucctus-bg-primary-hover"
```

## Icons (No Transformation Needed)

Aucctus uses `lucide-react` directly, so **keep lucide icons as-is**:

```tsx
// Keep this - no changes needed
import { Briefcase, ArrowDown, Plus } from 'lucide-react';

<Briefcase className="h-5 w-5 text-primary" />
```

Just update the color classes to use Aucctus theme classes:
- `text-primary` → `aucctus-text-primary`
- `text-muted-foreground` → `aucctus-text-secondary`

## State Management Pattern

```tsx
// Use string IDs, add timestamps
interface MockJob {
  id: string;  // Not number
  text: string;
  createdAt: string;
}

// Use useMemo for derived data
const sortedJobs = useMemo(
  () => [...mockJobs].sort((a, b) => (a.order || 0) - (b.order || 0)),
  [mockJobs],
);

// Use useCallback for handlers
const handleDelete = useCallback((id: string) => {
  setMockJobs(mockJobs.filter(job => job.id !== id));
  toast.success('Job removed');
}, [mockJobs]);
```

## Validation Checklist

Before completing a port, verify:

- [ ] All shadcn/ui imports removed
- [ ] Lucide icons kept as-is (just update color classes to aucctus-* variants)
- [ ] All sonner toast replaced with @components toast
- [ ] Tailwind colors replaced with aucctus-* classes
- [ ] Buttons use btn classes
- [ ] Hover classes use -hover suffix (not hover: prefix)
- [ ] useMemo for derived state
- [ ] useCallback for handlers
- [ ] aria-label on icon buttons
- [ ] React.memo on exported component

## Detailed Reference

For complete transformation examples, decision trees, and edge cases, see [REFERENCE.md](REFERENCE.md).

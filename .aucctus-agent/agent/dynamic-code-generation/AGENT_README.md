# Dynamic Component Generation Guide

You are generating React components that will be dynamically compiled and rendered in the Aucctus application. This guide provides your core vocabulary and constraints.

## Your Reference Documents

1. **[ALLOWED_IMPORTS_GUIDE.md](./ALLOWED_IMPORTS_GUIDE.md)** - Your complete import vocabulary (what you can and cannot import)
2. **[base-component-creation-guide.md](./base-component-creation-guide.md)** - Your component patterns, styling rules, and examples

## Your Core Constraints

- **Token compliance**: You must ONLY use existing design tokens from [tailwind.config.js](../../../tailwind.config.js). No new colors, shadows, or animations.
- **Icons**: Use `lucide-react` exclusively for all icons
- **Animations**: Use `framer-motion` for complex animations, Tailwind classes for simple transitions
- **Radix UI**: Always wrap Radix primitives with existing token-based Tailwind utilities

## Your Component Template

```tsx
import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { cn } from '@libs/utils/react';

// Your components must:
// - Use ONLY existing tokens from tailwind.config.js
// - Use lucide-react for icons
// - Use framer-motion or Tailwind for animations
// - Wrap all Radix components with existing tokens
// - Support light/dark modes
// - Include TypeScript types
// - Handle loading/error/empty states
```

## Your Success Criteria

Before you complete a component, verify:
- [ ] No new design tokens introduced
- [ ] All colors from `tailwind.config.js`
- [ ] All icons from `lucide-react`
- [ ] Animations use `framer-motion` or existing Tailwind classes
- [ ] Radix components properly wrapped
- [ ] Light and dark modes supported
- [ ] TypeScript types correct
- [ ] Accessible (ARIA, semantic HTML, keyboard nav)

You have everything you need. The two reference guides are your vocabulary. Now create something beautiful.


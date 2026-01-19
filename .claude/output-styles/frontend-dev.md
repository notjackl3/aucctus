---
name: frontend-dev
description: Frontend development with React, TypeScript, and automatic type checking/linting enforcement
keep-coding-instructions: true
---

# Frontend Development Mode

You are working on the **Aucctus React TypeScript frontend** located in `/aucctus/`. This mode enforces strict type safety and code quality standards.

## Mandatory Development Workflow

After EVERY code change session (Edit, Write, or batch of changes), you MUST:

1. **Run Type Checking**
   ```bash
   cd aucctus && npm run type-check
   ```
   - Fix ALL type errors before considering the task complete
   - Never leave type errors unresolved
   - Read error messages carefully and fix the root cause

2. **Run Linting**
   ```bash
   cd aucctus && npm run lint
   ```
   - Fix ALL linting errors
   - Many errors can be auto-fixed with `npm run lint -- --fix`
   - Address any remaining manual fixes

3. **Iterate Until Clean**
   - If type checking fails → fix errors → re-run type checking
   - If linting fails → fix errors → re-run linting
   - Continue this loop until BOTH pass with zero errors
   - Only then is the task complete

## Frontend Stack Reference

**Framework**: React 18 with TypeScript
**Build Tool**: Vite
**State Management**: Zustand with lens-based slices
**Styling**: Aucctus theme classes + Tailwind CSS
**Animations**: Framer Motion (primary) for micro-interactions
**UI Primitives**: Radix UI for accessible components
**API Layer**: React Query + Axios
**Authentication**: Clerk

## Key Standards

- Use Aucctus theme classes (`aucctus-*`) as primary styling
- Add Framer Motion animations for polish (entry, hover, transitions)
- Use Radix UI primitives for accessible components
- Functional components with TypeScript
- All parameters must have explicit type annotations
- Use path aliases (`@components`, `@hooks`, `@stores`, etc.)

## Animation Patterns (Framer Motion)

```tsx
import { motion } from 'framer-motion';

// Entry animation
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>

// Hover effect
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>

// Staggered list
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
  >
))}
```

## Quality Checklist

Before completing any frontend task, verify:
- [ ] `npm run type-check` passes with zero errors
- [ ] `npm run lint` passes with zero errors
- [ ] Components use Aucctus theme classes
- [ ] Micro-interactions added where appropriate (buttons, cards, transitions)
- [ ] TypeScript types are explicit and correct
- [ ] No console.log statements in production code

## Important Reminders

- **NEVER** skip type checking - it catches bugs before runtime
- **NEVER** leave linting errors - they indicate code quality issues
- **ALWAYS** fix errors immediately after they're discovered
- **ALWAYS** re-run checks after fixes to verify they pass
- Type checking and linting are **NON-NEGOTIABLE** parts of the development workflow

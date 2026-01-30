# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aucctus is a React TypeScript frontend application for concept incubation and market analysis. It uses Vite for building, Zustand for state management, and Clerk for authentication.

## Output Style (Quality Enforcement)

For enforced type checking and linting workflows, use the frontend output style:

**Frontend Development Mode** (`/output-style frontend-dev`):
- Enforces `npm run type-check` after code changes
- Requires `npm run lint` to pass
- Mandates iterative fixing until all checks pass
- Emphasizes Framer Motion animations and Radix UI usage
- Makes validation a core part of the development workflow

**How to activate:**
```bash
/output-style frontend-dev
```

This modifies Claude's system prompt to make type checking and linting non-negotiable. When active, Claude will automatically run validation checks and fix errors until all checks pass.

**Related Skill:**
- `/frontend-dev` - Frontend development skill (recommends frontend-dev output style)

## Development Commands

```bash
# Development
npm run dev              # Start Vite dev server with hot reload
npm run start:dev        # Alias for dev

# Building
npm run build            # Production build
npm run preview          # Preview production build locally

# Testing
npm run test             # Run all tests with Vitest

# Code Quality
npm run lint             # ESLint with max-warnings=0
npm run type-check       # TypeScript checking
npm run format           # Prettier formatting
npm run prettier-check   # Check formatting without fixing

# Icons (when adding new SVG icons)
npm run generate-sprite  # Regenerate icon sprite and types
```

## Architecture

### Directory Structure
```
src/
├── app/
│   ├── stores/        # Zustand state management (lens-based slices)
│   ├── pages/         # Page components
│   ├── components/    # Reusable UI components
│   ├── hooks/         # Custom React hooks
│   ├── context/       # React context providers
│   ├── assets/        # Styles (SCSS + Tailwind)
│   └── bootstraps/    # Auth and socket initialization
├── routes/            # React Router config with auth guards
├── libs/
│   ├── api/           # API layer (Axios-based with Clerk integration)
│   └── utils/         # Shared utilities
└── types/             # TypeScript type definitions
```

### Path Aliases
```typescript
@components  // src/app/components
@pages       // src/app/pages
@routes      // src/routes
@libs        // src/libs
@hooks       // src/app/hooks
@stores      // src/app/stores
@assets      // src/app/assets
@context     // src/app/context
@bootstraps  // src/app/bootstraps
```

### State Management (Zustand)
Uses `@dhmk/zustand-lens` for composable slices with multi-persist middleware:
- **Local storage**: Auth tokens (encrypted), financial assumptions
- **Session storage**: UI state, incubation progress, concept context

Key store slices: `auth`, `incubation`, `conceptReport`, `financialProjection`, `aiEditing`, `syntheticTesting`

### API Layer
- All API classes extend `ApiService` in `src/libs/api/base/apiService.ts`
- Clerk tokens injected automatically via axios interceptors
- WebSocket service with auto-reconnect in `src/libs/api/base/socketService.ts`

### Routing
- Routes defined as enums in `src/routes/routes.ts` (`AppPath`, `ConceptPath`)
- Auth guards: `AuthGuard` (Clerk validation), `AccessGuard` (account check)
- Layouts: `PrivateLayout` (with NavDrawer), `PublicLayout`

## Styling Guidelines

### Theme System
Always use Aucctus theme classes as the primary styling approach, then supplement with Tailwind utilities.

**Text colors**: `aucctus-text-primary`, `aucctus-text-secondary`, `aucctus-text-brand-primary`, etc.
**Backgrounds**: `aucctus-bg-primary`, `aucctus-bg-secondary`, `aucctus-bg-brand-solid`, etc.
**Borders**: `aucctus-border-primary`, `aucctus-border-secondary`, `aucctus-border-brand`, etc.
**Strokes (SVG)**: `aucctus-stroke-primary`, `aucctus-stroke-secondary`, etc.

**Typography**: `aucctus-header-{size}`, `aucctus-text-{size}` with optional `-medium`, `-semibold`, `-bold` suffixes.

**Button classes**: `btn btn-primary`, `btn btn-secondary`, etc. with sizes `btn-xs`, `btn-sm`, `btn-md`, `btn-lg`.

### Hover Classes
For classes with `-hover` suffix, use them directly (not with `hover:` prefix):
```tsx
// Correct
className="aucctus-bg-primary-hover"

// Incorrect
className="aucctus-bg-primary hover:aucctus-bg-primary-hover"
```

### Conditional Classes
Always use the `cn` utility with object notation for conditional classes.

## Component Patterns

### Icons
```tsx
import { Icon } from '@components';
<Icon variant="clipboard" className="aucctus-fill-brand-primary h-5 w-5" />
```
Icon variants are typed in `icons.d.ts`.

### Toasts
```tsx
import { toast } from '@components';
```

### Skeleton Loading
Use `SkeletonBlock` from `@components` and follow patterns in `.cursor/rules/skeleton-components.mdc`.

## Animation & UI Libraries

### Framer Motion (Micro-interactions)
**Primary library for animations and micro-interactions.** Use for:
- Entry/exit animations
- Hover effects and gestures
- Layout animations
- Stagger effects for lists

```tsx
import { motion } from 'framer-motion';

// Entry animation
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>

// Hover effect
<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
>
  Click me
</motion.button>

// Staggered list
{items.map((item, index) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3, delay: index * 0.1 }}
  >
    {item.content}
  </motion.div>
))}
```

### Radix UI (Accessible Primitives)
**Comprehensive collection of unstyled, accessible UI primitives.** Available components:
- `@radix-ui/react-dialog` - Modal dialogs
- `@radix-ui/react-dropdown-menu` - Dropdown menus
- `@radix-ui/react-popover` - Popovers
- `@radix-ui/react-tooltip` - Tooltips
- `@radix-ui/react-accordion` - Accordions
- `@radix-ui/react-tabs` - Tab navigation
- `@radix-ui/react-select` - Select inputs
- `@radix-ui/react-checkbox` - Checkboxes
- `@radix-ui/react-switch` - Toggle switches
- `@radix-ui/react-slider` - Range sliders
- `@radix-ui/react-progress` - Progress bars
- `@radix-ui/react-toast` - Toast notifications
- `@radix-ui/react-toggle` - Toggle buttons
- `@radix-ui/react-toggle-group` - Toggle button groups
- `@radix-ui/react-separator` - Dividers
- `@radix-ui/react-navigation-menu` - Navigation menus
- `@radix-ui/react-context-menu` - Context menus
- `@radix-ui/react-hover-card` - Hover cards
- `@radix-ui/react-label` - Form labels
- `@radix-ui/react-alert-dialog` - Alert dialogs
- `@radix-ui/react-aspect-ratio` - Aspect ratio containers

Use Radix primitives for accessible, keyboard-friendly components, then style with Aucctus theme classes.

## Feature Flags
Defined in `vite.config.mts` and `.env`:
- `FEATURE_CUSTOMER_PROFILE_CHAT`
- `FEATURE_CUSTOMER_PROFILE_REAL_WORLD_SIGNALS`
- `FEATURE_CONCEPT_VERSIONING`
- `FEATURE_POST_CONCEPT_CLARIFYING_QUESTIONS`
- `FEATURE_OVERSEER`

When adding new feature flags, also add them to `vite-env.d.ts`.

## Code Standards

### TypeScript
- Parameters and property declarations require type annotations (ESLint rule)
- Use functional components with hooks
- Use arrow functions for component definitions
- Destructure props

### ESLint Rules
- `no-console: warn` - Avoid console.log in production code
- `react-hooks/exhaustive-deps: warn` - Ensure hook dependencies are complete
- `@typescript-eslint/no-unused-vars: warn`

## Monorepo Note
The `osiris/` directory contains a separate backend project with its own rules. This CLAUDE.md covers the frontend only.

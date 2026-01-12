# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Aucctus is a React TypeScript frontend application for concept incubation and market analysis. It uses Vite for building, Zustand for state management, and Clerk for authentication.

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

## Feature Flags
Defined in `vite.config.mts` and `.env`:
- `FEATURE_CUSTOMER_PROFILE_CHAT`
- `FEATURE_CUSTOMER_PROFILE_REAL_WORLD_SIGNALS`
- `FEATURE_CONCEPT_VERSIONING`
- `FEATURE_POST_CONCEPT_CLARIFYING_QUESTIONS`

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

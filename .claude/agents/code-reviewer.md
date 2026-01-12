# Code Reviewer Subagent

A specialized code review agent for the Aucctus React TypeScript frontend application. This agent reviews code for project-specific patterns, type safety, styling conventions, and best practices.

## When to Use

Invoke this agent proactively after making code changes to ensure they follow Aucctus conventions. Use it for:
- Reviewing new components or pages
- Checking React Query hooks and mutations
- Validating Zustand store patterns
- Ensuring styling follows the Aucctus theme system
- Pre-commit code quality checks

## Tools Available

- **Read**: Read file contents for detailed review
- **Grep**: Search for patterns across the codebase
- **Glob**: Find files matching patterns
- **Bash**: Run linting, type-checking, and other commands

## Review Checklist

### 1. TypeScript Type Safety

- [ ] All function parameters have explicit type annotations
- [ ] Props are properly typed (avoid `any`)
- [ ] API response types are defined in `src/libs/api/types/`
- [ ] Generic types are used appropriately for reusable hooks

```typescript
// Good
const MyComponent: FunctionComponent<MyComponentProps> = ({ title, onClick }) => { ... }

// Bad - missing type annotations
const MyComponent = ({ title, onClick }) => { ... }
```

### 2. React Query Patterns

- [ ] Query keys use `AucctusQueryKeys` enum from `@hooks/query/query-keys.ts`
- [ ] Mutations include `onSuccess` with appropriate query invalidation
- [ ] Mutations include `onError` with user-friendly toast messages
- [ ] Error handling uses `utils.osiris.parseFormError(e)` for API errors

```typescript
// Correct mutation pattern
export const useMyMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MyDataType) => await api.myService.doSomething(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AucctusQueryKeys.myQueryKey] });
      toast.success('Success Title', 'Success description message');
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error('Error Title', message || 'Fallback error message');
    },
  });
};
```

### 3. Zustand Store Patterns

- [ ] Store slices use `@dhmk/zustand-lens` pattern
- [ ] Initial state is exported for reset functionality
- [ ] Actions are defined within the slice
- [ ] State is properly partitioned for persistence (local vs session storage)

```typescript
// Correct slice pattern
import { lens } from '@dhmk/zustand-lens';

export const initialMyState = {
  data: null,
  isLoading: false,
};

export interface IMyState {
  data: MyDataType | null;
  isLoading: boolean;
  setData: (data: MyDataType) => void;
  reset: () => void;
}

const mySlice = lens<IMyState>((set) => ({
  ...initialMyState,
  setData: (data) => set({ data }),
  reset: () => set(initialMyState),
}));

export default mySlice;
```

### 4. Styling - Aucctus Theme System

**Priority**: Always use Aucctus theme classes first, then Tailwind utilities.

- [ ] Text colors use `aucctus-text-*` classes
- [ ] Background colors use `aucctus-bg-*` classes
- [ ] Borders use `aucctus-border-*` classes
- [ ] SVG strokes use `aucctus-stroke-*` classes
- [ ] Typography uses `aucctus-header-*` or `aucctus-text-*` with size modifiers

**Theme Class Reference**:
```
Text:       aucctus-text-primary, aucctus-text-secondary, aucctus-text-tertiary,
            aucctus-text-brand-primary, aucctus-text-success-primary,
            aucctus-text-warning-primary, aucctus-text-error-primary

Background: aucctus-bg-primary, aucctus-bg-secondary, aucctus-bg-tertiary,
            aucctus-bg-brand-solid, aucctus-bg-success-secondary,
            aucctus-bg-warning-secondary, aucctus-bg-error-secondary

Borders:    aucctus-border-primary, aucctus-border-secondary, aucctus-border-brand

Typography: aucctus-header-{sm|md|lg|xl|2xl}
            aucctus-text-{xs|sm|md|lg} with optional -medium, -semibold, -bold

Buttons:    btn btn-primary, btn btn-secondary (with btn-xs, btn-sm, btn-md, btn-lg)
```

### 5. Hover Classes

- [ ] Hover classes with `-hover` suffix are used directly (NOT with `hover:` prefix)

```typescript
// Correct
className="aucctus-bg-primary-hover"

// Incorrect
className="hover:aucctus-bg-primary-hover"
```

### 6. Conditional Classes - cn() Utility

- [ ] All conditional classes use `cn()` utility from `@libs/utils/react`
- [ ] Object notation is used for conditional classes

```typescript
// Correct - using cn() with object notation
import { cn } from '@libs/utils/react';

className={cn(
  'base-class aucctus-text-primary',
  {
    'aucctus-text-success-primary': isSuccess,
    'aucctus-text-error-primary': isError,
  }
)}

// Incorrect - string concatenation
className={`base-class ${isSuccess ? 'success' : 'error'}`}
```

### 7. Component Patterns

- [ ] Use arrow functions for component definitions
- [ ] Props are destructured in function signature
- [ ] Icons use the `Icon` component from `@components`
- [ ] Toasts use `toast` from `@components`
- [ ] Loading states use `SkeletonBlock` from `@components`

```typescript
// Correct component pattern
import { Icon, toast, SkeletonBlock } from '@components';

interface MyComponentProps {
  title: string;
  isLoading?: boolean;
}

const MyComponent: FunctionComponent<MyComponentProps> = ({
  title,
  isLoading = false
}) => {
  if (isLoading) return <SkeletonBlock className="h-20 w-full" />;

  return (
    <div className="aucctus-bg-primary">
      <Icon variant="clipboard" className="aucctus-fill-brand-primary h-5 w-5" />
      <h2 className="aucctus-header-lg">{title}</h2>
    </div>
  );
};
```

### 8. Console Statements

- [ ] No `console.log` statements in production code (ESLint warning)
- [ ] Use `telemetry` service for logging if needed

```typescript
// Avoid
console.log('debug info');

// Prefer - use telemetry or remove
import telemetry from '@libs/telemetry';
telemetry.debug('debug info');
```

### 9. Path Aliases

- [ ] All imports use path aliases, not relative paths

```typescript
// Correct
import { Icon } from '@components';
import useStore from '@stores/store';
import api from '@libs/api';

// Incorrect
import { Icon } from '../../../components';
```

### 10. React Hook Dependencies

- [ ] `useEffect`, `useCallback`, `useMemo` have complete dependency arrays
- [ ] No missing dependencies (ESLint warning)

## Review Commands

Run these commands to check code quality:

```bash
# Type checking
npm run type-check

# Linting (max-warnings=0)
npm run lint

# All tests
npm run test

# Format check
npm run prettier-check
```

## Review Process

1. **Identify changed files** - Use `git diff` or `git status`
2. **Read each changed file** - Use the Read tool
3. **Check against checklist** - Go through each item above
4. **Search for patterns** - Use Grep to find potential issues
5. **Run validation commands** - Execute lint and type-check
6. **Report findings** - Provide specific file paths, line numbers, and suggested fixes

## Example Review Output

```
## Code Review Results

### File: src/app/pages/MyPage/MyComponent.tsx

**Issues Found:**

1. **Line 15**: Missing error handling in mutation
   - Current: `onError: () => {}`
   - Fix: Add toast.error with utils.osiris.parseFormError

2. **Line 32**: Using `hover:` prefix with Aucctus hover class
   - Current: `className="hover:aucctus-bg-primary-hover"`
   - Fix: `className="aucctus-bg-primary-hover"`

3. **Line 45**: Missing type annotation
   - Current: `const handleClick = (item) => ...`
   - Fix: `const handleClick = (item: ItemType) => ...`

4. **Line 67**: console.log found
   - Fix: Remove or replace with telemetry

### Commands Run:
- `npm run type-check`: Passed
- `npm run lint`: 2 warnings (console statements)

### Summary:
- 4 issues found
- 2 high priority (type safety, error handling)
- 2 medium priority (styling, console statements)
```

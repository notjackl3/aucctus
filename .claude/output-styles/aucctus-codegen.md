---
name: Aucctus Codegen
description: Generate code following Aucctus development conventions, theme system, and architectural patterns
keep-coding-instructions: true
---

# Aucctus Code Generation Style

When generating code for the Aucctus codebase, follow these conventions strictly.

## Path Aliases

Always use path aliases for imports:
```typescript
import { Icon, toast } from '@components';
import { useConcepts } from '@hooks/query/concepts.hook';
import useStore from '@stores/store';
import api from '@libs/api';
import utils from '@libs/utils';
```

Available aliases:
- `@components` - src/app/components
- `@pages` - src/app/pages
- `@routes` - src/routes
- `@libs` - src/libs
- `@hooks` - src/app/hooks
- `@stores` - src/app/stores
- `@assets` - src/app/assets
- `@context` - src/app/context
- `@bootstraps` - src/app/bootstraps

## Component Patterns

### Functional Components with Arrow Functions
```typescript
interface MyComponentProps {
  title: string;
  onClick?: () => void;
}

const MyComponent = ({ title, onClick }: MyComponentProps) => {
  return (
    <div className="aucctus-bg-primary p-4">
      <h2 className="aucctus-text-primary aucctus-header-lg">{title}</h2>
    </div>
  );
};

export default MyComponent;
```

### Icons
Always use the Icon component:
```typescript
import { Icon } from '@components';

<Icon variant="clipboard" className="aucctus-fill-brand-primary h-5 w-5" />
<Icon variant="chevron-right" className="aucctus-stroke-secondary h-4 w-4" />
```

### Toasts
```typescript
import { toast } from '@components';

toast.success('Title', 'Description message');
toast.error('Error Title', 'Error description');
```

## Styling Guidelines

### Theme Classes (Primary Approach)
Always use Aucctus theme classes first, then supplement with Tailwind:

**Text Colors:**
- `aucctus-text-primary` - Main text
- `aucctus-text-secondary` - Secondary text
- `aucctus-text-tertiary` - Tertiary text
- `aucctus-text-brand-primary` - Brand accent text
- `aucctus-text-error-primary` - Error text
- `aucctus-text-success-primary` - Success text

**Backgrounds:**
- `aucctus-bg-primary` - Primary background
- `aucctus-bg-secondary` - Secondary background
- `aucctus-bg-tertiary` - Tertiary background
- `aucctus-bg-brand-solid` - Solid brand background
- `aucctus-bg-error-primary` - Error background
- `aucctus-bg-success-primary` - Success background

**Borders:**
- `aucctus-border-primary` - Primary border
- `aucctus-border-secondary` - Secondary border
- `aucctus-border-brand` - Brand border
- `aucctus-border-error` - Error border

**Strokes (SVG):**
- `aucctus-stroke-primary` - Primary stroke
- `aucctus-stroke-secondary` - Secondary stroke
- `aucctus-stroke-brand-primary` - Brand stroke

**Typography:**
- `aucctus-header-2xl`, `aucctus-header-xl`, `aucctus-header-lg`, `aucctus-header-md`, `aucctus-header-sm`, `aucctus-header-xs`
- Add weight suffixes: `-medium`, `-semibold`, `-bold`
- `aucctus-text-xl`, `aucctus-text-lg`, `aucctus-text-md`, `aucctus-text-sm`, `aucctus-text-xs`

### Hover Classes
Use hover classes directly (they include the base styling):
```typescript
// Correct
className="aucctus-bg-primary-hover"

// Incorrect - don't combine base and hover
className="aucctus-bg-primary hover:aucctus-bg-primary-hover"
```

### Button Classes
```typescript
<button className="btn btn-primary btn-md">Primary</button>
<button className="btn btn-secondary btn-sm">Secondary</button>
<button className="btn btn-danger btn-lg">Danger</button>
```

### Conditional Classes with cn()
Always use `cn` utility with object notation for conditional classes:
```typescript
import { cn } from '@libs/utils';

<div
  className={cn(
    'aucctus-bg-primary p-4 rounded-lg',
    {
      'aucctus-border-brand': isActive,
      'aucctus-border-error': hasError,
      'opacity-50': isDisabled,
    }
  )}
>
```

## State Management (Zustand)

### Lens-based Slice Pattern
```typescript
import { Lens, lens } from '@dhmk/zustand-lens';
import type { IAppStore } from '../store';

export interface IMyFeatureState {
  data: string[];
  isLoading: boolean;
  setData: (data: string[]) => void;
  reset: () => void;
}

export const initialMyFeatureState = {
  data: [] as string[],
  isLoading: false,
};

const myFeatureSlice: Lens<IMyFeatureState, IAppStore> = (set, get) => {
  return {
    ...initialMyFeatureState,

    setData: (data: string[]) => {
      const currentState = get();
      set({
        ...currentState,
        data,
      });
    },

    reset: () => {
      const currentState = get();
      set({
        ...currentState,
        ...initialMyFeatureState,
      });
    },
  };
};

export default lens<IMyFeatureState, IAppStore>(myFeatureSlice);
```

### Using Store in Components
```typescript
import useStore from '@stores/store';

const MyComponent = () => {
  const data = useStore((state) => state.myFeature.data);
  const setData = useStore((state) => state.myFeature.setData);

  // ...
};
```

## React Query Hooks

### Query Pattern
```typescript
import { useQuery } from 'react-query';
import api from '@libs/api';
import { AucctusQueryKeys } from './query-keys';

export const useMyData = (uuid?: string) => {
  const query = useQuery({
    queryKey: [AucctusQueryKeys.myData, uuid],
    queryFn: async () => uuid ? await api.myService.getData(uuid) : undefined,
    enabled: !!uuid,
    staleTime: 1000 * 60 * 2, // 2 minutes
    cacheTime: 1000 * 60 * 2, // 2 minutes
  });

  return { ...query, myData: query.data };
};
```

### Mutation Pattern
```typescript
import { useMutation, useQueryClient } from 'react-query';
import { toast } from '@components';
import api from '@libs/api';
import utils from '@libs/utils';
import { AucctusQueryKeys } from './query-keys';

export const useUpdateMyData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: { uuid: string; data: MyDataType }) => {
      return await api.myService.updateData(params.uuid, params.data);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [AucctusQueryKeys.myData, variables.uuid],
      });
      toast.success('Data Updated', 'Your changes have been saved');
    },
    onError: (e) => {
      const message = utils.osiris.parseFormError(e);
      toast.error('Update Failed', message || 'Unable to update data');
    },
  });
};
```

## TypeScript Conventions

### Type Annotations Required
Always add type annotations to parameters and property declarations:
```typescript
// Correct
const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => { ... };
const processData = (items: string[], count: number): ProcessedResult => { ... };

// Interface properties
interface Props {
  title: string;
  count: number;
  onSubmit: (data: FormData) => void;
}
```

### Type Definitions
Place types in `src/libs/api/types/` for API-related types:
```typescript
// src/libs/api/types/myFeature.d.ts
export interface IMyFeatureItem {
  uuid: string;
  name: string;
  createdAt: string;
}
```

## Code Quality

- Use functional components with hooks (no class components)
- Use arrow functions for component definitions
- Destructure props in function parameters
- Document complex logic with comments
- Document component props with JSDoc for complex components
- Avoid console.log in production code
- Ensure complete hook dependencies (exhaustive-deps)
- Use useMemo and useCallback for expensive calculations
- Use semantic HTML elements with proper ARIA attributes

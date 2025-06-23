# Feature Versioning Pattern

This document describes the feature versioning pattern used in the Aucctus application to manage different versions of features based on concept-specific configuration.

## Overview

The feature versioning pattern allows us to render different versions of components (v1, v2, etc.) based on configuration stored in the concept's `featureVersions` field. This approach enables:

- Gradual migration from legacy implementations to new versions
- A/B testing of different feature implementations
- Per-concept feature flag management
- Clean separation between different versions of the same feature

## Concept Model

The `IConcept` interface includes a `featureVersions` field:

```typescript
export interface IConcept extends IBaseConceptEntity {
  // ... other fields
  featureVersions?: { [featureName: string]: string };
}
```

Example concept data:
```json
{
  "featureVersions": {
    "assumptions": "v2",
    "financialProjection": "v2"
  }
}
```

## Implementation Pattern

### 1. Wrapper Component Structure

Each feature that has multiple versions should have a dedicated wrapper component that:

- Uses `useOutletContext<IConceptReportContext>()` to access the current concept
- Reads the feature version from `concept.featureVersions?.[featureName]`
- Renders the appropriate version component based on the configuration
- Provides fallback to v1 if no version is specified

### 2. Example Implementation

#### Page-Level Wrapper
```typescript
// FeatureWrapper.tsx
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import FeatureV1 from './Feature/FeatureV1';
import FeatureV2 from './Feature/FeatureV2';
import { IConceptReportContext } from './ConceptReport/ConceptReport';

const FeatureWrapper: React.FC = () => {
  const { concept } = useOutletContext<IConceptReportContext>();
  
  // Use concept's featureVersions to determine which version to render
  const featureVersion = concept.featureVersions?.featureName || 'v1';
  const shouldRenderV2 = featureVersion === 'v2';

  return (
    <>
      {shouldRenderV2 ? (
        <FeatureV2 />
      ) : (
        <FeatureV1 />
      )}
    </>
  );
};

export default FeatureWrapper;
```

#### Component-Level Wrapper (for Cards, etc.)
```typescript
// FeatureCardWrapper.tsx
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { useFeatureV1, useFeatureV2 } from '@hooks/query/feature.hook';
import { IConceptReportContext } from '@pages/Concept/Report/ConceptReport/ConceptReport';
import FeatureCard from './FeatureCard';

const FeatureCardWrapper: React.FC<{ onViewClick: () => void }> = ({
  onViewClick,
}) => {
  const { concept } = useOutletContext<IConceptReportContext>();
  
  // Use concept's featureVersions to determine which hook to use
  const featureVersion = concept.featureVersions?.featureName || 'v1';
  const shouldUseV2 = featureVersion === 'v2';
  
  // Call appropriate hooks
  const { data: dataV1, isLoading: isV1Loading } = useFeatureV1(concept.uuid);
  const { data: dataV2, isLoading: isV2Loading } = useFeatureV2(concept.uuid);
  
  // Use appropriate data and loading state
  const data = shouldUseV2 ? dataV2 : dataV1;
  const isLoading = shouldUseV2 ? isV2Loading : isV1Loading;

  return <FeatureCard data={data} isLoading={isLoading} onViewClick={onViewClick} />;
};

export default FeatureCardWrapper;
```

### 3. Directory Structure

```
src/app/pages/Concept/Report/
├── FeatureWrapper.tsx          # Main wrapper component
├── Feature/                    # Feature implementations directory
│   ├── FeatureV1.tsx          # Version 1 implementation
│   ├── FeatureV2.tsx          # Version 2 implementation
│   └── components/            # Shared components (if any)
└── index.ts                   # Export the wrapper
```

## Current Implementations

### Financial Projections

- **Wrapper**: `FinancialProjectionsWrapper.tsx`
- **Feature Key**: `financialProjection`
- **V1**: `FinancialDetails.tsx` (uses `useFinancialProjection` hook)
- **V2**: `FinancialProjections/FinancialProjections.tsx` (uses `useFinancialProjectionV2` hook)
- **Note**: Each version uses its own dedicated API endpoint and hook for clean separation

### Assumptions

- **Page Wrapper**: `AssumptionsWrapper.tsx`
- **Card Wrapper**: `Card/AssumptionsCardWrapper.tsx`
- **Feature Key**: `assumptions`
- **V1**: `Assumptions/AssumptionsV1.tsx` (uses `useAssumptions` hook)
- **V2**: `Assumptions/AssumptionsV2.tsx` (uses `useFilteredAssumptions` hook)
- **Note**: Both page-level and card-level components use feature versioning

## Best Practices

### 1. Naming Conventions

- Wrapper components should be named `{FeatureName}Wrapper.tsx`
- Version components should be named `{FeatureName}V{X}.tsx`
- Feature keys in `featureVersions` should use camelCase

### 2. Version Management

- Always provide a fallback to v1 if no version is specified
- Use semantic versioning (v1, v2, v3, etc.)
- Consider backward compatibility when introducing new versions

### 3. Migration Strategy

1. Create the new version component (e.g., `FeatureV2.tsx`)
2. Create or update the wrapper component to handle version selection
3. Update routing/exports to use the wrapper instead of direct version imports
4. Test both versions work correctly
5. Gradually migrate concepts to the new version via backend configuration
6. Remove old version when no longer needed

### 4. Context Usage

- Always use `useOutletContext<IConceptReportContext>()` to access concept data
- Don't rely on global state stores for concept data in wrapper components
- Ensure the concept context is properly typed

### 5. Hook and API Separation

- Each version should use its own dedicated hook and API endpoint
- V1 and V2 implementations should be completely independent
- Avoid shared response wrappers with version flags (prefer direct types)
- Let the wrapper component handle version selection, not the API layer

## Testing Considerations

- Test both version paths in wrapper components
- Test fallback behavior when `featureVersions` is undefined
- Test version switching with different concept configurations
- Consider adding integration tests for version compatibility

## Deprecation Process

When deprecating older versions:

1. Add deprecation comments to the old version components
2. Plan migration timeline for all concepts using the old version
3. Monitor usage through telemetry if available
4. Remove old version files and update wrapper logic
5. Update documentation to reflect current supported versions

## Related Files

- `src/libs/api/types/concept/concepts.d.ts` - IConcept interface definition
- `src/app/pages/Concept/Report/ConceptReport/ConceptReport.tsx` - Context provider
- `src/app/pages/Concept/Report/index.ts` - Component exports 
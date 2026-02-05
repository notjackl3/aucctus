# DynamicComponentRenderer

A React component for dynamically loading and rendering agent-compiled components at runtime.

## Overview

`DynamicComponentRenderer` enables you to load React components that were compiled by the agent-side compiler and render them in the Aucctus frontend. This powers the dynamic report generation workflow where the agent creates custom visualization components on-the-fly.

## Quick Start

```tsx
import { DynamicComponentRenderer } from '@components/DynamicComponent';

const MyPage: React.FC = () => {
  return (
    <DynamicComponentRenderer
      componentUrl="/compiled/MarketAnalysis.js"
      componentId="MarketAnalysis"
      onLoad={() => console.log('Component loaded!')}
      onError={(error) => console.error('Failed:', error)}
    />
  );
};
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `componentUrl` | `string` | - | URL to fetch the compiled component JS from |
| `compiledCode` | `string` | - | Alternatively, provide compiled code directly |
| `componentId` | `string` | - | Identifier for caching and debugging |
| `componentProps` | `Record<string, unknown>` | `{}` | Props to pass to the loaded component |
| `onLoad` | `() => void` | - | Callback when component loads successfully |
| `onError` | `(error: Error) => void` | - | Callback when loading fails |
| `loadingComponent` | `React.ReactNode` | Built-in loader | Custom loading UI |
| `errorComponent` | `React.ReactNode` | Built-in error | Custom error UI |
| `showRetry` | `boolean` | `true` | Show retry button on error |
| `className` | `string` | - | Additional CSS classes |
| `animate` | `boolean` | `true` | Animate entrance on load |

## Usage Examples

### Basic Usage - Load from URL

```tsx
<DynamicComponentRenderer
  componentUrl="/compiled/GymsharkGTM.js"
  componentId="GymsharkGTM"
/>
```

### Load from API Endpoint

```tsx
<DynamicComponentRenderer
  componentUrl={`/api/reports/${reportId}/component`}
  componentId={reportId}
  onLoad={() => {
    // Track successful load
    analytics.track('report_loaded', { reportId });
  }}
  onError={(error) => {
    // Handle error
    toast.error(`Failed to load report: ${error.message}`);
  }}
/>
```

### Provide Pre-fetched Code

If you've already fetched the compiled code (e.g., via a previous API call):

```tsx
const [compiledCode, setCompiledCode] = useState<string | null>(null);

useEffect(() => {
  fetch(`/api/reports/${reportId}/compiled`)
    .then(res => res.text())
    .then(setCompiledCode);
}, [reportId]);

if (!compiledCode) return <Loading />;

return (
  <DynamicComponentRenderer
    compiledCode={compiledCode}
    componentId={reportId}
  />
);
```

### Pass Props to Dynamic Component

```tsx
<DynamicComponentRenderer
  componentUrl="/compiled/InteractiveChart.js"
  componentId="InteractiveChart"
  componentProps={{
    data: chartData,
    title: "Revenue Over Time",
    showLegend: true,
  }}
/>
```

### Custom Loading State

```tsx
<DynamicComponentRenderer
  componentUrl="/compiled/Report.js"
  componentId="Report"
  loadingComponent={
    <div className="flex items-center justify-center h-96">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="mt-4 aucctus-text-secondary">
          Generating your custom report...
        </p>
      </div>
    </div>
  }
/>
```

### Custom Error State

```tsx
<DynamicComponentRenderer
  componentUrl="/compiled/Report.js"
  componentId="Report"
  showRetry={false}
  errorComponent={
    <div className="p-8 text-center aucctus-bg-error-subtle rounded-lg">
      <Icon variant="alert-circle" className="h-12 w-12 mx-auto aucctus-stroke-error-primary" />
      <h3 className="mt-4 aucctus-header-md-semibold aucctus-text-error-primary">
        Report Unavailable
      </h3>
      <p className="mt-2 aucctus-text-secondary">
        Please contact support for assistance.
      </p>
      <Button variant="primary" onClick={() => window.location.reload()}>
        Refresh Page
      </Button>
    </div>
  }
/>
```

### With Animation Disabled

```tsx
<DynamicComponentRenderer
  componentUrl="/compiled/Report.js"
  componentId="Report"
  animate={false}  // Disable entrance animation
/>
```

## How It Works

### Loading Flow

```
1. Component mounts
   │
   ▼
2. State: 'loading'
   │  Shows loading UI
   │
   ▼
3. Fetch compiled JS from componentUrl
   │  (or use provided compiledCode)
   │
   ▼
4. Validate syntax (validateComponent)
   │
   ▼
5. Execute with scope (executeWithScope)
   │  Injects React, Components, Utils, Recharts
   │
   ▼
6. State: 'success'
   │  Renders loaded component
   │
   ▼
7. Error boundary catches any render errors
```

### Scope Injection

When a component is executed, it receives these dependencies:

| Scope Variable | Contents |
|----------------|----------|
| `React` | Full React library including hooks |
| `Components` | Aucctus component library (Icon, Button, Card, etc.) |
| `Utils` | Utility functions (cn, etc.) |
| `Recharts` | Complete Recharts library |

### Error Handling

The component has multiple layers of error handling:

1. **Fetch Errors** - Network failures, 404s, etc.
2. **Validation Errors** - Invalid JavaScript syntax
3. **Execution Errors** - Runtime errors during component creation
4. **Render Errors** - React render errors (caught by error boundary)

All errors are captured and displayed with a retry option.

## Development Features

In development mode (`NODE_ENV === 'development'`), additional debugging info is shown:

- ✅ Load time in milliseconds
- 📦 Component ID badge
- Technical error details (expandable)

## Scope Registry

The scope registry (`scopeRegistry.ts`) defines all available dependencies:

### Available Components

```typescript
// From @components
Icon, Button, Card, Modal, Loading, Tooltip, Badge,
Input, Select, Table, Tabs, TabsList, TabsTrigger, TabsContent,
toast, Avatar, Banner, Container, Header, Text, Progress,
ComponentCarousel, ComponentTooltip, Chart, Legend,
AiInteraction, ToggleSwitch, Portal, FileDropzone
```

### Available Utils

```typescript
// From @libs/utils/react
cn  // Class name merger (clsx + tailwind-merge)
```

### Available Recharts

All Recharts components are available:

```typescript
ResponsiveContainer, LineChart, Line, BarChart, Bar,
PieChart, Pie, AreaChart, Area, ScatterChart, Scatter,
RadarChart, Radar, XAxis, YAxis, ZAxis, CartesianGrid,
Tooltip, Legend, Cell, PolarGrid, PolarAngleAxis, PolarRadiusAxis
```

## Adding New Dependencies

To make additional dependencies available to dynamic components:

### 1. Update scopeRegistry.ts

```typescript
// Add import
import { NewComponent } from '@components';

// Add to Components object
export const Components = {
  // ... existing
  NewComponent,
} as const;
```

### 2. Update compile-test.mjs

Add the dependency to the wrapper function's destructuring:

```javascript
function wrapWithScopeInjection(compiledCode, globalName) {
  return `
(function(React, Components, Utils, Recharts) {
  // ... existing vars
  var NewComponent = Components.NewComponent;
  
  ${compiledCode}
  
  return ${globalName}.default || ${globalName};
})
  `;
}
```

## Performance Considerations

1. **Caching**: Consider caching compiled components on the client side
2. **Code Splitting**: Large components are loaded on-demand, not bundled
3. **Memoization**: The renderer memoizes the component instance

### Example: Client-Side Caching

```tsx
const componentCache = new Map<string, string>();

const CachedDynamicComponent: React.FC<{ url: string }> = ({ url }) => {
  const [code, setCode] = useState<string | null>(componentCache.get(url) || null);
  
  useEffect(() => {
    if (!code) {
      fetch(url)
        .then(res => res.text())
        .then(text => {
          componentCache.set(url, text);
          setCode(text);
        });
    }
  }, [url, code]);
  
  if (!code) return <Loading />;
  
  return (
    <DynamicComponentRenderer
      compiledCode={code}
      componentId={url}
    />
  );
};
```

## Security Notes

1. **Only load trusted components** - The component executes JavaScript
2. **Validate sources** - Only load from known origins
3. **Content Security Policy** - Configure CSP headers appropriately
4. **No eval directives** - The component uses `new Function()` which requires appropriate CSP

## Troubleshooting

### Component shows loading indefinitely

- Check network tab for fetch failures
- Verify the URL is correct
- Check CORS headers if loading from different origin

### "Failed to fetch component: 404"

- Ensure the compiled JS file exists at the specified path
- Check the file was output to the correct directory

### "Invalid component: [syntax error]"

- The compiled code has a JavaScript syntax error
- Re-compile the source component
- Check the compilation output for warnings

### "Compiled code did not return a valid React component"

- Component doesn't have a default export
- Export is not a function or React.memo object

### Charts not appearing

- Ensure charts are wrapped in `ResponsiveContainer`
- Parent container needs explicit height

## Example: Full Page Integration

```tsx
import React from 'react';
import { DynamicComponentRenderer } from '@components/DynamicComponent';
import { Icon } from '@components';

const ReportPage: React.FC<{ reportId: string }> = ({ reportId }) => {
  const componentUrl = `/api/reports/${reportId}/compiled.js`;

  return (
    <div className="min-h-screen aucctus-bg-secondary">
      {/* Header */}
      <div className="aucctus-bg-primary border-b aucctus-border-secondary p-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <Icon variant="presentation-chart" className="h-6 w-6 aucctus-stroke-brand-primary" />
          <h1 className="aucctus-header-lg-semibold aucctus-text-primary">
            Dynamic Report
          </h1>
        </div>
      </div>

      {/* Dynamic Content */}
      <div className="p-6">
        <DynamicComponentRenderer
          componentUrl={componentUrl}
          componentId={reportId}
          onLoad={() => {
            // Scroll to top on load
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onError={(error) => {
            // Log to error tracking service
            console.error('Report load failed:', error);
          }}
        />
      </div>
    </div>
  );
};

export default ReportPage;
```


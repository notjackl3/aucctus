# Agent Component Compilation Guide

This guide explains how to compile React TSX components for dynamic rendering in the Aucctus frontend.

## Overview

The agent compiler transforms React TSX source files into browser-executable JavaScript that can be loaded and rendered dynamically at runtime. This enables the agent to generate custom report components on-the-fly.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AGENT SIDE                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   [Component.tsx]  ──►  [ESBuild + Plugin]  ──►  [Component.js] │
│                                                                 │
│   Raw TSX with        Scope injection         Browser-ready    │
│   standard imports    plugin rewrites         factory function  │
│                       external imports                          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (API / Static Serving)
┌─────────────────────────────────────────────────────────────────┐
│                       FRONTEND SIDE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   [Component.js]  ──►  [executeWithScope()]  ──►  <Component /> │
│                                                                 │
│   Factory function    Scope registry injects   Rendered React  │
│   fetched via URL     React, Components, etc.  component       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Compile a Component

```bash
cd agent
node scripts/compile-test.mjs ../src/app/pages/MyComponent/MyComponent.tsx
```

Output:
```
📦 Compiling: /path/to/MyComponent.tsx
✅ Compiled successfully!
   📄 Output: /path/to/public/compiled/MyComponent.js
   ⏱️  Time: 37ms
   📊 Size: 68.4KB → 87.4KB
```

### 2. Serve the Compiled File

The compiled file is output to `public/compiled/`. In production, serve these files via:
- Static file server
- FastAPI endpoint
- CDN

### 3. Render in Frontend

```tsx
<DynamicComponentRenderer
  componentUrl="/compiled/MyComponent.js"
  componentId="MyComponent"
/>
```

## Compilation Details

### The Scope Injection Plugin

The key to dynamic loading is the **scope injection plugin**. It intercepts imports and replaces them with references to runtime-injected scope variables.

**Before (TSX source):**
```tsx
import React, { useState, useMemo } from 'react';
import { Icon, Button } from '@components';
import { cn } from '@libs/utils/react';
import { BarChart, Bar, XAxis, YAxis } from 'recharts';

const MyComponent: React.FC = () => {
  const [count, setCount] = useState(0);
  return <div>...</div>;
};

export default MyComponent;
```

**After (Compiled JS):**
```javascript
// Agent-compiled component
(function(React, Components, Utils, Recharts) {
  "use strict";
  
  // React hooks are available from React
  var useState = React.useState;
  var useMemo = React.useMemo;
  
  // Components from @components
  var Icon = Components.Icon;
  var Button = Components.Button;
  
  // Utils
  var cn = Utils.cn;
  
  // Recharts
  var BarChart = Recharts.BarChart;
  var Bar = Recharts.Bar;
  
  // ... component code ...
  
  return MyComponent;
})
```

### Supported Import Paths

| Import Path | Maps To | Description |
|-------------|---------|-------------|
| `react` | `React` | React core library |
| `react/jsx-runtime` | Custom JSX runtime | Automatic JSX transform |
| `@components` | `Components` | Aucctus component library |
| `@libs/utils/react` | `Utils` | Utility functions (cn, etc.) |
| `recharts` | `Recharts` | Complete Recharts library |

### Available Dependencies

#### React (via `React`)
- All React hooks: `useState`, `useEffect`, `useMemo`, `useCallback`, `useRef`, etc.
- `React.memo`, `React.forwardRef`
- `React.Fragment`

#### Components (via `Components`)
- `Icon` - Icon component with 100+ variants
- `Button` - Button component with variants
- `Card` - Card container
- `Modal` - Modal dialog
- `Loading` - Loading spinner
- `Tooltip` - Tooltip component
- `Badge` - Badge component
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` - Tab components
- `toast` - Toast notifications
- And more...

#### Utils (via `Utils`)
- `cn` - Tailwind class name merger (clsx + tailwind-merge)

#### Recharts (via `Recharts`)
- All Recharts components: `LineChart`, `BarChart`, `PieChart`, `AreaChart`, etc.
- All chart parts: `XAxis`, `YAxis`, `Tooltip`, `Legend`, `Cell`, etc.

## Programmatic API

### Basic Compilation

```typescript
import { compileComponentForBrowser } from './compiler/compile';

const result = await compileComponentForBrowser({
  entryPoint: '/path/to/Component.tsx',
  outputPath: '/path/to/output/Component.js',
});

if (result.success) {
  console.log(`Compiled in ${result.compileTime}ms`);
  console.log(`Output: ${result.outputPath}`);
} else {
  console.error(`Compilation failed: ${result.error}`);
}
```

### Advanced Options

```typescript
const result = await compileComponentForBrowser({
  entryPoint: '/path/to/Component.tsx',
  outputPath: '/path/to/output/Component.js',
  minify: true,           // Enable minification (default: false)
  sourcemap: false,       // Generate sourcemaps (default: false)
  target: 'es2020',       // ECMAScript target (default: 'es2020')
});
```

## FastAPI Integration

Here's an example FastAPI endpoint for on-demand compilation:

```python
from fastapi import FastAPI, HTTPException
from fastapi.responses import PlainTextResponse
import subprocess
import tempfile
import os

app = FastAPI()

@app.post("/api/compile")
async def compile_component(tsx_content: str, component_name: str):
    """Compile TSX content and return the compiled JavaScript."""
    
    # Create temp file for TSX content
    with tempfile.NamedTemporaryFile(
        mode='w', 
        suffix='.tsx', 
        delete=False
    ) as f:
        f.write(tsx_content)
        tsx_path = f.name
    
    try:
        # Run the compiler
        output_path = f"/app/compiled/{component_name}.js"
        
        result = subprocess.run(
            ["node", "scripts/compile-test.mjs", tsx_path],
            cwd="/app/agent",
            capture_output=True,
            text=True
        )
        
        if result.returncode != 0:
            raise HTTPException(500, f"Compilation failed: {result.stderr}")
        
        # Read compiled output
        with open(output_path, 'r') as f:
            compiled_code = f.read()
        
        return PlainTextResponse(compiled_code)
        
    finally:
        os.unlink(tsx_path)


@app.get("/compiled/{component_name}.js")
async def get_compiled_component(component_name: str):
    """Serve a pre-compiled component."""
    
    path = f"/app/compiled/{component_name}.js"
    
    if not os.path.exists(path):
        raise HTTPException(404, "Component not found")
    
    with open(path, 'r') as f:
        return PlainTextResponse(
            f.read(),
            media_type="application/javascript"
        )
```

## Component Authoring Guidelines

### Required Export

Components **must** have a default export:

```tsx
// ✅ Correct
const MyComponent: React.FC = () => <div>Hello</div>;
export default MyComponent;

// ✅ Also correct (with React.memo)
const MyComponent: React.FC = () => <div>Hello</div>;
export default React.memo(MyComponent);

// ❌ Wrong - named export only
export const MyComponent: React.FC = () => <div>Hello</div>;
```

### Use Aucctus Theme Classes

Always use Aucctus theme classes for consistent styling:

```tsx
// ✅ Correct
<div className="aucctus-bg-primary aucctus-text-secondary">
  <h1 className="aucctus-header-lg-semibold aucctus-text-primary">Title</h1>
</div>

// ❌ Avoid - raw Tailwind without theme
<div className="bg-gray-100 text-gray-600">
  <h1 className="text-2xl font-semibold text-gray-900">Title</h1>
</div>
```

### Use `cn()` for Conditional Classes

```tsx
import { cn } from '@libs/utils/react';

const MyButton: React.FC<{ active?: boolean }> = ({ active }) => (
  <button
    className={cn(
      'px-4 py-2 rounded-lg',
      'aucctus-bg-primary aucctus-border-secondary',
      {
        'aucctus-bg-brand-solid': active,
        'hover:aucctus-bg-secondary': !active,
      }
    )}
  >
    Click me
  </button>
);
```

### Chart Components

Use Recharts for all data visualizations:

```tsx
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const MyChart: React.FC = () => (
  <div className="h-64 w-full">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="value" stroke="#7c3aed" />
      </LineChart>
    </ResponsiveContainer>
  </div>
);
```

## Troubleshooting

### "Compiled code did not return a valid React component"

**Cause:** The component doesn't have a default export, or the export is not a function/memo object.

**Fix:** Ensure your component has `export default ComponentName;`

### "Cannot find module '@components'"

**Cause:** The scope injection plugin isn't correctly handling the import.

**Fix:** Check that the import path matches one of the supported paths exactly.

### "ReferenceError: X is not defined"

**Cause:** The component is using a variable/hook that isn't being injected.

**Fix:** Ensure all React hooks are properly destructured from the scope:
```javascript
var useState = React.useState;
var useEffect = React.useEffect;
```

### Charts not rendering

**Cause:** Recharts components must be wrapped in `ResponsiveContainer`.

**Fix:**
```tsx
<div className="h-64 w-full">
  <ResponsiveContainer width="100%" height="100%">
    <BarChart data={data}>...</BarChart>
  </ResponsiveContainer>
</div>
```

## Performance Tips

1. **Memoize expensive calculations** with `useMemo`
2. **Use `React.memo`** for pure components to prevent unnecessary re-renders
3. **Keep component file size reasonable** - very large components (>200KB) may impact load time
4. **Use lazy loading** for components with many charts

## Security Considerations

1. **Validate TSX source** before compilation - sanitize user input
2. **Limit scope access** - only expose necessary dependencies
3. **Use Content Security Policy** headers for served JS files
4. **Implement rate limiting** on compilation endpoints

## Example: Complete Workflow

```bash
# 1. Agent generates component
agent generate-report "Market analysis for fitness industry" > MarketAnalysis.tsx

# 2. Validate and lint
npm run lint -- MarketAnalysis.tsx
npm run type-check  # Uses project's tsconfig.json (NEVER use `npx tsc --noEmit <file>`)

# 3. Compile for browser
node agent/scripts/compile-test.mjs MarketAnalysis.tsx

# 4. Serve compiled file
# The file is now at public/compiled/MarketAnalysis.js

# 5. Frontend loads dynamically
# <DynamicComponentRenderer componentUrl="/compiled/MarketAnalysis.js" />
```


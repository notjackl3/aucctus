# Component Verification Guide

How to verify dynamic components and fix errors before sending to the frontend.

---

## Quick Start

```typescript
import {
  compileComponent,
  verifyTSXSource,
  verifyCompiledCode,
  formatErrorForAgent,
} from '@aucctus/agent-compiler';

async function compileAndVerify(tsxCode: string) {
  // Step 1: Verify source
  const sourceCheck = verifyTSXSource(tsxCode);
  if (!sourceCheck.valid) {
    return { success: false, error: formatErrorForAgent(sourceCheck) };
  }

  // Step 2: Compile
  const result = await compileComponent(tsxCode);

  // Step 3: Verify compiled output
  const compiledCheck = verifyCompiledCode(result.code);
  if (!compiledCheck.valid) {
    return { success: false, error: formatErrorForAgent(compiledCheck) };
  }

  // Success!
  return { success: true, code: result.code };
}
```

---

## Error Codes & Fixes

### NO_DEFAULT_EXPORT

**Problem:** Component doesn't have a default export.

```tsx
// ❌ Wrong
export const MyComponent = () => <div>Hello</div>;

// ✅ Correct
const MyComponent = () => <div>Hello</div>;
export default MyComponent;

// ✅ Also correct
export default React.memo(MyComponent);
```

---

### FORBIDDEN_IMPORT

**Problem:** Using a library that's not available at runtime.

| Forbidden | Use Instead |
|-----------|-------------|
| `framer-motion` | Tailwind: `animate-fade-in`, `transition-all` |
| `react-icons` | `<Icon variant="..." />` |
| `lucide-react` | `<Icon variant="..." />` |
| `lodash` | Native JS: `array.map()`, `Object.keys()` |
| `moment` | `dateFormatter()`, `formatDate()` |
| `date-fns` | `dateFormatter()`, `formatDate()` |
| `axios` | Native `fetch()` |

---

### INVALID_IMPORT_PATH

**Problem:** Import from unknown module.

**Allowed imports:**
```tsx
import React from 'react';
import { Icon, Button, ... } from '@components';
import { cn } from '@libs/utils/react';
import { BarChart, ... } from 'recharts';
import * as Popover from '@radix-ui/react-popover';
import ReactMarkdown from 'react-markdown';
```

---

### BADGE_WRONG_PROPS

**Problem:** Using wrong props on Badge component.

```tsx
// ❌ Wrong - Badge doesn't have text or variant props
<Badge variant="primary" text="Label" />

// ✅ Correct - Badge uses value prop
<Badge value="Label" />
<Badge value={5} />
<Badge value="New" classNameBadge="aucctus-bg-success-subtle" />
```

---

### SYNTAX_ERROR

**Problem:** JavaScript syntax error in compiled code.

**Common causes:**
- Unclosed brackets `{`, `[`, `(`
- Missing commas in arrays/objects
- Unclosed template literals
- Invalid JSX syntax

**How to fix:**
1. Check the line number in the error
2. Look for unclosed brackets or missing punctuation
3. Validate JSX is properly formatted

---

### UNDEFINED_REFERENCE

**Problem:** Using a variable that doesn't exist at runtime.

```tsx
// ❌ Wrong - motion is from framer-motion
<motion.div animate={{ opacity: 1 }}>

// ✅ Correct - use Tailwind
<div className="animate-fade-in">
```

---

## Runtime Errors (From Frontend)

These errors happen when the component renders in the browser.

### "Element type is invalid: expected a string... but got: object"

**Cause:** Using a namespace object as a component.

```tsx
// ❌ Wrong - Badge is a namespace object in some cases
<Badge.SomeComponent />  // if Badge.SomeComponent is undefined

// ✅ Correct - use the default Badge
<Badge value="Label" />
```

---

### "X is not defined"

**Cause:** Using something that wasn't imported or isn't available.

**Fix:** Check that all used variables are:
1. Imported from allowed modules
2. Declared in the component
3. Available as runtime utilities (formatLargeNumber, cn, etc.)

---

## Full Verification Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    TSX SOURCE CODE                          │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  verifyTSXSource()                                          │
│  ├─ Check for default export                                │
│  ├─ Check imports are allowed                               │
│  ├─ Check for common mistakes (Badge props, etc.)           │
│  └─ Return errors or continue                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ (if valid)
┌─────────────────────────────────────────────────────────────┐
│  compileComponent()                                         │
│  ├─ ESBuild transforms TSX → JS                             │
│  ├─ Scope injection plugin rewrites imports                 │
│  └─ Wrapper adds runtime scope variables                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│  verifyCompiledCode()                                       │
│  ├─ Check syntax is valid                                   │
│  ├─ Check wrapper structure                                 │
│  └─ Return errors or continue                               │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼ (if valid)
┌─────────────────────────────────────────────────────────────┐
│                   SEND TO FRONTEND                          │
│  Frontend runs executeWithScope() and renders               │
│  Any runtime errors are sent back via API                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Handling Frontend Errors

When the frontend fails to render, it returns an error object:

```json
{
  "success": false,
  "error": {
    "stage": "render",
    "type": "RenderError",
    "message": "Element type is invalid: expected a string...",
    "hint": "A component is being used as an object instead of a function",
    "stack": "..."
  }
}
```

**Agent should:**
1. Read the `hint` field for guidance
2. Review the component code for the issue
3. Regenerate with the fix applied

---

## Example: Agent Retry Loop

```typescript
async function generateWithRetry(prompt: string, maxAttempts = 3) {
  let lastError = '';
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    // Generate component
    const tsxCode = await generateComponent(prompt + lastError);
    
    // Verify source
    const sourceCheck = verifyTSXSource(tsxCode);
    if (!sourceCheck.valid) {
      lastError = `\n\nPrevious attempt failed:\n${formatErrorForAgent(sourceCheck)}\nPlease fix and try again.`;
      continue;
    }
    
    // Compile
    const result = await compileComponent(tsxCode);
    
    // Verify compiled
    const compiledCheck = verifyCompiledCode(result.code);
    if (!compiledCheck.valid) {
      lastError = `\n\nCompilation issue:\n${formatErrorForAgent(compiledCheck)}\nPlease fix and try again.`;
      continue;
    }
    
    // Send to frontend and check runtime
    const renderResult = await sendToFrontend(result.code);
    if (!renderResult.success) {
      lastError = `\n\nRuntime error:\n${renderResult.error.message}\nHint: ${renderResult.error.hint}`;
      continue;
    }
    
    // Success!
    return { success: true, code: result.code };
  }
  
  return { success: false, error: `Failed after ${maxAttempts} attempts. Last error: ${lastError}` };
}
```

---

## Quick Reference

| Check | Function | When |
|-------|----------|------|
| Source validation | `verifyTSXSource()` | Before compilation |
| Compiled validation | `verifyCompiledCode()` | After compilation |
| Both at once | `quickVerify()` | Quick check |
| Format for agent | `formatErrorForAgent()` | When error occurs |
| Format as JSON | `formatErrorAsJSON()` | For API responses |


# Dynamic Component Hooks

This directory contains React Query hooks for interacting with the aucctus-dynamic-frontend service.

## Available Hooks

### HTTP-based Hooks (`dynamicComponent.hook.ts`)

Standard HTTP request/response hooks:

- **`useComponentGenerator`** - Generate components (HTTP POST)
- **`useComponentList`** - List all generated components
- **`useComponent`** - Get a specific component
- **`useDeleteComponent`** - Delete a component
- **`useServiceHealth`** - Check service health

### WebSocket Hook (`dynamicComponentWebSocket.hook.ts`)

Real-time streaming hook:

- **`useComponentGeneratorWebSocket`** - Generate components with real-time streaming

## When to Use Which?

### Use HTTP Hook (`useComponentGenerator`)

✅ When you want simple request/response  
✅ When you don't need progress updates  
✅ When streaming overhead is not desired  
✅ For background/batch generation  

```tsx
import { useComponentGenerator } from '@hooks/query/dynamicComponent.hook';

const { generate, isLoading, result } = useComponentGenerator();

// Wait for complete result
await generate({ query: 'Create a button' });
```

### Use WebSocket Hook (`useComponentGeneratorWebSocket`)

✅ When you want real-time progress updates  
✅ When you need to show thinking/tool usage  
✅ For better UX with live feedback  
✅ For interactive component generation  

```tsx
import { useComponentGeneratorWebSocket } from '@hooks/query/dynamicComponentWebSocket.hook';

const { generate, isStreaming, messages, result } = useComponentGeneratorWebSocket();

// Get real-time updates
await generate({ query: 'Create a button' });
// Messages update as generation progresses
```

## Interface Compatibility

Both hooks share the same core interface:

```typescript
interface IGenerateRequest {
  query: string;
  files?: File[];
  maxTurns?: number;
  maxThinkingTokens?: number;
}

// Both return similar interface
const {
  generate,           // (request: IGenerateRequest) => Promise<IGenerateComponentResponse>
  reset,             // () => void
  isLoading,         // boolean
  result,            // IGenerateComponentResponse | null
  messages,          // IAgentMessage[]
  sourceCode,        // string | null
  compiledCode,      // string | null
  componentName,     // string | null
  cost,              // number | undefined
  duration,          // number | undefined
} = useHook();
```

**Key Difference:**
- HTTP: `messages` is empty until completion
- WebSocket: `messages` updates in real-time

## Migration Guide

Switching between hooks is simple:

```tsx
// Before (HTTP)
import { useComponentGenerator } from '@hooks/query/dynamicComponent.hook';
const { generate, isLoading, result } = useComponentGenerator();

// After (WebSocket)
import { useComponentGeneratorWebSocket } from '@hooks/query/dynamicComponentWebSocket.hook';
const { generate, isLoading, result } = useComponentGeneratorWebSocket();

// Everything else stays the same!
```

## Example: ComponentWorkshop

The ComponentWorkshop uses the WebSocket hook for real-time feedback:

```tsx
const {
  generate,
  isLoading: isGenerating,
  result,
  compiledCode: generatedCompiledCode,
  componentName: generatedComponentName,
  reset,
  duration,
  cost,
  messages,
} = useComponentGeneratorWebSocket();
```

See: `src/app/pages/ComponentWorkshop/ComponentWorkshop.tsx`

## Environment Configuration

Both hooks use the same environment variable:

```bash
# .env
VITE_DYNAMIC_FRONTEND_URL=http://localhost:8003
```

- HTTP hook uses: `http://localhost:8003/v1/component/generate`
- WebSocket hook uses: `ws://localhost:8003/v1/component/generate-ws`

The WebSocket hook automatically converts `http://` to `ws://` and `https://` to `wss://`.

## Performance Considerations

### HTTP Hook
- Lower memory usage
- No persistent connection
- Simple request/response cycle

### WebSocket Hook
- Maintains connection during generation
- Stores messages in state
- Real-time updates add overhead
- Better perceived performance (users see progress)

## Error Handling

Both hooks provide similar error handling:

```tsx
const { generate, error, isError } = useHook();

try {
  await generate({ query: 'Create component' });
} catch (err) {
  console.error('Generation failed:', err);
}

// Or check status
if (isError) {
  toast.error('Failed', error?.message);
}
```

## TypeScript Support

Both hooks are fully typed with shared interfaces:

```typescript
import type {
  IGenerateComponentRequest,
  IGenerateComponentResponse,
  IAgentMessage,
} from '@libs/api/types/dynamicComponent.d';
```

## Testing

### HTTP Hook
```tsx
const { result } = renderHook(() => useComponentGenerator());
await act(async () => {
  await result.current.generate({ query: 'Create button' });
});
expect(result.current.result?.status).toBe('success');
```

### WebSocket Hook
```tsx
const { result } = renderHook(() => useComponentGeneratorWebSocket());
await act(async () => {
  await result.current.generate({ query: 'Create button' });
});
expect(result.current.messages.length).toBeGreaterThan(0);
expect(result.current.result?.status).toBe('success');
```

## Documentation

- [WebSocket Component Generation](../../../docs/WEBSOCKET_COMPONENT_GENERATION.md)
- [Backend WebSocket Implementation](../../../osiris/projects/aucctus-dynamic-frontend/WEBSOCKET_IMPLEMENTATION_SUMMARY.md)
- [Backend Integration Guide](../../../osiris/projects/aucctus-dynamic-frontend/WEBSOCKET_INTEGRATION.md)

## Support

For issues:
1. Check backend service: `docker-compose ps`
2. View logs: `docker-compose logs -f aucctus-dynamic-frontend`
3. Test endpoints: `curl http://localhost:8003/v1/health`
4. Test WebSocket: `wscat -c ws://localhost:8003/v1/component/generate-ws?query=test`


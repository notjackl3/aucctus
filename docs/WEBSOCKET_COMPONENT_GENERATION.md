# WebSocket Component Generation

This document explains the real-time WebSocket implementation for dynamic component generation in the Aucctus frontend.

## Overview

The ComponentWorkshop now uses WebSocket streaming to provide real-time feedback during component generation. Users can see:
- Agent thinking process
- Tool usage (file operations, code execution, etc.)
- Progress updates
- Success/error messages
- Final results with metrics

## Architecture

### WebSocket Hook

**Location:** `src/app/hooks/query/dynamicComponentWebSocket.hook.ts`

The `useComponentGeneratorWebSocket` hook provides:
- Real-time message streaming
- Connection management
- State tracking (connecting, streaming, complete, error)
- Automatic cleanup on unmount
- File upload support (files are uploaded via HTTP before WebSocket connection)

### Enhanced Progress Display

**Location:** `src/app/pages/ComponentWorkshop/components/GenerationProgress.tsx`

The GenerationProgress component now displays:
- **Thinking** - Agent reasoning (blue, lightbulb icon)
- **Tool Use** - Tools being executed (brand color, gear icon)
- **Tool Result** - Tool execution results (green, check icon)
- **System** - System messages (accent color, alert icon)
- **Text** - Regular agent messages (secondary, message icon)
- **Error** - Error messages (red, warning icon)

Features:
- Auto-scrolls to latest messages
- Displays up to 50 recent messages
- Shows message count with loading indicator
- Color-coded by message type
- Formatted tool use previews

## Usage

### Basic Component Generation

```tsx
import { useComponentGeneratorWebSocket } from '@hooks/query/dynamicComponentWebSocket.hook';

const MyComponent = () => {
  const {
    generate,
    isStreaming,
    messages,
    result,
    reset,
  } = useComponentGeneratorWebSocket();

  const handleGenerate = async () => {
    await generate({
      query: 'Create a dashboard card with metrics',
    });
  };

  return (
    <div>
      <button onClick={handleGenerate} disabled={isStreaming}>
        Generate Component
      </button>
      
      {/* Messages update in real-time */}
      {messages.map((msg, idx) => (
        <div key={idx}>{msg.content}</div>
      ))}
      
      {/* Result available after completion */}
      {result && (
        <div>
          <p>Component: {result.generatedComponent?.name}</p>
          <p>Duration: {result.durationMs}ms</p>
          <p>Cost: ${result.totalCostUsd}</p>
        </div>
      )}
    </div>
  );
};
```

### With File Uploads

```tsx
const handleGenerateWithFiles = async (files: File[]) => {
  await generate({
    query: 'Create a dashboard based on this mockup',
    files: files,
  });
};
```

### Hook Return Values

```tsx
const {
  // Methods
  generate,           // Function to start generation
  reset,             // Reset all state
  
  // Status flags
  status,            // Current status: 'idle' | 'connecting' | 'connected' | 'streaming' | 'complete' | 'error' | 'disconnected'
  isConnecting,      // True when establishing connection
  isConnected,       // True when WebSocket connected
  isStreaming,       // True when receiving messages
  isComplete,        // True when generation finished
  isLoading,         // True during any active state
  isError,           // True if error occurred
  isSuccess,         // True if completed successfully
  
  // Data
  messages,          // Array of real-time messages
  result,            // Final generation result
  error,             // Error object if failed
  
  // Convenience accessors
  sourceCode,        // Generated component source
  compiledCode,      // Compiled component code
  componentName,     // Generated component name
  cost,              // Total USD cost
  duration,          // Duration in milliseconds
} = useComponentGeneratorWebSocket();
```

## Message Types

### Agent Message Structure

```typescript
interface IAgentMessage {
  type: 'text' | 'thinking' | 'tool_use' | 'tool_result' | 'system' | 'user' | 'result' | 'error';
  content: string;
  timestamp: string;
}
```

### Message Type Examples

**Thinking:**
```json
{
  "type": "thinking",
  "content": "I need to create a React component with TypeScript...",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Tool Use:**
```json
{
  "type": "tool_use",
  "content": "Tool: Write\nPath: /app/repos/aucctus/src/components/Dashboard.tsx\nInput: {...}",
  "timestamp": "2024-01-01T12:00:01.000Z"
}
```

**Tool Result:**
```json
{
  "type": "tool_result",
  "content": "Successfully wrote file Dashboard.tsx",
  "timestamp": "2024-01-01T12:00:02.000Z"
}
```

**System:**
```json
{
  "type": "system",
  "content": "subagent_start: {\"name\": \"ComponentGenerator\"}",
  "timestamp": "2024-01-01T12:00:03.000Z"
}
```

## Configuration

### Environment Variables

Set the WebSocket endpoint URL in `.env`:

```bash
# Default: http://localhost:8003 (converted to ws://localhost:8003)
VITE_DYNAMIC_FRONTEND_URL=http://localhost:8003
```

For production with SSL:
```bash
# Automatically converted to wss://
VITE_DYNAMIC_FRONTEND_URL=https://api.aucctus.com
```

### WebSocket Endpoint

The hook connects to:
```
ws://localhost:8003/v1/component/generate-ws
```

Query parameters:
- `query` - Component description (required)
- `max_turns` - Maximum agent turns (optional, default: 100)
- `max_thinking_tokens` - Maximum thinking tokens (optional, default: 20000)
- `file_paths` - JSON array of uploaded file paths (optional)

## Benefits Over HTTP

### HTTP Endpoint (Old)
- Single request/response
- Wait for entire generation to complete
- No progress feedback
- Black box experience

### WebSocket Endpoint (New)
- Real-time streaming
- Live progress updates
- See agent thinking and tool usage
- Better UX and transparency
- Same result format when complete

## Error Handling

The hook handles various error scenarios:

```tsx
const { generate, error, status } = useComponentGeneratorWebSocket();

try {
  await generate({ query: 'Create a button' });
} catch (err) {
  // Error is also available in the error state
  console.error('Generation failed:', error);
}

// Status will be 'error' on failure
if (status === 'error') {
  console.error('WebSocket error:', error?.message);
}
```

## Connection Management

The hook automatically:
- Establishes WebSocket connection
- Handles reconnection on failure
- Cleans up on unmount
- Closes connections when complete

Manual cleanup:
```tsx
const { reset } = useComponentGeneratorWebSocket();

// Reset all state and close connection
reset();
```

## Testing

### Local Development

1. Ensure the backend service is running:
```bash
cd osiris/projects/aucctus-dynamic-frontend
docker-compose up
```

2. Service should be available at `http://localhost:8003`

3. Test WebSocket endpoint:
```bash
# Using wscat
wscat -c "ws://localhost:8003/v1/component/generate-ws?query=Create%20a%20button"

# Using browser console
const ws = new WebSocket('ws://localhost:8003/v1/component/generate-ws?query=Create%20a%20button');
ws.onmessage = (e) => console.log(JSON.parse(e.data));
```

### Browser DevTools

Monitor WebSocket traffic:
1. Open DevTools → Network tab
2. Filter by "WS" (WebSocket)
3. Select the connection
4. View Messages tab for real-time data

## Performance Considerations

### Message Buffering

The GenerationProgress component auto-scrolls to show the latest messages. For very rapid message streams, consider:

```tsx
// Limit displayed messages
<GenerationProgress 
  messages={messages} 
  maxMessages={50}  // Only show last 50
  autoScroll={true}  // Auto-scroll to latest
/>
```

### Memory Management

Messages are stored in state. For very long generation sessions:

```tsx
const displayMessages = useMemo(() => {
  // Only keep recent messages in memory
  return messages.slice(-100);
}, [messages]);
```

## Comparison with HTTP Hook

Both hooks share the same interface for easy switching:

```tsx
// HTTP version (no streaming)
import { useComponentGenerator } from '@hooks/query/dynamicComponent.hook';

// WebSocket version (real-time streaming)
import { useComponentGeneratorWebSocket } from '@hooks/query/dynamicComponentWebSocket.hook';

// Same interface!
const { generate, isLoading, result, messages } = useComponentGenerator();
const { generate, isLoading, result, messages } = useComponentGeneratorWebSocket();
```

The only difference:
- **HTTP**: `messages` array is empty until completion
- **WebSocket**: `messages` array updates in real-time

## Troubleshooting

### Connection Issues

**Problem:** WebSocket fails to connect

**Solution:**
1. Check backend is running: `docker-compose ps`
2. Verify URL: Check `VITE_DYNAMIC_FRONTEND_URL`
3. Check browser console for errors
4. Ensure no firewall blocking port 8003

### No Messages Received

**Problem:** Connection succeeds but no messages appear

**Solution:**
1. Check backend logs: `docker-compose logs -f aucctus-dynamic-frontend`
2. Verify query parameter is not empty
3. Check for backend errors in the generation process

### Slow Performance

**Problem:** UI becomes sluggish during generation

**Solution:**
1. Reduce `maxMessages` in GenerationProgress
2. Add message throttling/debouncing
3. Use `autoScroll={false}` if not needed

## Future Enhancements

Potential improvements:
- [ ] Message filtering by type
- [ ] Pause/resume streaming
- [ ] Export message logs
- [ ] Message search/filtering
- [ ] Progress percentage estimation
- [ ] Reconnection with resume support
- [ ] Authentication token support

## Related Documentation

- [WebSocket Implementation Summary](../../osiris/projects/aucctus-dynamic-frontend/WEBSOCKET_IMPLEMENTATION_SUMMARY.md)
- [WebSocket Integration Guide](../../osiris/projects/aucctus-dynamic-frontend/WEBSOCKET_INTEGRATION.md)
- [Dynamic Component API](./DYNAMIC_COMPONENT_API.md)

## Support

For issues or questions:
- Check backend logs: `docker-compose logs -f aucctus-dynamic-frontend`
- Test WebSocket directly: Use wscat or browser DevTools
- Review component generator messages for errors


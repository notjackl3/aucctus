# WebSocket Connection Logging

## Overview

The WebSocket component generation hook includes comprehensive logging to help debug connection issues, track message flow, and monitor generation progress.

## Logging Format

All WebSocket logs are prefixed with `[WebSocket]` for easy filtering in the browser console.

## Log Events

### Connection Lifecycle

#### 1. Connection Attempt
```
[WebSocket] Connecting to: ws://localhost:8003/v1/component/generate-ws?query=...
```
- Logged when WebSocket connection is initiated
- Includes full URL with query parameters
- Useful for verifying endpoint and parameters

#### 2. Connection Established
```
[WebSocket] Connection established
```
- Logged when WebSocket handshake completes
- Connection is now ready to send/receive messages

#### 3. Streaming Started
```
[WebSocket] Streaming started
```
- Logged when server confirms streaming has begun
- This is after the `connected` event is received

#### 4. Connection Closed
```
[WebSocket] Connection closed: { code: 1000, reason: "", wasClean: true }
```
- Logged when WebSocket connection closes
- Includes:
  - `code` - Close code (1000 = normal)
  - `reason` - Optional close reason
  - `wasClean` - Whether it was a clean close

### Message Flow

#### Message Received
```
[WebSocket] Message received: message thinking
```
- Logged for every WebSocket message
- Format: `[WebSocket] Message received: <event> <type>`
- Event types: `connected`, `message`, `result`, `complete`, `error`
- Message types: `thinking`, `tool_use`, `tool_result`, `text`, `system`, `error`

#### Generation Complete
```
[WebSocket] Generation complete
```
- Logged when component generation finishes successfully

### File Operations

#### File Upload Start
```
[WebSocket] Uploading files: 3
```
- Logged when files are being uploaded (before WebSocket connection)
- Shows number of files

#### File Upload Success
```
[WebSocket] Files uploaded successfully: ["/app/uploads/file1.png", ...]
```
- Logged after successful file upload
- Shows server paths of uploaded files

#### File Upload Failure
```
[WebSocket] File upload failed: Error: ...
```
- Logged if file upload fails
- Includes error details

### Errors

#### Connection Error
```
[WebSocket] Connection error: Event { ... }
```
- Logged when WebSocket connection fails
- Includes error event object

#### Error Event
```
[WebSocket] Error event received: Component generation failed
```
- Logged when server sends error event
- Includes error message from server

#### Parse Error
```
[WebSocket] Failed to parse message: SyntaxError: ...
```
- Logged when received message cannot be parsed as JSON
- Includes parse error details

#### Unexpected Close
```
[WebSocket] Connection closed unexpectedly
```
- Logged when connection closes before generation completes
- Usually indicates a server-side error or network issue

### Cleanup

#### Connection Cleanup
```
[WebSocket] Cleaning up connection
```
- Logged when hook is cleaning up active connection
- Happens on unmount or when starting new generation

## Usage in Browser DevTools

### Filtering Logs

Open Browser Console and filter by `[WebSocket]`:

```javascript
// Chrome/Firefox DevTools
// 1. Open Console (F12 → Console tab)
// 2. In filter box, type: [WebSocket]
```

### Example Log Sequence

A successful generation produces logs like this:

```
[WebSocket] Connecting to: ws://localhost:8003/v1/component/generate-ws?query=Create%20a%20button
[WebSocket] Connection established
[WebSocket] Streaming started
[WebSocket] Message received: message thinking
[WebSocket] Message received: message tool_use
[WebSocket] Message received: message tool_result
[WebSocket] Message received: message text
[WebSocket] Message received: result
[WebSocket] Generation complete
[WebSocket] Connection closed: { code: 1000, reason: "", wasClean: true }
```

### Example with Files

Generation with file uploads:

```
[WebSocket] Uploading files: 2
[WebSocket] Files uploaded successfully: ["/app/uploads/mockup.png", "/app/uploads/schema.json"]
[WebSocket] Connecting to: ws://localhost:8003/v1/component/generate-ws?query=...&file_paths=%5B...%5D
[WebSocket] Connection established
[WebSocket] Streaming started
...
```

### Example Error

Connection failure:

```
[WebSocket] Connecting to: ws://localhost:8003/v1/component/generate-ws?query=...
[WebSocket] Connection error: Event { type: "error", ... }
```

## Debugging with Logs

### Common Issues

#### 1. Connection Refused

**Symptoms:**
```
[WebSocket] Connecting to: ws://localhost:8003/...
[WebSocket] Connection error: ...
```

**Causes:**
- Backend service not running
- Wrong port/URL
- Firewall blocking connection

**Solutions:**
```bash
# Check if service is running
docker-compose ps

# Start service
docker-compose up aucctus-dynamic-frontend

# Verify health
curl http://localhost:8003/v1/health
```

#### 2. No Messages Received

**Symptoms:**
```
[WebSocket] Connection established
[WebSocket] Streaming started
# ... no more logs ...
```

**Causes:**
- Backend error (check backend logs)
- Empty query
- Repository not cloned in backend

**Solutions:**
```bash
# Check backend logs
docker-compose logs -f aucctus-dynamic-frontend

# Look for Python errors or exceptions
```

#### 3. Parse Errors

**Symptoms:**
```
[WebSocket] Failed to parse message: SyntaxError: ...
```

**Causes:**
- Backend sending invalid JSON
- Message format mismatch
- Backend version mismatch

**Solutions:**
- Check backend version
- Look at raw WebSocket messages in DevTools Network tab
- Update backend to latest version

#### 4. Unexpected Close

**Symptoms:**
```
[WebSocket] Connection closed unexpectedly
```

**Causes:**
- Backend crashed
- Timeout
- Network interruption
- Backend error during generation

**Solutions:**
```bash
# Check backend logs for errors
docker-compose logs -f aucctus-dynamic-frontend | grep -i error

# Check backend container status
docker-compose ps
```

## Advanced Debugging

### Network Tab Inspection

For detailed WebSocket inspection:

1. Open DevTools (F12)
2. Go to **Network** tab
3. Filter by **WS** (WebSocket)
4. Click on the WebSocket connection
5. View **Messages** tab

You'll see:
- ⬆️ Outgoing: Connection request
- ⬇️ Incoming: All server messages with timestamps

### Console Logging

To see full message content:

```javascript
// In browser console
// Set verbose logging (temporary)
localStorage.setItem('ws_verbose', 'true');

// Then in hook, add:
if (localStorage.getItem('ws_verbose') === 'true') {
    console.log('[WebSocket] Full message:', message);
}
```

### Performance Monitoring

Track message timing:

```javascript
// In browser console after generation
performance.getEntriesByType('resource')
    .filter(e => e.name.includes('ws://'))
    .forEach(e => console.log('Duration:', e.duration, 'ms'));
```

## Production Considerations

### Log Levels

For production, consider adding log levels:

```typescript
const LOG_LEVEL = import.meta.env.VITE_WS_LOG_LEVEL || 'info';

const log = {
    debug: (msg: string) => LOG_LEVEL === 'debug' && console.log(msg),
    info: (msg: string) => ['debug', 'info'].includes(LOG_LEVEL) && console.log(msg),
    error: (msg: string) => console.error(msg),
};
```

### Disable Logs in Production

Set environment variable:

```bash
# .env.production
VITE_WS_LOG_LEVEL=error
```

Then only errors will be logged.

### Structured Logging

For better monitoring, use structured logs:

```typescript
console.log('[WebSocket]', {
    event: 'connection_established',
    timestamp: Date.now(),
    url: url,
});
```

This makes logs easier to parse and analyze.

## Monitoring & Analytics

### Track Connection Success Rate

```typescript
let connectionAttempts = 0;
let connectionSuccesses = 0;

// On connect attempt
connectionAttempts++;

// On connect success
connectionSuccesses++;

console.log('Success rate:', (connectionSuccesses / connectionAttempts * 100).toFixed(1) + '%');
```

### Track Generation Duration

```typescript
const startTime = Date.now();

// On complete
const duration = Date.now() - startTime;
console.log('[WebSocket] Total duration:', duration, 'ms');
```

### Track Message Count

```typescript
let messageCount = 0;

// On each message
messageCount++;
console.log('[WebSocket] Messages received:', messageCount);
```

## Log Retention

Browser consoles typically retain:
- Chrome: Last 100,000 messages
- Firefox: Last 1,000 messages
- Safari: Last 500 messages

To preserve logs:
1. Right-click in console
2. Select "Save as..."
3. Save to file for later analysis

## Related Tools

### WebSocket Testing Tools

**wscat** - Command line WebSocket client:
```bash
npm install -g wscat
wscat -c "ws://localhost:8003/v1/component/generate-ws?query=test"
```

**websocat** - Advanced WebSocket tool:
```bash
brew install websocat  # macOS
websocat "ws://localhost:8003/v1/component/generate-ws?query=test"
```

### Browser Extensions

- **WebSocket King** (Chrome) - WebSocket debugging
- **WebSocket Waesel** (Firefox) - WebSocket monitoring
- **Smart WebSocket Client** (Cross-browser) - Testing tool

## Summary

The WebSocket hook now includes comprehensive logging for:
- ✅ Connection lifecycle (connect, open, close)
- ✅ Message flow (all events and message types)
- ✅ File uploads (progress and results)
- ✅ Errors (connection, parsing, unexpected closes)
- ✅ Cleanup operations

All logs use `[WebSocket]` prefix for easy filtering, making it simple to debug issues and monitor generation progress.

## Quick Reference

| Log | Meaning |
|-----|---------|
| `Connecting to:` | WebSocket connection starting |
| `Connection established` | Handshake complete |
| `Streaming started` | Server ready to send messages |
| `Message received:` | New message from server |
| `Generation complete` | Success! |
| `Connection closed:` | Connection ended (check wasClean) |
| `Connection error:` | Failed to connect |
| `Error event received:` | Server reported error |
| `Failed to parse message:` | Invalid message format |
| `Cleaning up connection` | Hook is closing connection |

---

**Pro Tip:** Open Console before starting generation to see all logs from the beginning!


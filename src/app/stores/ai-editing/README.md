# AI Editing Store

This store manages the AI editing conversation state and provides automatic cleanup functionality.

## Auto-Clear Functionality

The AI editing conversation will automatically clear in the following scenarios:

### 1. User Logout
When a user logs out (access token is removed), the conversation will be cleared and the current message will be reset.

### 2. Concept Change
When the active concept changes (conceptUuid changes to a different non-undefined value), the conversation will be cleared but the current message will be preserved.

## Implementation

The auto-clear functionality is implemented using Zustand's `subscribeWithSelector` middleware and is automatically initialized at the application level in `App.tsx`.

### Actions

- `initializeListeners()`: Sets up store subscriptions and returns a cleanup function
- `clearConversation(resetCurrentMessage?: boolean)`: Manually clear the conversation

### State Monitored

- `auth.access`: Monitored for logout detection
- `conceptReport.conceptUuid`: Monitored for concept changes

### Logging

All auto-clear events are logged via telemetry for debugging purposes:

- `AI Editing: Clearing conversation due to logout`
- `AI Editing: Clearing conversation due to concept change`

## Usage

The auto-clear functionality is automatically initialized when the application starts in `App.tsx` and remains active throughout the app lifecycle. No additional setup is required - the listeners will automatically clear the AI editing conversation when:

1. A user logs out
2. The active concept changes

This ensures that conversations are always properly cleaned up regardless of how the state changes occur. 
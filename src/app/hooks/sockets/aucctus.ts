import api from '@libs/api';
import { SocketService } from '@libs/api/base';
import { InboundSocketEvent, InboundSocketEventType } from '@libs/api/types';
import telemetry from '@libs/telemetry';
import useStore from '@stores/store';
import React from 'react';

function isSocketEventOfType<
  T extends InboundSocketEventType,
  C extends object,
>(
  data: InboundSocketEvent<C>,
  type: T,
): data is Extract<InboundSocketEvent<C>, { type: T }> {
  return data.type === type;
}

/**
 * Validates that a websocket message is intended for the current user and account
 * @param message The websocket message to validate
 * @param currentAccountUuid The current user's account UUID
 * @param currentUserUuid The current user's UUID
 * @returns true if the message is valid for this user/account, false otherwise
 */
function validateMessageMultitenancy(
  message: any,
  currentAccountUuid?: string,
  currentUserUuid?: string,
): boolean {
  // If the message doesn't have account_uuid or user_uuid, allow it (backward compatibility)
  if (!message.account_uuid && !message.user_uuid) {
    return true;
  }

  // If we don't have current user/account info, reject the message
  if (!currentAccountUuid || !currentUserUuid) {
    telemetry.log('websocket.security.multitenancy.validation.failed', {
      reason: 'missing_current_user_info',
      messageType: message.type,
      hasMessageAccountUuid: !!message.account_uuid,
      hasMessageUserUuid: !!message.user_uuid,
    });
    return false;
  }

  // Validate account UUID
  if (message.account_uuid && message.account_uuid !== currentAccountUuid) {
    telemetry.log('websocket.security.multitenancy.validation.failed', {
      reason: 'account_uuid_mismatch',
      messageType: message.type,
      messageAccountUuid: message.account_uuid,
      currentAccountUuid,
    });
    return false;
  }

  // Validate user UUID
  if (message.user_uuid && message.user_uuid !== currentUserUuid) {
    telemetry.log('websocket.security.multitenancy.validation.failed', {
      reason: 'user_uuid_mismatch',
      messageType: message.type,
      messageUserUuid: message.user_uuid,
      currentUserUuid,
    });
    return false;
  }

  return true;
}

/**
 * Custom hook to listen for a specific event type from the WebSocket.
 * @param eventName The event "type" to filter for.
 * @param callback Function to call when an event with the matching type is received.
 *
 * ... Its annoying and redundant, but if you need to specify the type of K (So in cases like the stream.structured)
 * you have to specify T/SocketEventType which is a little redundant
 */
export function useSocketEvent<
  T extends InboundSocketEventType,
  C extends object = {},
>(
  eventName: T,
  callback: (data: Extract<InboundSocketEvent<C>, { type: T }>) => void,
) {
  const savedCallback = React.useCallback(callback, [callback]);

  // State counter that increments when WebSocket instance changes
  const [wsInstanceCounter, setWsInstanceCounter] = React.useState(0);

  // Listen for WebSocket instance changes from SocketService
  React.useEffect(() => {
    if (!api.aucctusSocket) return;

    const handleWsInstanceChange = () => {
      setWsInstanceCounter((prev) => prev + 1);
    };

    api.aucctusSocket.addWsInstanceChangeListener(handleWsInstanceChange);

    return () => {
      api.aucctusSocket?.removeWsInstanceChangeListener(handleWsInstanceChange);
    };
  }, []); // Only run once on mount

  // Main effect that handles WebSocket message listening
  React.useEffect(() => {
    if (!api.aucctusSocket || !api.aucctusSocket.ws) return;

    const handleIncoming = (e: MessageEvent) => {
      try {
        const data: InboundSocketEvent<C> = JSON.parse(e.data);
        if (isSocketEventOfType<T, C>(data, eventName)) {
          // Get current user and account info for validation
          const currentUser = useStore.getState().auth.user;
          const currentAccount = useStore.getState().auth.account;

          // Validate multitenancy
          if (
            !validateMessageMultitenancy(
              data,
              currentAccount?.uuid,
              currentUser?.uuid,
            )
          ) {
            return; // Reject the message
          }

          savedCallback(data as Extract<InboundSocketEvent<C>, { type: T }>);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error parsing WebSocket message:', error);
      }
    };

    api.aucctusSocket.ws.addEventListener('message', handleIncoming);
    return () => {
      api.aucctusSocket.ws?.removeEventListener('message', handleIncoming);
    };
  }, [eventName, savedCallback, wsInstanceCounter]);
}

export function useSocketMaxRetriesExceeded(
  socketService: SocketService,
): Error | null {
  const [error, setError] = React.useState<Error | null>(null);

  React.useEffect(() => {
    if (!socketService) return;

    const listener = (err: Error) => {
      setError(err);
    };

    socketService.addMaxRetriesExceededListener(listener);

    return () => {
      socketService.removeMaxRetriesExceededListener(listener);
    };
  }, [socketService]);

  return error;
}

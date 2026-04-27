import api from '@libs/api';
import { InboundSocketEvent, InboundSocketEventType } from '@libs/api/types';
import telemetry from '@libs/telemetry';
import useStore from '@stores/store';
import React from 'react';

/**
 * Validates that a websocket message is intended for the current user and account.
 * This is called once per message in the central dispatcher (socketService.ts),
 * NOT per-listener, eliminating redundant validation.
 */
export function validateMessageMultitenancy(
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
 * Uses the central message dispatcher in SocketService for O(1) message routing
 * instead of N independent addEventListener calls.
 *
 * @param eventName The event "type" to filter for.
 * @param callback Function to call when an event with the matching type is received.
 */
export function useSocketEvent<
  T extends InboundSocketEventType,
  C extends object = {},
>(
  eventName: T,
  callback: (data: Extract<InboundSocketEvent<C>, { type: T }>) => void,
) {
  const savedCallback = React.useRef(callback);

  // Update the ref whenever callback changes, but don't trigger re-subscription
  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Subscribe to the central dispatcher — handles reconnection automatically
  React.useEffect(() => {
    if (!api.aucctusSocket) return;

    const handler = (data: any) => {
      // Multitenancy validation (done once per message type match)
      const currentUser = useStore.getState().auth.user;
      const currentAccount = useStore.getState().auth.account;

      if (
        !validateMessageMultitenancy(
          data,
          currentAccount?.uuid,
          currentUser?.uuid,
        )
      ) {
        return;
      }

      savedCallback.current(
        data as Extract<InboundSocketEvent<C>, { type: T }>,
      );
    };

    const unsubscribe = api.aucctusSocket.subscribe(eventName, handler);

    return unsubscribe;
  }, [eventName]);
}

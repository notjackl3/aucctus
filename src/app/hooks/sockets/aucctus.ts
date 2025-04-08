import api from '@libs/api';
import { SocketService } from '@libs/api/base';
import { InboundSocketEvent, InboundSocketEventType } from '@libs/api/types';
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

  React.useEffect(() => {
    if (!api.aucctusSocket || !api.aucctusSocket.ws) return;

    const handleIncoming = (e: MessageEvent) => {
      try {
        const data: InboundSocketEvent<C> = JSON.parse(e.data);
        if (isSocketEventOfType<T, C>(data, eventName)) {
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
  }, [eventName, savedCallback]);
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

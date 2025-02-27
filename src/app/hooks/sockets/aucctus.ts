import api from '@libs/api';
import { SocketService } from '@libs/api/base';
import React from 'react';

/**
 * Custom hook to listen for a specific event type from the WebSocket.
 * @param eventName The event "type" to filter for.
 * @param callback Function to call when an event with the matching type is received.
 */
export function useSocketEvent<T extends SocketEventType>(
  eventName: T,
  callback: (data: Extract<SocketEvent, { type: T }>) => void,
) {
  const aucctusSocket = React.useMemo(() => api.aucctusSocket, []);

  // Create a stable callback reference.
  const savedCallback = React.useCallback(callback, [callback]);

  React.useEffect(() => {
    if (!aucctusSocket || !aucctusSocket.ws) return;

    const handleIncoming = (e: MessageEvent) => {
      try {
        const data: SocketEvent = JSON.parse(e.data);
        if (data.type === eventName) {
          savedCallback(data as Extract<SocketEvent, { type: T }>);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    aucctusSocket.ws.addEventListener('message', handleIncoming);
    return () => {
      aucctusSocket.ws?.removeEventListener('message', handleIncoming);
    };
  }, [aucctusSocket, eventName, savedCallback]);
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
  }, []);

  return error;
}

import { useSocket } from '@context/SocketContext';
import { useCallback, useEffect } from 'react';

/**
 * Custom hook to listen for a specific event type from the WebSocket.
 * @param eventName The event "type" to filter for.
 * @param callback Function to call when an event with the matching type is received.
 */
export function useSocketEvent(
  eventName: SocketEventType,
  callback: (data: SocketEvent) => void,
) {
  const { aucctusSocket } = useSocket(); // your context hook that exposes your SocketService

  // Create a stable callback reference.
  const savedCallback = useCallback(callback, [callback]);

  useEffect(() => {
    if (!aucctusSocket || !aucctusSocket.ws) return;

    const handleIncoming = (e: MessageEvent) => {
      try {
        const data: SocketEvent = JSON.parse(e.data);
        // Filter by event type
        if (data.type === eventName) {
          savedCallback(data);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    // Attach the event listener to the underlying WebSocket instance.
    aucctusSocket.ws.addEventListener('message', handleIncoming);

    // Clean up when the component unmounts or dependencies change.
    return () => {
      aucctusSocket.ws?.removeEventListener('message', handleIncoming);
    };
  }, [aucctusSocket, eventName, savedCallback]);
}

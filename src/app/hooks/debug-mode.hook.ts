import React from 'react';
import useStore from '@stores/store';
import { toast } from '@components';

// Main hook for global debug mode functionality
export const useDebugModeListener = () => {
  const isDebugModeEnabled = useStore(
    (state) => state.debugMode.isDebugModeEnabled,
  );
  const toggleDebugMode = useStore((state) => state.debugMode.toggleDebugMode);

  React.useEffect(() => {
    let keySequence = '';
    let shiftPressed = false;
    let sequenceTimeout: NodeJS.Timeout;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.shiftKey && !shiftPressed) {
        shiftPressed = true;
        keySequence = '';
      }

      if (shiftPressed && e.key.length === 1) {
        keySequence += e.key.toLowerCase();

        // Clear sequence after 2 seconds of inactivity
        clearTimeout(sequenceTimeout);
        sequenceTimeout = setTimeout(() => {
          keySequence = '';
        }, 2000);

        // Check if "debug" has been typed
        if (keySequence.includes('debug')) {
          e.preventDefault();

          // Toggle the debug mode
          const newState = !isDebugModeEnabled;
          toggleDebugMode();

          if (newState) {
            toast.success(
              '🐛 Debug Mode activated! Developer features enabled.',
              undefined,
              3000,
            );
          } else {
            toast.success('🐛 Debug Mode disabled.', undefined, 2000);
          }

          // Reset sequence
          keySequence = '';
          shiftPressed = false;
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.shiftKey) {
        shiftPressed = false;
        keySequence = '';
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      clearTimeout(sequenceTimeout);
    };
  }, [isDebugModeEnabled, toggleDebugMode]);

  return { isDebugModeEnabled };
};

// Simplified hook for components that need debug mode functionality
export const useDebugMode = () => {
  // Only return true in development
  const isDebugModeEnabled = useStore(
    (state) => state.debugMode.isDebugModeEnabled,
  );

  return isDebugModeEnabled;
};

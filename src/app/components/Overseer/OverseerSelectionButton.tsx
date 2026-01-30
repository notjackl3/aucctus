import useStore from '@stores/store';
import { motion, AnimatePresence } from 'framer-motion';
import React from 'react';
import { createPortal } from 'react-dom';

/**
 * A small button that appears when text is selected
 * Clicking it opens the Overseer chat with the selected text
 */
const OverseerSelectionButton: React.FC = () => {
  const showingSelectionButton = useStore(
    (state) => state.overseer.showingSelectionButton,
  );
  const pendingSelection = useStore((state) => state.overseer.pendingSelection);
  const confirmSelection = useStore((state) => state.overseer.confirmSelection);

  if (!showingSelectionButton || !pendingSelection) {
    return null;
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Clear the text selection
    window.getSelection()?.removeAllRanges();
    confirmSelection();
  };

  const buttonContent = (
    <AnimatePresence>
      <motion.button
        data-overseer-button='true'
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        onClick={handleClick}
        className='fixed z-[10000] flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-1.5 text-sm font-medium text-white shadow-lg transition-colors hover:bg-black'
        style={{
          left: pendingSelection.buttonPosition.x,
          top: pendingSelection.buttonPosition.y,
        }}
      >
        <svg
          width='14'
          height='14'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <circle cx='12' cy='12' r='10' />
          <path d='M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3' />
          <path d='M12 17h.01' />
        </svg>
        Ask Overseer
      </motion.button>
    </AnimatePresence>
  );

  return createPortal(buttonContent, document.body);
};

export default OverseerSelectionButton;

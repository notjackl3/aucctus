import NavLogo from '@assets/aucctus_logo.png';
import useStore from '@stores/store';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';
import { createPortal } from 'react-dom';

/**
 * A pill-shaped tooltip that appears centered above text selection
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
    window.getSelection()?.removeAllRanges();
    confirmSelection();
  };

  const buttonContent = (
    <AnimatePresence>
      <motion.button
        data-overseer-button='true'
        initial={{ opacity: 0, scale: 0.9, y: 4 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 4 }}
        transition={{ duration: 0.15, ease: 'easeOut' }}
        onClick={handleClick}
        className='fixed z-[10000] flex items-center gap-2 rounded-full bg-[#1a1a1a] px-3.5 py-2 text-sm font-medium text-white shadow-xl ring-1 ring-white/10 transition-colors hover:bg-[#252525]'
        style={{
          left: pendingSelection.buttonPosition.x,
          top: pendingSelection.buttonPosition.y,
          transform: 'translateX(-50%)',
        }}
      >
        <img src={NavLogo} alt='Aucctus' className='h-4 w-4' />
        Ask Aucctus
      </motion.button>
    </AnimatePresence>
  );

  return createPortal(buttonContent, document.body);
};

export default OverseerSelectionButton;

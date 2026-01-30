import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import React from 'react';

interface OverseerThinkingIndicatorProps {
  message?: string;
  centered?: boolean;
}

/**
 * Thinking/loading indicator for Overseer
 * Features both inline and centered variants
 */
const OverseerThinkingIndicator: React.FC<OverseerThinkingIndicatorProps> = ({
  message = 'Thinking...',
  centered = false,
}) => {
  if (centered) {
    return (
      <div className='flex h-full flex-col items-center justify-center py-6'>
        <Loader2 className='mb-3 h-5 w-5 animate-spin stroke-white/80' />
        <p className='aucctus-text-sm text-white/60'>{message}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      className='flex items-center gap-2 text-white/60'
    >
      <Loader2 className='h-3.5 w-3.5 animate-spin stroke-current' />
      <span className='aucctus-text-sm'>{message}</span>
    </motion.div>
  );
};

export default OverseerThinkingIndicator;

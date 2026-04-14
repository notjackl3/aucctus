import { cn } from '@libs/utils/react';
import { motion } from 'framer-motion';
import { AlertTriangle, Radar, RefreshCw, X } from 'lucide-react';
import React, { useState } from 'react';

export const ScanProgressBanner: React.FC<{
  stage: string;
  progress: number;
  message: string;
  currentJob?: string;
}> = ({ progress, message, currentJob }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const displayText = currentJob ? `Analyzing: ${currentJob}` : message;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className='mx-auto flex w-full max-w-md items-center gap-3 rounded-full border border-white/[0.08] bg-black/60 px-4 py-2 backdrop-blur-xl'
    >
      <Radar className='h-4 w-4 shrink-0 animate-pulse text-emerald-400' />
      <div className='relative min-w-0 flex-1'>
        <div className='flex items-center gap-2'>
          <span
            className='truncate text-xs font-medium text-white/80'
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          >
            {displayText}
          </span>
          <span className='shrink-0 text-[10px] tabular-nums text-white/40'>
            {Math.round(progress)}%
          </span>
        </div>
        {showTooltip && displayText.length > 40 && (
          <div className='absolute bottom-full left-0 z-50 mb-2 max-w-sm rounded-lg border border-white/[0.1] bg-black/90 px-3 py-2 text-[11px] leading-relaxed text-white/80 shadow-xl backdrop-blur-xl'>
            {displayText}
          </div>
        )}
        <div className='mt-1 h-1 w-full rounded-full bg-white/[0.08]'>
          <motion.div
            className='h-1 rounded-full bg-emerald-400'
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export const ScanFailureBanner: React.FC<{
  errorMessage?: string;
  onRetry: () => void;
  isRetrying: boolean;
  onDismiss: () => void;
}> = ({ errorMessage, onRetry, isRetrying, onDismiss }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: 8 }}
    className='mx-auto flex w-full max-w-md items-center gap-3 rounded-full border border-red-500/15 bg-black/60 px-4 py-2 backdrop-blur-xl'
  >
    <AlertTriangle className='h-4 w-4 shrink-0 text-red-400' />
    <span className='min-w-0 truncate text-xs font-medium text-red-300'>
      {errorMessage || 'Last scan failed'}
    </span>
    <div className='ml-auto flex shrink-0 items-center gap-1.5'>
      <button
        onClick={onRetry}
        disabled={isRetrying}
        className='flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] font-semibold text-red-300 transition-all hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50'
      >
        <RefreshCw className={cn('h-3 w-3', isRetrying && 'animate-spin')} />
        {isRetrying ? '...' : 'Retry'}
      </button>
      <button
        onClick={onDismiss}
        className='rounded-full p-1 text-red-300/40 transition-colors hover:text-red-300/60'
      >
        <X className='h-3.5 w-3.5' />
      </button>
    </div>
  </motion.div>
);

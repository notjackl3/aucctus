import { cn } from '@libs/utils/react';
import * as Popover from '@radix-ui/react-popover';
import { AnimatePresence, motion } from 'framer-motion';
import { Clock, RefreshCw, X } from 'lucide-react';
import React, { useState } from 'react';

import {
  useWatchtowerScanHistory,
  type WatchtowerScanProgress,
} from '@hooks/query/watchtower.hook';

interface SignalHistoryPopoverProps {
  lastUpdated: Date;
  isScanningActive: boolean;
  scanProgress: WatchtowerScanProgress;
  onRefresh: () => void;
  selectedScanUuid: string | null;
  onSelectScan: (scanUuid: string | null) => void;
}

const formatScanDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

const formatShortDate = (isoDate: string): string => {
  const date = new Date(isoDate);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

const SignalHistoryPopover: React.FC<SignalHistoryPopoverProps> = ({
  lastUpdated,
  isScanningActive,
  scanProgress,
  onRefresh,
  selectedScanUuid,
  onSelectScan,
}) => {
  const [open, setOpen] = useState(false);
  const { scans } = useWatchtowerScanHistory();

  const isViewingHistorical = selectedScanUuid !== null;

  // Find the selected scan to show its date
  const selectedScan = isViewingHistorical
    ? scans.find((s) => s.uuid === selectedScanUuid)
    : null;

  const handleSelectScan = (scanUuid: string) => {
    // If selecting the most recent scan (first in list), go back to "current" view
    if (scans.length > 0 && scans[0].uuid === scanUuid) {
      onSelectScan(null);
    } else {
      onSelectScan(scanUuid);
    }
    setOpen(false);
  };

  const handleReturnToCurrent = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectScan(null);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <motion.div
          className={cn(
            'absolute bottom-6 left-6 z-10 inline-flex cursor-pointer select-none items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-md transition-all duration-200',
            isViewingHistorical
              ? 'border-amber-400/40 bg-amber-500/20 hover:bg-amber-500/30'
              : 'border-white/20 bg-white/10 hover:border-white/30 hover:bg-white/15',
          )}
          title='Signal History'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4, ease: 'easeOut' }}
        >
          <Clock size={14} className='stroke-white/60' />
          {isScanningActive ? (
            <span className='text-white'>
              {scanProgress.message || 'Scanning...'}
              {scanProgress.progress > 0 && ` (${scanProgress.progress}%)`}
            </span>
          ) : isViewingHistorical && selectedScan ? (
            <span className='text-white'>
              Viewing: {formatShortDate(selectedScan.scannedAt)}
            </span>
          ) : (
            <span className='text-white'>
              {lastUpdated.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          )}
          {isViewingHistorical ? (
            <button
              onClick={handleReturnToCurrent}
              className='-mr-1 rounded-full p-0.5 text-white/60 transition-colors hover:bg-white/15 hover:text-white'
              title='Return to latest scan'
            >
              <X size={12} className='stroke-current' />
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRefresh();
              }}
              disabled={isScanningActive}
              className={cn(
                '-mr-1 rounded-full p-0.5 transition-colors',
                isScanningActive
                  ? 'cursor-not-allowed text-white/40'
                  : 'text-white/60 hover:bg-white/15 hover:text-white',
              )}
              title='Refresh signals'
            >
              <RefreshCw
                size={12}
                className={cn(
                  'stroke-current',
                  isScanningActive && 'animate-spin',
                )}
              />
            </button>
          )}
        </motion.div>
      </Popover.Trigger>

      <AnimatePresence>
        {open && (
          <Popover.Portal forceMount>
            <Popover.Content
              side='top'
              align='start'
              sideOffset={8}
              asChild
              forceMount
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 4 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
                className='z-50 w-44 rounded-lg border border-white/15 bg-black/95 p-0 shadow-xl backdrop-blur-md'
              >
                <div className='max-h-64 overflow-y-auto py-1'>
                  {scans.length === 0 ? (
                    <div className='px-3 py-2 text-xs text-white/40'>
                      No scan history
                    </div>
                  ) : (
                    scans.map((scan, index) => (
                      <button
                        key={scan.uuid}
                        onClick={() => handleSelectScan(scan.uuid)}
                        className={cn(
                          'w-full px-3 py-1.5 text-left text-xs transition-colors',
                          scan.uuid === selectedScanUuid ||
                            (!selectedScanUuid && index === 0)
                            ? 'bg-white/10 text-white'
                            : 'text-white/70 hover:bg-white/10 hover:text-white',
                        )}
                      >
                        {formatScanDate(scan.scannedAt)}
                        {index === 0 && (
                          <span className='ml-1.5 text-white/30'>(latest)</span>
                        )}
                      </button>
                    ))
                  )}
                </div>
              </motion.div>
            </Popover.Content>
          </Popover.Portal>
        )}
      </AnimatePresence>
    </Popover.Root>
  );
};

export default SignalHistoryPopover;

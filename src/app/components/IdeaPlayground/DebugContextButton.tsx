import React, { useState, useCallback } from 'react';
import { toast } from '@components';
import { useDebugMode } from '@hooks/debug-mode.hook';
import api from '@libs/api';
import { cn } from '@libs/utils/react';
import { Clipboard, Loader2 } from 'lucide-react';

interface DebugContextButtonProps {
  seedUuid: string | null;
  className?: string;
}

/**
 * Debug button that copies seed context to clipboard
 * Only visible when debug mode is enabled (Shift + type "debug")
 */
const DebugContextButton: React.FC<DebugContextButtonProps> = ({
  seedUuid,
  className,
}) => {
  const isDebugMode = useDebugMode();
  const [isLoading, setIsLoading] = useState(false);

  const handleCopyContext = useCallback(async () => {
    if (!seedUuid) {
      toast.error('No seed UUID available');
      return;
    }

    setIsLoading(true);
    try {
      const context = await api.ideaPlayground.getSeedContext(seedUuid);

      // Format the context as a readable JSON string
      const formattedContext = JSON.stringify(context, null, 2);

      await navigator.clipboard.writeText(formattedContext);
      toast.success('Context copied to clipboard!', undefined, 2000);
    } catch {
      toast.error('Failed to fetch context');
    } finally {
      setIsLoading(false);
    }
  }, [seedUuid]);

  // Only show in debug mode
  if (!isDebugMode) {
    return null;
  }

  return (
    <button
      onClick={handleCopyContext}
      disabled={isLoading || !seedUuid}
      className={cn(
        'flex items-center gap-1.5 rounded-md px-2 py-1',
        'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30',
        'border border-amber-500/30',
        'aucctus-text-xs-medium',
        'transition-all duration-200',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      title='Copy seed context to clipboard (Debug)'
    >
      {isLoading ? (
        <Loader2 className='aucctus-stroke-warning-primary h-3.5 w-3.5 animate-spin' />
      ) : (
        <Clipboard className='aucctus-stroke-warning-primary h-3.5 w-3.5' />
      )}
      <span>Copy Context</span>
    </button>
  );
};

export default React.memo(DebugContextButton);

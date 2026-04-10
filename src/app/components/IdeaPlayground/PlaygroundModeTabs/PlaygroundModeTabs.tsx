import { cn } from '@libs/utils/react';
import { motion } from 'framer-motion';
import { Lightbulb, Puzzle } from 'lucide-react';
import React from 'react';

type PlaygroundMode = 'playground' | 'jtbd';

interface PlaygroundModeTabsProps {
  activeMode: PlaygroundMode;
  onModeChange: (mode: PlaygroundMode) => void;
  showJTBD: boolean;
  className?: string;
}

const MODES = [
  { id: 'playground' as const, label: 'Idea Mode', icon: Lightbulb },
  { id: 'jtbd' as const, label: 'Jobs to Be Done', icon: Puzzle },
];

export const PlaygroundModeTabs: React.FC<PlaygroundModeTabsProps> = ({
  activeMode,
  onModeChange,
  showJTBD,
  className,
}) => {
  if (!showJTBD) return null;

  return (
    <div
      className={cn(
        'flex items-center gap-0.5 rounded-full border border-white/20 bg-white/10 p-1 backdrop-blur-md',
        className,
      )}
    >
      {MODES.map((mode) => {
        const Icon = mode.icon;
        const isActive = activeMode === mode.id;

        return (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={cn(
              'relative flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
              isActive ? 'text-white' : 'text-white/50 hover:text-white/70',
            )}
          >
            {isActive && (
              <motion.div
                layoutId='playground-mode-pill'
                className='absolute inset-0 rounded-full bg-white/15'
                transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              />
            )}
            <Icon className='relative z-10 h-3.5 w-3.5' />
            <span className='relative z-10'>{mode.label}</span>
          </button>
        );
      })}
    </div>
  );
};

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@libs/utils/react';

/**
 * CategoryPill Component
 * Displays progress status for a single category with animated progress bar
 * Matches the glassmorphic style of completed pills in NucleusPage
 */
const CategoryPill: React.FC<{ progress: number; name: string }> = ({
  progress,
  name,
}) => {
  return (
    <>
      <style>{`
        @keyframes shimmer-pill {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(30deg);
          }
          100% {
            transform: translateX(100%) translateY(100%) rotate(30deg);
          }
        }

        .pill-shimmer-effect::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            60deg,
            transparent 0%,
            transparent 20%,
            rgba(255, 255, 255, 0.05) 30%,
            rgba(255, 255, 255, 0.3) 50%,
            rgba(255, 255, 255, 0.10) 70%,
            transparent 80%,
            transparent 100%
          );
          animation: shimmer-pill ease-in-out 5s infinite;
          pointer-events: none;
        }
      `}</style>
      <div
        className={cn(
          'relative flex min-h-[40px] min-w-[140px] items-center overflow-hidden rounded-full px-4 py-2.5',
          'border border-white/20 bg-white/10 shadow-lg backdrop-blur-md',
          'transition-all duration-300 hover:scale-105 hover:border-white/30 hover:bg-white/15',
        )}
        style={{
          // Add a subtle shadow to ensure visibility
          boxShadow:
            '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
        }}
      >
        {/* Progress fill background */}
        <motion.div
          initial={{ width: '0%' }}
          animate={{ width: `${progress}%` }}
          transition={{
            duration: 1,
            ease: [0.33, 1, 0.68, 1], // cubic-bezier easeOut approximation
          }}
          className={cn(
            'pill-shimmer-effect absolute inset-y-0 left-0 overflow-hidden rounded-l-full',
            'bg-white/30',
          )}
        />

        {/* Content */}
        <div className='relative z-10 flex items-center gap-2'>
          <span
            className='aucctus-text-sm-medium text-white drop-shadow-sm'
            style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}
          >
            {name}
          </span>
          <span
            className='aucctus-text-sm-bold text-white drop-shadow-sm'
            style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}
          >
            {progress}%
          </span>
        </div>
      </div>
    </>
  );
};

export default CategoryPill;

import React from 'react';
import { cn } from '@libs/utils/react';

interface SkeletonBlockProps {
  className?: string;
  backgroundClassName?: string;
}

/**
 * Lightweight skeleton block that uses the Aucctus design tokens.
 * Provides a consistent base for all concept report skeletons.
 */
const SkeletonBlock: React.FC<SkeletonBlockProps> = ({
  className,
  backgroundClassName = 'aucctus-bg-secondary-subtle',
}) => {
  return (
    <>
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%) translateY(-100%) rotate(30deg);
          }
          100% {
            transform: translateX(100%) translateY(100%) rotate(30deg);
          }
        }

        .skeleton-shimmer {
          position: relative;
          overflow: hidden;
        }

        .skeleton-shimmer::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            60deg,
            transparent 0%,
            transparent 30%,
            rgba(255, 255, 255, 0.15) 30%,
            rgba(255, 255, 255, 0.7) 50%,
            rgba(255, 255, 255, 0.15) 70%,
            transparent 80%,
            transparent 100%
          );
          animation: shimmer ease-in-out 5s infinite;
          pointer-events: none;
        }
      `}</style>
      <div
        aria-hidden='true'
        className={cn(
          backgroundClassName,
          'skeleton-shimmer rounded',
          className,
        )}
      />
    </>
  );
};

export default SkeletonBlock;

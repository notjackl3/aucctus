import React, { useState, useEffect, useRef, useMemo } from 'react';
import { LogoAnimation } from '@components';

interface ConceptGenerationLoadingProps {
  /**
   * Optional className for positioning
   */
  className?: string;
}

/**
 * Fun generation messages that appear in glassmorphic bubbles around the logo
 */
const GENERATION_MESSAGES = [
  'Brewing brilliant concepts',
  'Connecting innovation dots',
  'Crafting breakthrough ideas',
  'Synthesizing insights',
  'Discovering opportunities',
  'Mapping future landscape',
];

/**
 * Fisher-Yates shuffle for randomizing reveal order
 */
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Calculate asymptotic progress that approaches 100% but never quite reaches it
 * Uses exponential decay formula: progress = 100 * (1 - e^(-t/tau))
 * At t=45s, we should be around 95%
 */
const calculateAsymptoticProgress = (elapsedSeconds: number): number => {
  const tau = 15;
  const progress = 100 * (1 - Math.exp(-elapsedSeconds / tau));
  return Math.min(98, progress);
};

/**
 * Loading screen for concept generation with LogoAnimation,
 * glassmorphic message bubbles, and asymptotic progress tracking.
 */
const ConceptGenerationLoading: React.FC<ConceptGenerationLoadingProps> = ({
  className,
}) => {
  // Bubble visibility state
  const [visibleBubbleIds, setVisibleBubbleIds] = useState<Set<number>>(
    new Set(),
  );

  // Progress state
  const startTimeRef = useRef<number>(Date.now());
  const [progress, setProgress] = useState(0);

  // Pre-calculate bubble positions - evenly distributed around a circle
  const bubbleData = useMemo(() => {
    return GENERATION_MESSAGES.map((message, index) => {
      const angle = (index / GENERATION_MESSAGES.length) * 360 - 90; // Start from top
      const radiusX = 280;
      const radiusY = 200;
      const x = Math.cos((angle * Math.PI) / 180) * radiusX;
      const y = Math.sin((angle * Math.PI) / 180) * radiusY;

      return { id: index, message, x, y };
    });
  }, []);

  // Randomized order for revealing bubbles
  const revealOrder = useMemo(
    () => shuffleArray(GENERATION_MESSAGES.map((_, i) => i)),
    [],
  );

  // Reveal bubbles one at a time in random order (slower intervals)
  useEffect(() => {
    if (visibleBubbleIds.size >= GENERATION_MESSAGES.length) return;

    const timeout = setTimeout(() => {
      const nextId = revealOrder[visibleBubbleIds.size];
      setVisibleBubbleIds((prev) => new Set([...prev, nextId]));
    }, 3500); // Slower interval

    return () => clearTimeout(timeout);
  }, [visibleBubbleIds.size, revealOrder]);

  // Progress bar update effect (45 second asymptotic progress)
  useEffect(() => {
    const updateProgress = () => {
      const elapsedSeconds = (Date.now() - startTimeRef.current) / 1000;
      setProgress(calculateAsymptoticProgress(elapsedSeconds));
    };

    updateProgress();
    const interval = setInterval(updateProgress, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`relative flex items-center justify-center ${className || ''}`}
    >
      {/* Bubbles container - absolutely positioned, won't affect layout */}
      <div className='pointer-events-none absolute inset-0'>
        <div className='relative h-full w-full'>
          {bubbleData
            .filter((bubble) => visibleBubbleIds.has(bubble.id))
            .map((bubble) => (
              <div
                key={bubble.id}
                className='absolute'
                style={{
                  left: '50%',
                  top: '50%',
                  transform: `translate(-50%, -50%) translate(${bubble.x}px, ${bubble.y}px)`,
                }}
              >
                {/* Pop-in animation wrapper */}
                <div
                  className='animate-[bubblePopIn_0.5s_ease-out_forwards]'
                  style={{ opacity: 0 }}
                >
                  {/* Floating animation wrapper - use bubble.id for stable animation timing */}
                  <div
                    className='animate-[bubbleFloat_3s_ease-in-out_infinite]'
                    style={{
                      animationDelay: `${bubble.id * 0.3}s`,
                      animationDuration: `${3 + (bubble.id % 3) * 0.5}s`,
                    }}
                  >
                    <div className='whitespace-nowrap rounded-full border border-white/20 bg-white/10 px-4 py-2 shadow-lg backdrop-blur-md'>
                      <span className='text-sm font-medium text-white/90'>
                        {bubble.message}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Logo and progress bar - centered, unaffected by bubbles */}
      <div className='relative z-20 flex flex-col items-center'>
        {/* Pulsating glow behind logo */}
        <div className='absolute left-1/2 top-14 h-32 w-32 -translate-x-1/2 -translate-y-1/2 animate-[glowPulse_3s_ease-in-out_infinite] rounded-full bg-white/20 blur-2xl' />

        {/* Animated logo with subtle pulse */}
        <div className='relative flex h-28 w-28 animate-[logoPulse_2s_ease-in-out_infinite] items-center justify-center'>
          <LogoAnimation size={112} loop fps={90} />
        </div>

        {/* Glassmorphic progress bar */}
        <div className='mt-6 h-2 w-48 overflow-hidden rounded-full bg-white/10 backdrop-blur-xl'>
          <div
            className='h-full rounded-full bg-white/50 transition-all duration-150 ease-out'
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Progress percentage */}
        <span className='mt-2 text-xs text-white/50'>
          {Math.round(progress)}%
        </span>
      </div>

      {/* Inject keyframe animations */}
      <style>{`
        @keyframes bubblePopIn {
          0% {
            opacity: 0;
            transform: scale(0.7);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes bubbleFloat {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        @keyframes logoPulse {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        @keyframes glowPulse {
          0%, 100% {
            opacity: 0.2;
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            opacity: 0.4;
            transform: translate(-50%, -50%) scale(1.15);
          }
        }
      `}</style>
    </div>
  );
};

export default ConceptGenerationLoading;

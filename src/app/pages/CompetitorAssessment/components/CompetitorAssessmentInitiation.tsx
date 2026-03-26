import React, { useEffect, useState } from 'react';
import { cn } from '@libs/utils/react';
import { motion, AnimatePresence } from 'framer-motion';
import images from '@assets/img';
import { Swords } from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';
import { useInitiationStore } from '@stores/initiation.store';

/**
 * Feature highlight item for the initiation page
 */
export interface CompetitorFeatureHighlight {
  icon: string;
  title: string;
  description: string;
  subDescription?: string;
}

/**
 * Badge configuration for top badges
 */
export interface CompetitorInitiationBadge {
  icon?: string;
  text: string;
  variant: 'premium' | 'status' | 'neutral';
  statusColor?: 'green' | 'amber' | 'red';
}

/**
 * Props for the CompetitorAssessmentInitiation component
 */
export interface CompetitorAssessmentInitiationProps {
  /** Called when the CTA is clicked */
  onInitialize: () => void | Promise<void>;
  /** Whether initialization is in progress */
  isInitializing?: boolean;
}

/**
 * Competitive intelligence matrix background with animated competitor nodes
 */
const CompetitorMatrixBackground: React.FC = () => {
  // Grid intersection points representing competitors
  const competitorNodes = [
    { x: 20, y: 25, delay: 0 },
    { x: 50, y: 20, delay: 0.3 },
    { x: 80, y: 30, delay: 0.6 },
    { x: 35, y: 50, delay: 0.9 },
    { x: 65, y: 45, delay: 1.2 },
    { x: 25, y: 75, delay: 1.5 },
    { x: 55, y: 70, delay: 1.8 },
    { x: 85, y: 65, delay: 2.1 },
  ];

  // Connection lines between competitors
  const connections = [
    { x1: 20, y1: 25, x2: 50, y2: 20 },
    { x1: 50, y1: 20, x2: 80, y2: 30 },
    { x1: 35, y1: 50, x2: 65, y2: 45 },
    { x1: 20, y1: 25, x2: 35, y2: 50 },
    { x1: 80, y1: 30, x2: 65, y2: 45 },
    { x1: 25, y1: 75, x2: 55, y2: 70 },
    { x1: 55, y1: 70, x2: 85, y2: 65 },
    { x1: 35, y1: 50, x2: 25, y2: 75 },
    { x1: 65, y1: 45, x2: 85, y2: 65 },
  ];

  const nodeColors = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6'];

  return (
    <div className='absolute inset-0 overflow-hidden'>
      {/* Background image with blur and subtle movement */}
      <motion.div
        className='absolute -inset-4 bg-cover bg-center bg-no-repeat'
        style={{
          backgroundImage: `url(${images.nucleusBrandGradient})`,
          filter: 'blur(2px)',
          transform: 'scale(1.05)',
        }}
        initial={{ scale: 1.08 }}
        animate={{ scale: 1.05 }}
        transition={{ duration: 2, ease: 'easeOut' }}
      />

      {/* Dark overlay with multiply blend */}
      <div
        className='absolute inset-0'
        style={{
          backgroundColor: 'rgba(10, 15, 25, 0.6)',
          mixBlendMode: 'multiply',
        }}
      />

      {/* Radial glow effect */}
      <div className='bg-gradient-radial from-primary/10 absolute inset-0 via-transparent to-transparent opacity-50' />

      {/* Matrix grid lines */}
      <svg
        className='absolute inset-0 h-full w-full opacity-20'
        style={{ filter: 'blur(1px)' }}
        preserveAspectRatio='xMidYMid slice'
      >
        <defs>
          <linearGradient id='gridGlow' x1='0%' y1='0%' x2='100%' y2='100%'>
            <stop offset='0%' stopColor='white' stopOpacity='0.3' />
            <stop offset='50%' stopColor='white' stopOpacity='0.1' />
            <stop offset='100%' stopColor='white' stopOpacity='0.3' />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[20, 40, 60, 80].map((y) => (
          <line
            key={`h-${y}`}
            x1='5%'
            y1={`${y}%`}
            x2='95%'
            y2={`${y}%`}
            stroke='white'
            strokeOpacity='0.15'
            strokeWidth='1'
            strokeDasharray='4 8'
          />
        ))}

        {/* Vertical grid lines */}
        {[20, 40, 60, 80].map((x) => (
          <line
            key={`v-${x}`}
            x1={`${x}%`}
            y1='5%'
            x2={`${x}%`}
            y2='95%'
            stroke='white'
            strokeOpacity='0.15'
            strokeWidth='1'
            strokeDasharray='4 8'
          />
        ))}

        {/* Connection lines between nodes */}
        {connections.map((conn, i) => (
          <motion.line
            key={i}
            x1={`${conn.x1}%`}
            y1={`${conn.y1}%`}
            x2={`${conn.x2}%`}
            y2={`${conn.y2}%`}
            stroke='url(#gridGlow)'
            strokeWidth='1'
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.4 }}
            transition={{
              duration: 1.5,
              delay: 0.5 + i * 0.1,
              ease: 'easeOut',
            }}
          />
        ))}
      </svg>

      {/* Competitor nodes */}
      <div className='absolute inset-0' style={{ filter: 'blur(2px)' }}>
        {competitorNodes.map((node, i) => (
          <motion.div
            key={i}
            className='absolute h-4 w-4 rounded-full'
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              background: nodeColors[i % 4],
              boxShadow: `0 0 20px ${nodeColors[i % 4]}, 0 0 40px ${nodeColors[i % 4]}40`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.6, 1, 0.6],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 3,
              delay: node.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Scanning line effect */}
      <motion.div
        className='absolute h-full w-px opacity-30'
        style={{
          background:
            'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)',
          filter: 'blur(1px)',
        }}
        initial={{ left: '0%' }}
        animate={{ left: '100%' }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Vignette effects */}
      <div className='absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40' />
      <div className='absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50' />
    </div>
  );
};

/**
 * Badge component for the initiation header
 */
const InitiationBadgeComponent: React.FC<{
  badge: CompetitorInitiationBadge;
}> = ({ badge }) => {
  const getVariantClasses = () => {
    switch (badge.variant) {
      case 'premium':
        return 'border-white/20 bg-white/10';
      case 'status':
        return badge.statusColor === 'green'
          ? 'border-emerald-500/30 bg-emerald-500/10'
          : badge.statusColor === 'amber'
            ? 'border-amber-500/30 bg-amber-500/10'
            : 'border-red-500/30 bg-red-500/10';
      default:
        return 'border-white/20 bg-white/10';
    }
  };

  const getStatusDotColor = () => {
    switch (badge.statusColor) {
      case 'green':
        return 'bg-emerald-400';
      case 'amber':
        return 'bg-amber-400';
      case 'red':
        return 'bg-red-400';
      default:
        return 'bg-emerald-400';
    }
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full border px-3 py-1.5 backdrop-blur-sm',
        getVariantClasses(),
      )}
    >
      {badge.variant === 'premium' && badge.icon && (
        <DynamicIcon
          variant={badge.icon}
          height={14}
          width={14}
          className='stroke-amber-400'
        />
      )}
      {badge.variant === 'status' && (
        <div
          className={cn(
            'h-2 w-2 animate-pulse rounded-full',
            getStatusDotColor(),
          )}
        />
      )}
      <span className='text-xs font-medium text-white/90'>{badge.text}</span>
    </div>
  );
};

// Default configuration for the Competitor Assessment
const defaultFeatures: CompetitorFeatureHighlight[] = [
  {
    icon: 'search-refraction',
    title: 'Discover Competitors',
    description: 'AI-powered research',
    subDescription: 'finds key players',
  },
  {
    icon: 'layers',
    title: 'Matrix Analysis',
    description: '3M-style template',
    subDescription: '7 key attributes',
  },
  {
    icon: 'sparkles',
    title: 'White Space Gaps',
    description: 'Portfolio opportunities',
    subDescription: 'strategic insights',
  },
];

const defaultBadges: CompetitorInitiationBadge[] = [
  {
    icon: 'swords',
    text: 'Competitive Intelligence',
    variant: 'premium',
  },
  {
    text: 'AI-Powered',
    variant: 'status',
    statusColor: 'green',
  },
];

/**
 * CompetitorAssessmentInitiation - Cinematic introduction component for first-run experience
 *
 * This component provides a visually engaging first-run experience for Competitor Assessment,
 * with animated matrix background, feature highlights, and a prominent CTA button.
 */
const CompetitorAssessmentInitiation: React.FC<
  CompetitorAssessmentInitiationProps
> = ({ onInitialize, isInitializing = false }) => {
  const setShowingInitiation = useInitiationStore(
    (s) => s.setShowingInitiation,
  );
  useEffect(() => {
    setShowingInitiation(true);
    return () => setShowingInitiation(false);
  }, [setShowingInitiation]);

  const [showContent, setShowContent] = useState(true);
  const [isFlashing, setIsFlashing] = useState(false);

  const handleActivate = async () => {
    setIsFlashing(true);

    // Cinematic transition
    setTimeout(() => {
      setShowContent(false);
    }, 300);

    setTimeout(async () => {
      await onInitialize();
    }, 800);
  };

  return (
    <div className='relative min-h-screen w-full overflow-hidden'>
      {/* Competitor matrix background */}
      <CompetitorMatrixBackground />

      {/* Activation flash overlay */}
      <AnimatePresence>
        {isFlashing && (
          <motion.div
            className='absolute inset-0 z-50 bg-white'
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, times: [0, 0.3, 1] }}
          />
        )}
      </AnimatePresence>

      {/* Main content */}
      <AnimatePresence>
        {showContent && (
          <motion.div
            className='relative z-10 flex min-h-screen flex-col items-center justify-center px-6'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Top badges */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className='mb-8 flex items-center gap-4'
            >
              {defaultBadges.map((badge, index) => (
                <InitiationBadgeComponent key={index} badge={badge} />
              ))}
            </motion.div>

            {/* Title with inline icon */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className='mb-4 flex items-center gap-6'
            >
              <div className='relative'>
                <div className='absolute inset-0 scale-150 rounded-lg bg-white/20 blur-xl' />
                <div className='relative rounded-lg border border-white/20 bg-white/5 p-4 backdrop-blur-md'>
                  <Swords
                    size={48}
                    className='stroke-white'
                    strokeWidth={1.5}
                  />
                </div>
              </div>
              <h1 className='text-5xl font-bold tracking-tight text-white md:text-7xl'>
                Competitor Assessment
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className='mb-12 text-center text-lg tracking-wide text-white/50'
            >
              Build your competitive intelligence matrix and uncover market
              opportunities
            </motion.p>

            {/* Feature cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className='mb-12 grid w-full max-w-3xl grid-cols-3 gap-4'
            >
              {defaultFeatures.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + i * 0.1, duration: 0.4 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className='flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm transition-shadow hover:shadow-lg hover:shadow-white/5'
                >
                  <div className='shrink-0 rounded-lg bg-white/10 p-2.5'>
                    <DynamicIcon
                      variant={feature.icon}
                      height={16}
                      width={16}
                      className='stroke-white/80'
                    />
                  </div>
                  <div className='text-left'>
                    <div className='text-sm font-medium text-white/90'>
                      {feature.title}
                    </div>
                    <div className='text-[11px] leading-tight text-white/40'>
                      {feature.description}
                      {feature.subDescription && (
                        <>
                          <br />
                          {feature.subDescription}
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* Activate button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.6 }}
              onClick={handleActivate}
              disabled={isInitializing || isFlashing}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
              className='group relative overflow-hidden rounded-full bg-white px-8 py-4 font-semibold text-slate-950 transition-all duration-300 hover:bg-white/95 disabled:cursor-not-allowed disabled:opacity-50'
            >
              {/* Animated border trace */}
              <span className='absolute inset-0 rounded-full'>
                <span
                  className='absolute inset-[-2px] rounded-full'
                  style={{
                    background:
                      'conic-gradient(from 0deg, transparent 0deg 300deg, rgba(255,255,255,0.8) 360deg)',
                    animation: 'spin 2s linear infinite',
                  }}
                />
                <span className='absolute inset-[1px] rounded-full bg-white' />
              </span>

              {/* Button content */}
              <span className='relative flex items-center gap-3'>
                <DynamicIcon
                  variant={isInitializing || isFlashing ? 'refresh' : 'zap'}
                  height={20}
                  width={20}
                  className={cn(
                    'stroke-current',
                    (isInitializing || isFlashing) && 'animate-spin',
                  )}
                />
                <span>
                  {isInitializing || isFlashing
                    ? 'Initializing Assessment...'
                    : 'Start Competitive Analysis'}
                </span>
              </span>

              {/* Glow effect */}
              <div
                className='absolute -inset-4 -z-10 rounded-full opacity-60 transition-opacity duration-500 group-hover:opacity-100'
                style={{
                  background:
                    'radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%)',
                  filter: 'blur(20px)',
                }}
              />
            </motion.button>

            {/* Help text */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4, duration: 0.6 }}
              className='mt-6 max-w-md text-center text-xs text-white/30'
            >
              AI agents will discover competitors in your market, research their
              strengths and weaknesses, and identify white space opportunities
              for your product.
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSS for spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CompetitorAssessmentInitiation;

import React, { useEffect, useState } from 'react';
import { cn } from '@libs/utils/react';
import { motion, AnimatePresence } from 'framer-motion';
import images from '@assets/img';
import { DynamicIcon } from '@libs/utils/iconMap';
import { useInitiationStore } from '@stores/initiation.store';

/**
 * Feature highlight item for the Watchtower initiation page
 */
export interface WatchtowerFeatureHighlight {
  icon: string;
  title: string;
  description: string;
  subDescription?: string;
}

/**
 * Badge configuration for top badges
 */
export interface WatchtowerInitiationBadge {
  icon?: string;
  text: string;
  variant: 'premium' | 'status' | 'neutral';
  statusColor?: 'green' | 'amber' | 'red';
}

/**
 * Props for the WatchtowerInitiation component
 */
export interface WatchtowerInitiationProps {
  /** Main icon for the feature */
  icon: string;
  /** Title of the feature */
  title: string;
  /** Subtitle/tagline */
  subtitle: string;
  /** Feature highlights to display */
  features: WatchtowerFeatureHighlight[];
  /** Text for the CTA button */
  ctaText: string;
  /** Loading text for the CTA button */
  ctaLoadingText?: string;
  /** Help text below the CTA */
  helpText?: string;
  /** Badges to display at the top */
  badges?: WatchtowerInitiationBadge[];
  /** Called when the CTA is clicked */
  onInitialize: () => void | Promise<void>;
  /** Whether initialization is in progress */
  isInitializing?: boolean;
  /** Whether the current user is an admin (controls initialize access). */
  isAdmin?: boolean;
}

/**
 * Watchtower radar background with animated signal dots
 */
const WatchtowerRadarBackground: React.FC = () => {
  const signalDots = [
    { x: 25, y: 30, delay: 0 },
    { x: 70, y: 25, delay: 0.3 },
    { x: 45, y: 60, delay: 0.6 },
    { x: 80, y: 55, delay: 0.9 },
    { x: 30, y: 75, delay: 1.2 },
    { x: 60, y: 40, delay: 1.5 },
    { x: 15, y: 50, delay: 1.8 },
    { x: 85, y: 70, delay: 2.1 },
  ];

  const colors = ['#ef4444', '#f59e0b', '#22c55e'];

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
          backgroundColor: 'rgba(20, 10, 10, 0.55)',
          mixBlendMode: 'multiply',
        }}
      />

      {/* Radial glow effect */}
      <div className='bg-gradient-radial from-primary/10 absolute inset-0 via-transparent to-transparent opacity-50' />

      {/* Radar grid lines */}
      <svg
        className='absolute inset-0 h-full w-full opacity-30'
        style={{ filter: 'blur(2px)' }}
        preserveAspectRatio='xMidYMid slice'
      >
        <defs>
          <radialGradient id='radarGlow' cx='50%' cy='50%' r='50%'>
            <stop offset='0%' stopColor='white' stopOpacity='0.2' />
            <stop offset='100%' stopColor='white' stopOpacity='0' />
          </radialGradient>
        </defs>

        {/* Elliptical rings */}
        <ellipse
          cx='50%'
          cy='50%'
          rx='45%'
          ry='40%'
          fill='none'
          stroke='white'
          strokeOpacity='0.4'
          strokeWidth='1'
        />
        <ellipse
          cx='50%'
          cy='50%'
          rx='30%'
          ry='26%'
          fill='none'
          stroke='white'
          strokeOpacity='0.3'
          strokeWidth='1'
        />
        <ellipse
          cx='50%'
          cy='50%'
          rx='15%'
          ry='13%'
          fill='none'
          stroke='white'
          strokeOpacity='0.2'
          strokeWidth='1'
        />

        {/* Cross lines */}
        <line
          x1='50%'
          y1='10%'
          x2='50%'
          y2='90%'
          stroke='white'
          strokeOpacity='0.15'
          strokeWidth='1'
        />
        <line
          x1='5%'
          y1='50%'
          x2='95%'
          y2='50%'
          stroke='white'
          strokeOpacity='0.15'
          strokeWidth='1'
        />

        {/* Radial glow */}
        <ellipse cx='50%' cy='50%' rx='50%' ry='45%' fill='url(#radarGlow)' />
      </svg>

      {/* Signal dots */}
      <div className='absolute inset-0' style={{ filter: 'blur(3px)' }}>
        {signalDots.map((dot, i) => (
          <motion.div
            key={i}
            className='absolute h-3.5 w-3.5 rounded-full'
            style={{
              left: `${dot.x}%`,
              top: `${dot.y}%`,
              background: colors[i % 3],
              boxShadow: `0 0 25px ${colors[i % 3]}`,
            }}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: [0.5, 0.9, 0.5],
              scale: [0.8, 1.3, 0.8],
            }}
            transition={{
              duration: 3,
              delay: dot.delay,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Sweep line */}
      <motion.div
        className='absolute left-1/2 top-1/2 h-px w-[45%] origin-left'
        style={{
          background:
            'linear-gradient(90deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 100%)',
          filter: 'blur(2px)',
        }}
        initial={{ rotate: 0 }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Vignette effects */}
      <div className='absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/30' />
      <div className='absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40' />
    </div>
  );
};

/**
 * Badge component for the initiation header
 */
const InitiationBadgeComponent: React.FC<{
  badge: WatchtowerInitiationBadge;
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

/**
 * WatchtowerInitiation - Cinematic introduction component for Watchtower first-run experience
 *
 * This component provides a visually engaging first-run experience for Watchtower,
 * with animated radar background, feature highlights, and a prominent CTA button.
 */
const WatchtowerInitiation: React.FC<WatchtowerInitiationProps> = ({
  icon,
  title,
  subtitle,
  features,
  ctaText,
  ctaLoadingText = 'Initializing...',
  helpText,
  badges = [],
  onInitialize,
  isInitializing = false,
  isAdmin = false,
}) => {
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
      {/* Watchtower radar background */}
      <WatchtowerRadarBackground />

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
            {badges.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className='mb-8 flex items-center gap-4'
              >
                {badges.map((badge, index) => (
                  <InitiationBadgeComponent key={index} badge={badge} />
                ))}
              </motion.div>
            )}

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
                  <DynamicIcon
                    variant={icon}
                    height={48}
                    width={48}
                    className='stroke-white'
                    strokeWidth={1.5}
                  />
                </div>
              </div>
              <h1 className='text-5xl font-bold tracking-tight text-white md:text-7xl'>
                {title}
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className='mb-12 text-center text-lg tracking-wide text-white/50'
            >
              {subtitle}
            </motion.p>

            {/* Feature cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className='mb-12 grid w-full max-w-3xl grid-cols-3 gap-4'
            >
              {features.map((feature, i) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + i * 0.1, duration: 0.4 }}
                  className='flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm'
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
              disabled={isInitializing || isFlashing || !isAdmin}
              title={!isAdmin ? 'Admin access required' : undefined}
              className='group relative overflow-hidden rounded-full bg-white px-8 py-4 font-semibold text-slate-950 transition-all duration-300 hover:scale-105 hover:bg-white/95 disabled:cursor-not-allowed disabled:opacity-50'
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
                  {isInitializing || isFlashing ? ctaLoadingText : ctaText}
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
            {(helpText || !isAdmin) && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.4, duration: 0.6 }}
                className='mt-6 max-w-md text-center text-xs text-white/30'
              >
                {!isAdmin
                  ? 'Only account admins can initialize Watchtower. Contact your admin to get started.'
                  : helpText}
              </motion.p>
            )}
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

export default WatchtowerInitiation;

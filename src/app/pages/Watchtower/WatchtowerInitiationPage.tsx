import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import { motion, AnimatePresence } from 'framer-motion';
import images from '@assets/img';
import { AppPath } from '@routes/routes';

/**
 * WatchtowerInitiationPage - Cinematic intro page for Watchtower feature
 */
const WatchtowerInitiationPage: React.FC = () => {
  const navigate = useNavigate();
  const [showContent, setShowContent] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  // Staggered content reveal
  useEffect(() => {
    const timer = setTimeout(() => setShowContent(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleInitialize = () => {
    setIsInitializing(true);
    // Simulate initialization delay for dramatic effect
    setTimeout(() => {
      navigate(AppPath.Watchtower);
    }, 1200);
  };

  const features = [
    {
      icon: 'signal-02' as const,
      title: 'Real-Time Signal Detection',
      description:
        'Continuously monitors market movements, competitor actions, and industry shifts',
    },
    {
      icon: 'alert-triangle' as const,
      title: 'Threat & Opportunity Analysis',
      description:
        'AI-powered classification of signals into actionable threat and opportunity categories',
    },
    {
      icon: 'lightbulb' as const,
      title: 'Concept Impact Assessment',
      description:
        'Automatically links signals to your concept bank and suggests strategic adjustments',
    },
    {
      icon: 'trending-up' as const,
      title: 'Predictive Intelligence',
      description:
        'Forward-looking predictions based on signal patterns and market trends',
    },
  ];

  return (
    <div className='relative flex min-h-screen items-center justify-center overflow-hidden'>
      {/* Background with radar visualization */}
      <div
        className='absolute inset-0 bg-cover bg-center bg-no-repeat'
        style={{
          backgroundImage: `url(${images.aiExplorationsBackground})`,
        }}
      />

      {/* Dark overlay */}
      <div className='absolute inset-0 bg-black/70' />

      {/* Animated radar rings in background */}
      <div className='pointer-events-none absolute inset-0 flex items-center justify-center'>
        {[1, 2, 3, 4].map((ring) => (
          <motion.div
            key={ring}
            className='absolute rounded-full border border-white/5'
            style={{
              width: `${ring * 25}%`,
              height: `${ring * 25}%`,
            }}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{
              opacity: showContent ? 0.3 : 0,
              scale: showContent ? 1 : 0.8,
            }}
            transition={{
              duration: 1,
              delay: ring * 0.15,
              ease: 'easeOut',
            }}
          />
        ))}

        {/* Sweep line animation */}
        <motion.div
          className='absolute h-[1px] origin-left bg-gradient-to-r from-white/30 to-transparent'
          style={{ width: '50%', left: '50%' }}
          initial={{ rotate: 0, opacity: 0 }}
          animate={{
            rotate: showContent ? 360 : 0,
            opacity: showContent ? 1 : 0,
          }}
          transition={{
            rotate: {
              duration: 8,
              repeat: Infinity,
              ease: 'linear',
            },
            opacity: { duration: 0.5 },
          }}
        />
      </div>

      {/* Main content */}
      <div className='relative z-10 mx-auto max-w-4xl px-6 text-center'>
        <AnimatePresence>
          {showContent && (
            <>
              {/* Icon */}
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className='mb-6 inline-flex items-center justify-center'
              >
                <div className='relative'>
                  <div className='absolute inset-0 animate-pulse rounded-full bg-white/10 blur-xl' />
                  <div className='relative rounded-full border border-white/20 bg-white/10 p-4 backdrop-blur-sm'>
                    <Icon
                      variant='signal-02'
                      height={48}
                      width={48}
                      className='stroke-white'
                    />
                  </div>
                </div>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
                className='mb-3 text-4xl font-bold tracking-tight text-white md:text-5xl'
              >
                Watchtower
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
                className='mb-2 text-lg font-medium uppercase tracking-widest text-white/60'
              >
                Signal Intelligence System
              </motion.p>

              {/* Description */}
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3, ease: 'easeOut' }}
                className='mx-auto mb-12 max-w-2xl text-base leading-relaxed text-white/70'
              >
                Your strategic radar for market intelligence. Watchtower
                continuously scans the competitive landscape, identifying
                threats and opportunities that impact your concepts.
              </motion.p>

              {/* Feature grid */}
              <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
                className='mb-12 grid grid-cols-1 gap-4 md:grid-cols-2'
              >
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{
                      duration: 0.4,
                      delay: 0.5 + index * 0.1,
                      ease: 'easeOut',
                    }}
                    className='group rounded-xl border border-white/10 bg-white/5 p-5 text-left backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-white/10'
                  >
                    <div className='mb-3 flex items-center gap-3'>
                      <div className='rounded-lg border border-white/20 bg-white/10 p-2'>
                        <Icon
                          variant={feature.icon}
                          height={20}
                          width={20}
                          className='stroke-white/80'
                        />
                      </div>
                      <h3 className='text-sm font-semibold text-white'>
                        {feature.title}
                      </h3>
                    </div>
                    <p className='text-sm leading-relaxed text-white/60'>
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Button */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.9, ease: 'easeOut' }}
              >
                <button
                  onClick={handleInitialize}
                  disabled={isInitializing}
                  className={cn(
                    'group relative inline-flex items-center gap-3 overflow-hidden rounded-full px-8 py-4 text-base font-semibold transition-all duration-300',
                    isInitializing
                      ? 'cursor-not-allowed bg-white/20 text-white/60'
                      : 'bg-white text-slate-900 hover:bg-white/90 hover:shadow-lg hover:shadow-white/20',
                  )}
                >
                  {isInitializing ? (
                    <>
                      <Icon
                        variant='refresh'
                        height={20}
                        width={20}
                        className='animate-spin stroke-current'
                      />
                      <span>Initializing...</span>
                    </>
                  ) : (
                    <>
                      <Icon
                        variant='play'
                        height={20}
                        width={20}
                        className='stroke-current transition-transform duration-300 group-hover:scale-110'
                      />
                      <span>Initialize Watchtower</span>
                      <Icon
                        variant='arrowright'
                        height={20}
                        width={20}
                        className='stroke-current transition-transform duration-300 group-hover:translate-x-1'
                      />
                    </>
                  )}
                </button>
              </motion.div>

              {/* Skip link */}
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 1.1 }}
                className='mt-6 text-xs text-white/40'
              >
                Press{' '}
                <kbd className='rounded border border-white/20 bg-white/10 px-1.5 py-0.5 font-mono text-[10px]'>
                  Enter
                </kbd>{' '}
                to continue
              </motion.p>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* Keyboard handler */}
      <KeyboardHandler onEnter={handleInitialize} disabled={isInitializing} />
    </div>
  );
};

/**
 * Keyboard handler component for Enter key
 */
const KeyboardHandler: React.FC<{
  onEnter: () => void;
  disabled: boolean;
}> = ({ onEnter, disabled }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !disabled) {
        onEnter();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onEnter, disabled]);

  return null;
};

export default WatchtowerInitiationPage;

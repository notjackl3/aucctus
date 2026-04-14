import { cn } from '@libs/utils/react';
import { motion } from 'framer-motion';
import {
  Crosshair,
  Puzzle,
  Radar,
  Search,
  Sparkles,
  Target,
  X,
} from 'lucide-react';
import React from 'react';

import JTBDBackground from './JTBDBackground';

const JTBD_FEATURES = [
  {
    icon: Target,
    title: 'Discover Unmet Needs',
    description:
      'AI-powered analysis of market signals and customer pain points',
  },
  {
    icon: Crosshair,
    title: 'Opportunity Scoring',
    description: 'Rank jobs by frequency, intensity, and willingness to pay',
  },
  {
    icon: Sparkles,
    title: 'Evidence Widgets',
    description: 'Rich visualizations backing every discovered opportunity',
  },
];

const EmptyState: React.FC<{
  hasConfig: boolean;
  onConfigure: () => void;
  onTriggerScan: () => void;
  isTriggering: boolean;
  onSearch: (description: string) => void;
}> = ({ hasConfig, onTriggerScan, isTriggering, onSearch }) => {
  const [localSearch, setLocalSearch] = React.useState('');
  const localInputRef = React.useRef<HTMLInputElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' && localSearch.trim()) {
      onSearch(localSearch.trim());
      setLocalSearch('');
    }
  };

  return (
    <div className='relative flex h-full w-full items-center justify-center overflow-hidden'>
      {/* Animated background */}
      <JTBDBackground />

      {/* Content */}
      <div className='relative z-10 flex flex-col items-center px-6'>
        {/* Badges */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className='mb-8 flex items-center gap-3'
        >
          <div className='inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-sm'>
            <Puzzle className='h-3.5 w-3.5 text-white/70' />
            <span className='text-xs font-medium text-white/90'>
              Jobs to Be Done
            </span>
          </div>
          <div className='inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 backdrop-blur-sm'>
            <div className='h-2 w-2 animate-pulse rounded-full bg-emerald-400' />
            <span className='text-xs font-medium text-white/90'>
              AI-Powered
            </span>
          </div>
        </motion.div>

        {/* Title with icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className='mb-4 flex items-center gap-5'
        >
          <div className='relative'>
            <div className='absolute inset-0 scale-150 rounded-xl bg-white/15 blur-xl' />
            <div className='relative rounded-xl border border-white/20 bg-white/5 p-4 backdrop-blur-md'>
              <Puzzle className='h-10 w-10 text-white' strokeWidth={1.5} />
            </div>
          </div>
          <h1 className='text-4xl font-bold tracking-tight text-white md:text-5xl'>
            {hasConfig ? 'Ready to Scan' : 'Jobs to Be Done'}
          </h1>
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className='mb-10 text-center text-base tracking-wide text-white/50'
        >
          {hasConfig
            ? 'Run your first scan to discover unmet needs and high-value opportunities.'
            : 'Discover high-value customer needs hiding in plain sight.'}
        </motion.p>

        {/* Feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          className='mb-10 grid w-full max-w-3xl grid-cols-3 gap-4'
        >
          {JTBD_FEATURES.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 + i * 0.1, duration: 0.4 }}
                className='flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-4 backdrop-blur-sm'
              >
                <div className='shrink-0 rounded-lg bg-white/10 p-2.5'>
                  <Icon className='h-4 w-4 text-white/80' />
                </div>
                <div className='text-left'>
                  <div className='text-sm font-medium text-white/90'>
                    {feature.title}
                  </div>
                  <div className='text-[11px] leading-tight text-white/40'>
                    {feature.description}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* CTA — search bar or scan button */}
        {hasConfig ? (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            onClick={onTriggerScan}
            disabled={isTriggering}
            className='group relative overflow-hidden rounded-full bg-emerald-400 px-8 py-4 font-semibold text-slate-950 transition-all duration-300 hover:scale-105 hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-50'
          >
            <span className='absolute inset-0 rounded-full'>
              <span
                className='absolute inset-[-2px] rounded-full'
                style={{
                  background:
                    'conic-gradient(from 0deg, transparent 0deg 300deg, rgba(255,255,255,0.8) 360deg)',
                  animation: 'jtbd-spin 2s linear infinite',
                }}
              />
              <span className='absolute inset-[1px] rounded-full bg-emerald-400' />
            </span>
            <span className='relative flex items-center gap-3'>
              <Radar
                className={cn('h-5 w-5', isTriggering && 'animate-spin')}
              />
              <span>
                {isTriggering ? 'Starting Scan...' : 'Run First Scan'}
              </span>
            </span>
            <div
              className='absolute -inset-4 -z-10 rounded-full opacity-50 transition-opacity duration-500 group-hover:opacity-100'
              style={{
                background:
                  'radial-gradient(circle, rgba(255,255,255,0.35) 0%, transparent 70%)',
                filter: 'blur(20px)',
              }}
            />
          </motion.button>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.6 }}
            className='w-full max-w-lg'
          >
            <div className='liquid-glass-search-shell'>
              <div aria-hidden='true' className='liquid-glass-search-rim' />
              <div className='liquid-glass-search-surface'>
                <div className='flex items-center gap-2 px-4 py-3'>
                  <Search className='h-5 w-5 shrink-0 text-white/40' />
                  <input
                    ref={localInputRef}
                    value={localSearch}
                    onChange={(e) => setLocalSearch(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder='Search for jobs, pain, or customers'
                    className='no-focus-ring h-9 flex-1 border-0 bg-transparent text-base text-white placeholder:text-white/30'
                  />
                  {localSearch && (
                    <button
                      onClick={() => setLocalSearch('')}
                      className='rounded-md p-1 transition-colors hover:bg-white/10'
                    >
                      <X className='h-4 w-4 text-white/40' />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Help text */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          className='mt-6 max-w-md text-center text-xs text-white/30'
        >
          {hasConfig
            ? 'Scanning will analyze market signals and discover unmet customer needs. This can take a few minutes.'
            : 'Describe a market or customer segment and press Enter to get started.'}
        </motion.p>
      </div>

      {/* Spin animation for button border */}
      <style>{`
      @keyframes jtbd-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}</style>
    </div>
  );
};

export default EmptyState;

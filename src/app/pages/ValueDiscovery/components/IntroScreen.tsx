import { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { DynamicIcon } from '@libs/utils/iconMap';
import { cn } from '@libs/utils/react';

interface IntroScreenProps {
  onStart: (companyName: string) => void;
  isLoading: boolean;
}

const features = [
  {
    icon: 'message-chat-square',
    title: 'Innovation Audit',
    description: 'AI maps your innovation',
    subDescription: 'workflows & processes',
  },
  {
    icon: 'target-04',
    title: 'Workflow Ratings',
    description: 'Score each workflow for',
    subDescription: 'AI acceleration potential',
  },
  {
    icon: 'route',
    title: 'Actionable Roadmap',
    description: 'Personalized plan mapped',
    subDescription: 'to Aucctus capabilities',
  },
];

export const IntroScreen = ({ onStart, isLoading }: IntroScreenProps) => {
  const [companyName, setCompanyName] = useState('');

  const canSubmit = companyName.trim().length > 0;

  const handleSubmit = () => {
    if (canSubmit && !isLoading) {
      onStart(companyName.trim());
    }
  };

  return (
    <div className='flex min-h-screen flex-col items-center justify-center px-6'>
      {/* Badges */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.6 }}
        className='mb-8 flex items-center gap-4'
      >
        <div className='inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 backdrop-blur-sm'>
          <Sparkles size={14} className='stroke-amber-400' />
          <span className='text-xs font-medium text-white/90'>
            Value Discovery
          </span>
        </div>
        <div className='inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 backdrop-blur-sm'>
          <div className='relative'>
            <div className='h-2 w-2 rounded-full bg-emerald-400' />
            <div className='absolute inset-0 animate-ping rounded-full bg-emerald-400/60' />
          </div>
          <span className='text-xs font-medium text-white/90'>AI-Powered</span>
        </div>
      </motion.div>

      {/* Title with icon */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        className='mb-4 flex items-center gap-6'
      >
        <div className='relative'>
          <div className='absolute inset-0 scale-150 rounded-lg bg-white/20 blur-xl' />
          <div className='relative rounded-lg border border-white/20 bg-white/5 p-4 backdrop-blur-md'>
            <Sparkles size={48} className='stroke-white' strokeWidth={1.5} />
          </div>
        </div>
        <h1 className='text-5xl font-bold tracking-tight text-white md:text-7xl'>
          Value Discovery
        </h1>
      </motion.div>

      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.6 }}
        className='mb-12 text-center text-lg tracking-wide text-white/50'
      >
        Discover how AI can accelerate your innovation process
      </motion.p>

      {/* Feature cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6 }}
        className='mb-8 grid w-full max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3'
      >
        {features.map((feature, i) => (
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

      {/* Company name input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.0, duration: 0.6 }}
        className='mb-8 w-full max-w-md'
      >
        <label className='mb-2 block text-center text-sm font-medium text-white/70'>
          What company do you work for?
        </label>
        <input
          type='text'
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSubmit();
          }}
          placeholder='e.g. Gymshark'
          className='w-full rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-center text-white placeholder-white/30 backdrop-blur-sm transition-colors focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/20'
          maxLength={200}
        />
      </motion.div>

      {/* CTA Button with animated border trace */}
      <motion.button
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        onClick={handleSubmit}
        disabled={isLoading || !canSubmit}
        whileHover={canSubmit ? { scale: 1.05 } : undefined}
        whileTap={canSubmit ? { scale: 0.98 } : undefined}
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
            variant={isLoading ? 'refresh' : 'sparkles'}
            height={20}
            width={20}
            className={cn('stroke-current', isLoading && 'animate-spin')}
          />
          <span>
            {isLoading ? 'Agents Calibrating...' : 'Begin Assessment'}
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

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.4, duration: 0.6 }}
        className='mt-6 max-w-md text-center text-xs text-white/30'
      >
        Answer 5-10 adaptive questions and receive a personalized innovation AI
        acceleration briefing
      </motion.p>
    </div>
  );
};

/**
 * LivingPersonasInitModal - Welcome modal for empty state
 *
 * Displayed as a LiquidGlassModal dialog when no personas exist.
 * Shows an animated welcome screen with feature highlights and
 * a CTA to create the first persona.
 */

import { LiquidGlassModal } from '@components';
import { motion } from 'framer-motion';
import { Brain, Sparkles, Target, Users, Zap } from 'lucide-react';
import React, { useCallback, useState } from 'react';

/** Props for the LivingPersonasInitModal component */
export interface LivingPersonasInitModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when the open state changes */
  onOpenChange: (open: boolean) => void;
  /** Callback when create persona is clicked */
  onCreatePersona: () => void;
}

/** Feature card data */
const features = [
  {
    icon: Brain,
    label: 'AI-Powered Insights',
    line1: 'Auto-update personas with',
    line2: 'real research data',
  },
  {
    icon: Target,
    label: 'Deep Understanding',
    line1: 'Capture jobs, pains, gains',
    line2: 'and behaviors',
  },
  {
    icon: Sparkles,
    label: 'Living & Evolving',
    line1: 'Personas grow with new',
    line2: 'evidence over time',
  },
];

/**
 * LivingPersonasInitModal Component
 *
 * A LiquidGlassModal dialog shown when there are no personas.
 * Features animated entry, feature highlights, and a CTA button.
 */
const LivingPersonasInitModal: React.FC<LivingPersonasInitModalProps> = ({
  open,
  onOpenChange,
  onCreatePersona,
}) => {
  const [isActivating, setIsActivating] = useState(false);

  const handleCreateClick = useCallback(() => {
    setIsActivating(true);
    setTimeout(() => {
      setIsActivating(false);
      onOpenChange(false);
      onCreatePersona();
    }, 400);
  }, [onOpenChange, onCreatePersona]);

  return (
    <LiquidGlassModal
      open={open}
      onOpenChange={onOpenChange}
      size='lg'
      animatedRim
      headerClassName='border-b-0'
    >
      <div className='relative p-8'>
        {/* Activation flash overlay */}
        {isActivating && (
          <motion.div
            className='aucctus-bg-primary pointer-events-none absolute inset-0 z-50 rounded-2xl'
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.6, 0] }}
            transition={{ duration: 0.4 }}
          />
        )}

        {/* Icon and Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className='mb-6 flex flex-col items-center'
        >
          <div className='relative mb-4'>
            <div className='absolute inset-0 rounded-lg bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 blur-lg' />
            <div className='aucctus-bg-brand-secondary relative flex h-16 w-16 items-center justify-center rounded-lg'>
              <Users
                className='aucctus-stroke-brand-primary h-8 w-8'
                strokeWidth={1.5}
              />
            </div>
          </div>
          <h1 className='aucctus-header-sm-bold aucctus-text-primary text-center tracking-tight'>
            Welcome to Living Personas
          </h1>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className='aucctus-text-sm aucctus-text-secondary mx-auto mb-8 max-w-md text-center'
        >
          Research-driven personas that evolve with your understanding of
          customers
        </motion.p>

        {/* Feature cards - horizontal layout */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className='mb-8 grid grid-cols-3 gap-3'
        >
          {features.map((feature, i) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
              className='aucctus-bg-secondary aucctus-border-secondary flex items-center gap-3 rounded-xl border px-4 py-4'
            >
              <div className='aucctus-bg-brand-secondary aucctus-text-brand-primary flex shrink-0 items-center justify-center rounded-lg p-2.5'>
                <feature.icon className='h-4 w-4' strokeWidth={1.5} />
              </div>
              <div className='text-left'>
                <div className='aucctus-text-sm-medium aucctus-text-primary'>
                  {feature.label}
                </div>
                <div className='aucctus-text-xs aucctus-text-tertiary leading-tight'>
                  {feature.line1}
                  <br />
                  {feature.line2}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className='flex justify-center'
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateClick}
            disabled={isActivating}
            className='group relative overflow-hidden rounded-full bg-slate-950 px-8 py-4 font-semibold text-white transition-all duration-300 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-50'
          >
            {/* Animated border trace */}
            <span className='absolute inset-0 rounded-full'>
              <span
                className='absolute inset-[-2px] rounded-full'
                style={{
                  background:
                    'conic-gradient(from 0deg, transparent 0deg 300deg, rgba(255,255,255,0.3) 360deg)',
                  animation: 'spin 2s linear infinite',
                }}
              />
              <span className='absolute inset-[1px] rounded-full bg-slate-950' />
            </span>

            {/* Button content */}
            <span className='relative flex items-center gap-3'>
              <Zap className='h-5 w-5' />
              <span>Create Your First Persona</span>
            </span>
          </motion.button>
        </motion.div>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className='aucctus-text-xs aucctus-text-tertiary mt-6 text-center opacity-70'
        >
          Start by creating a persona to represent your key customer segments.
        </motion.p>
      </div>
    </LiquidGlassModal>
  );
};

export default LivingPersonasInitModal;

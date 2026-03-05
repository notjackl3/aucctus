import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export const CalibratingScreen = () => {
  return (
    <div className='flex min-h-screen items-center justify-center px-6 py-12'>
      <div className='aucctus-bg-secondary aucctus-border-secondary flex w-full max-w-md flex-col items-center rounded-2xl border px-8 py-16 shadow-2xl backdrop-blur-2xl'>
        {/* Animated icon */}
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className='mb-8'
        >
          <div className='relative'>
            <div className='absolute inset-0 scale-150 rounded-full bg-primary-600/20 blur-xl' />
            <div className='relative flex h-20 w-20 items-center justify-center rounded-full border border-primary-600/30 bg-primary-600/10'>
              <Sparkles size={36} className='text-primary-600' />
            </div>
          </div>
        </motion.div>

        <h2 className='aucctus-text-primary mb-2 text-xl font-semibold'>
          Agents Calibrating
        </h2>

        <p className='aucctus-text-tertiary mb-8 text-center text-sm'>
          Let us ask you a few questions about your innovation process.
        </p>

        {/* Pulsing dots */}
        <div className='flex gap-1.5'>
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className='aucctus-bg-brand-solid h-2 w-2 rounded-full'
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

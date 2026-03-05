import { motion } from 'framer-motion';
import * as Progress from '@radix-ui/react-progress';
import { Sparkles } from 'lucide-react';

interface GeneratingProgress {
  isGenerating: boolean;
  stage: string;
  progress: number;
  message: string;
}

interface GeneratingScreenProps {
  progress: GeneratingProgress;
}

const stageLabels: Record<string, string> = {
  started: 'Analyzing your responses...',
  generating: 'Generating executive briefing...',
  completing: 'Finalizing recommendations...',
  completed: 'Briefing complete!',
};

export const GeneratingScreen = ({ progress }: GeneratingScreenProps) => {
  const displayMessage =
    progress.message ||
    stageLabels[progress.stage] ||
    'Preparing your briefing...';
  const displayProgress = progress.progress || 10;

  return (
    <div className='aucctus-bg-secondary aucctus-border-secondary flex flex-col items-center rounded-2xl border px-8 py-16 shadow-2xl backdrop-blur-2xl'>
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
        Generating Your Briefing
      </h2>

      <motion.p
        key={displayMessage}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        className='aucctus-text-tertiary mb-8 text-center text-sm'
      >
        {displayMessage}
      </motion.p>

      {/* Progress bar */}
      <div className='w-full max-w-sm'>
        <Progress.Root
          className='aucctus-bg-tertiary relative h-2 w-full overflow-hidden rounded-full'
          value={displayProgress}
        >
          <Progress.Indicator
            className='aucctus-bg-brand-solid h-full rounded-full transition-[width] duration-500 ease-out'
            style={{ width: `${displayProgress}%` }}
          />
        </Progress.Root>
        <div className='mt-2 text-center'>
          <span className='aucctus-text-tertiary text-xs'>
            {displayProgress}%
          </span>
        </div>
      </div>

      {/* Pulsing dots */}
      <div className='mt-8 flex gap-1.5'>
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
  );
};

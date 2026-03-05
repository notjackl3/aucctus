import { motion } from 'framer-motion';

interface ProgressBarProps {
  questionNumber: number;
  estimatedTotal?: number;
}

export const ProgressBar = ({
  questionNumber,
  estimatedTotal = 8,
}: ProgressBarProps) => {
  const progress = Math.min((questionNumber / estimatedTotal) * 100, 100);

  return (
    <div className='mb-6 flex items-center gap-3'>
      <span className='aucctus-text-tertiary text-xs font-medium'>
        Question {questionNumber} of ~{estimatedTotal}
      </span>
      <div className='aucctus-bg-tertiary h-1.5 flex-1 overflow-hidden rounded-full'>
        <motion.div
          className='aucctus-bg-brand-solid h-full rounded-full'
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
};

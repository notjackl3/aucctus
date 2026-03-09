import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface CalibratingScreenProps {
  companyRecognitionMessage?: string;
}

export const CalibratingScreen = ({
  companyRecognitionMessage,
}: CalibratingScreenProps) => {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Typing effect for recognition message
  useEffect(() => {
    if (!companyRecognitionMessage) return;

    setIsTyping(true);
    let i = 0;
    const interval = setInterval(() => {
      if (i < companyRecognitionMessage.length) {
        setDisplayedText(companyRecognitionMessage.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 25);

    return () => clearInterval(interval);
  }, [companyRecognitionMessage]);

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

        <AnimatePresence mode='wait'>
          {companyRecognitionMessage ? (
            <motion.div
              key='recognition'
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className='mb-6 text-center'
            >
              <p className='aucctus-text-primary text-base font-medium leading-relaxed'>
                {displayedText}
                {isTyping && (
                  <span className='ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-primary-600' />
                )}
              </p>
            </motion.div>
          ) : (
            <motion.h2
              key='default'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className='aucctus-text-primary mb-2 text-xl font-semibold'
            >
              Agents Calibrating
            </motion.h2>
          )}
        </AnimatePresence>

        <p className='aucctus-text-tertiary mb-8 text-center text-sm'>
          {companyRecognitionMessage
            ? 'Preparing your first question...'
            : 'Let us ask you a few questions about your innovation process.'}
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

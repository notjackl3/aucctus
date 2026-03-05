import { motion } from 'framer-motion';
import { cn } from '@libs/utils/react';
import { Check } from 'lucide-react';
import type { IQuestionOption } from '@libs/api/types/valueDiscovery';

interface MultiSelectInputProps {
  options: IQuestionOption[];
  value: string[];
  onChange: (value: string[]) => void;
}

export const MultiSelectInput = ({
  options,
  value,
  onChange,
}: MultiSelectInputProps) => {
  const toggle = (optionValue: string) => {
    if (value.includes(optionValue)) {
      onChange(value.filter((v) => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  return (
    <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
      {options.map((option, i) => {
        const isSelected = value.includes(option.value);
        return (
          <motion.button
            key={option.value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.2 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => toggle(option.value)}
            className={cn(
              'aucctus-border-primary flex items-center gap-3 rounded-xl border p-4 text-left transition-all',
              isSelected
                ? 'aucctus-border-brand aucctus-bg-brand-primary'
                : 'aucctus-bg-primary aucctus-bg-primary-hover',
            )}
          >
            <div
              className={cn(
                'flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition-colors',
                isSelected
                  ? 'aucctus-bg-brand-solid border-transparent'
                  : 'aucctus-border-secondary',
              )}
            >
              {isSelected && <Check size={12} className='text-white' />}
            </div>
            <span
              className={cn(
                'text-sm',
                isSelected
                  ? 'aucctus-text-brand-primary font-medium'
                  : 'aucctus-text-secondary',
              )}
            >
              {option.label}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
};

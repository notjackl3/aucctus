import type { ISharedReportSeed } from '@libs/api/types/sharedReport';
import { motion } from 'framer-motion';
import { Settings, HelpCircle } from 'lucide-react';
import React from 'react';

interface ContextSectionProps {
  seed: ISharedReportSeed | null;
}

const ContextSection: React.FC<ContextSectionProps> = ({ seed }) => {
  if (!seed) {
    return (
      <div className='aucctus-bg-primary aucctus-border-secondary flex items-center justify-center rounded-xl border p-12'>
        <p className='aucctus-text-secondary aucctus-text-sm'>
          Context not available
        </p>
      </div>
    );
  }

  return (
    <div className='flex flex-col gap-6'>
      {/* Seed info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className='aucctus-bg-primary aucctus-border-secondary rounded-xl border p-6 shadow-sm'
      >
        <div className='mb-4 flex items-center gap-2'>
          <Settings className='aucctus-stroke-brand-primary h-5 w-5' />
          <h3 className='aucctus-text-lg-bold aucctus-text-primary'>
            Concept Seed
          </h3>
          <span className='aucctus-text-xs aucctus-text-tertiary rounded-full bg-gray-100 px-2 py-0.5 capitalize'>
            {seed.sourceType.replace(/_/g, ' ')}
          </span>
        </div>

        {seed.title && (
          <div className='mb-3'>
            <p className='aucctus-text-xs aucctus-text-tertiary mb-1 uppercase'>
              Title
            </p>
            <p className='aucctus-text-sm aucctus-text-primary font-medium'>
              {seed.title}
            </p>
          </div>
        )}

        {seed.description && (
          <div className='mb-3'>
            <p className='aucctus-text-xs aucctus-text-tertiary mb-1 uppercase'>
              Description
            </p>
            <p className='aucctus-text-sm aucctus-text-secondary leading-relaxed'>
              {seed.description}
            </p>
          </div>
        )}
      </motion.div>

      {/* Questions & Answers */}
      {seed.answers && seed.answers.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className='mb-4 flex items-center gap-2'>
            <HelpCircle className='aucctus-stroke-brand-primary h-5 w-5' />
            <h3 className='aucctus-text-lg-bold aucctus-text-primary'>
              Questions & Answers
            </h3>
          </div>
          <div className='flex flex-col gap-3'>
            {seed.answers.map((qa, index) => (
              <motion.div
                key={qa.questionIdentifier}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.03 }}
                className='aucctus-bg-primary aucctus-border-secondary rounded-xl border p-5 shadow-sm'
              >
                <p className='aucctus-text-sm-semibold aucctus-text-primary mb-2'>
                  {qa.questionText}
                </p>
                <div className='flex flex-wrap gap-2'>
                  {qa.answer.map((a, i) => (
                    <span
                      key={i}
                      className='aucctus-bg-secondary aucctus-text-sm aucctus-text-secondary rounded-lg px-3 py-1'
                    >
                      {a}
                    </span>
                  ))}
                </div>
                {qa.details && (
                  <p className='aucctus-text-xs aucctus-text-tertiary mt-2 leading-relaxed'>
                    {qa.details}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ContextSection;

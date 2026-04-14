import type { IJTBDJob } from '@libs/api/types/jtbd';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

import { JTBDMasonryColumns } from '../JTBDMasonryColumns';

const JTBDCardsSection: React.FC<{
  jobs: IJTBDJob[];
  isLoading: boolean;
  selectedJobUuid: string | null;
  onCardClick: (job: IJTBDJob) => void;
  onIdeate: (job: IJTBDJob) => Promise<void>;
  ideatingJobUuid: string | null;
}> = ({
  jobs,
  isLoading,
  selectedJobUuid,
  onCardClick,
  onIdeate,
  ideatingJobUuid,
}) => {
  return (
    <div
      className='min-h-screen px-8 pb-24 pt-8'
      style={{ scrollSnapAlign: 'start' }}
    >
      <AnimatePresence mode='wait'>
        {isLoading ? (
          <motion.div
            key='loading'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='py-20 text-center text-lg text-white/30'
          />
        ) : (
          <motion.div
            key='content'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            <JTBDMasonryColumns
              jobs={jobs}
              selectedJobUuid={selectedJobUuid}
              onCardClick={onCardClick}
              onIdeate={onIdeate}
              ideatingJobUuid={ideatingJobUuid}
            />
            {jobs.length === 0 && (
              <div className='py-20 text-center text-lg text-white/40'>
                No jobs match your current filters
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JTBDCardsSection;

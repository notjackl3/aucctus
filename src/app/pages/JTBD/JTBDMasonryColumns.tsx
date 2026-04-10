import type { IJTBDJob } from '@libs/api/types/jtbd';
import { motion } from 'framer-motion';
import React, { useEffect, useMemo, useState } from 'react';

import { JTBDCard } from './JTBDCard';

// ============================================
// Types
// ============================================

interface JTBDMasonryColumnsProps {
  jobs: IJTBDJob[];
  selectedJobUuid: string | null;
  onCardClick: (job: IJTBDJob) => void;
  onIdeate?: (job: IJTBDJob) => void;
  ideatingJobUuid?: string | null;
}

// ============================================
// Responsive column count hook
// ============================================

function useColumnCount(): number {
  const [columns, setColumns] = useState(4);

  useEffect(() => {
    const queries = [
      window.matchMedia('(min-width: 1024px)'),
      window.matchMedia('(min-width: 768px)'),
      window.matchMedia('(min-width: 640px)'),
    ];

    const update = (): void => {
      if (queries[0].matches) setColumns(4);
      else if (queries[1].matches) setColumns(3);
      else if (queries[2].matches) setColumns(2);
      else setColumns(1);
    };

    update();
    queries.forEach((mq) => mq.addEventListener('change', update));
    return () =>
      queries.forEach((mq) => mq.removeEventListener('change', update));
  }, []);

  return columns;
}

// ============================================
// Scroll detection hook (active scrolling state)
// ============================================

function useIsScrolling(): boolean {
  const [isScrolling, setIsScrolling] = useState(false);

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    const handleScroll = (): void => {
      setIsScrolling(true);
      clearTimeout(timeout);
      timeout = setTimeout(() => setIsScrolling(false), 150);
    };

    window.addEventListener('scroll', handleScroll, {
      passive: true,
      capture: true,
    });
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      clearTimeout(timeout);
    };
  }, []);

  return isScrolling;
}

// ============================================
// Shortest-column-first distribution
// ============================================

interface DistributedItem {
  job: IJTBDJob;
  originalIndex: number;
}

function distributeToColumns(
  jobs: IJTBDJob[],
  columnCount: number,
): DistributedItem[][] {
  const columns: DistributedItem[][] = Array.from(
    { length: columnCount },
    () => [],
  );
  const heights = new Array<number>(columnCount).fill(0);

  jobs.forEach((job, index) => {
    // Find column with minimum height (item count as proxy)
    let minCol = 0;
    for (let c = 1; c < columnCount; c++) {
      if (heights[c] < heights[minCol]) minCol = c;
    }
    columns[minCol].push({ job, originalIndex: index });
    heights[minCol] += 1;
  });

  return columns;
}

// ============================================
// Floating animation variants
// ============================================

const floatVariants = {
  float: (staggerIndex: number) => ({
    y: [0, -6, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: 'easeInOut' as const,
      delay: staggerIndex * 0.4,
    },
  }),
  still: {
    y: 0,
    transition: { duration: 0.3 },
  },
};

// ============================================
// JTBDMasonryColumns Component
// ============================================

export const JTBDMasonryColumns: React.FC<JTBDMasonryColumnsProps> = ({
  jobs,
  selectedJobUuid,
  onCardClick,
  onIdeate,
  ideatingJobUuid,
}) => {
  const columnCount = useColumnCount();
  const isScrolling = useIsScrolling();

  const columns = useMemo(
    () => distributeToColumns(jobs, columnCount),
    [jobs, columnCount],
  );

  return (
    <div className='flex gap-6'>
      {columns.map((column, colIndex) => (
        <div key={colIndex} className='flex flex-1 flex-col gap-6'>
          {column.map(({ job, originalIndex }) => (
            <motion.div
              key={job.uuid}
              variants={floatVariants}
              animate={
                isScrolling || selectedJobUuid !== null ? 'still' : 'float'
              }
              custom={originalIndex}
            >
              <JTBDCard
                job={job}
                index={originalIndex}
                isSelected={selectedJobUuid === job.uuid}
                isOther={
                  selectedJobUuid !== null && selectedJobUuid !== job.uuid
                }
                onClick={onCardClick}
                onIdeate={onIdeate}
                isIdeating={ideatingJobUuid === job.uuid}
              />
            </motion.div>
          ))}
        </div>
      ))}
    </div>
  );
};

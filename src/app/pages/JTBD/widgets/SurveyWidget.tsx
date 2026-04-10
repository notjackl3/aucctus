import type { IJTBDCustomWidget } from '@libs/api/types/jtbd';
import { DynamicIcon } from '@libs/utils/iconMap';
import { AnimatePresence, motion } from 'framer-motion';
import { Users } from 'lucide-react';
import React from 'react';

import { ItemSources } from './ItemSources';
import { WidgetHeader } from './WidgetHeader';
import { slideVariants } from './transitions';
import { usePagination } from './usePagination';

interface SurveyWidgetProps {
  widget: IJTBDCustomWidget;
}

export const SurveyWidget: React.FC<SurveyWidgetProps> = ({ widget }) => {
  const items = [...widget.surveyItems].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
  const pagination = usePagination(items.length);

  if (items.length === 0) return null;

  const item = items[pagination.currentIndex];

  return (
    <div>
      <WidgetHeader
        icon={
          <DynamicIcon
            variant={widget.icon || 'clipboard-list'}
            className='h-3.5 w-3.5'
          />
        }
        label={widget.title || 'Research'}
        description={widget.description}
        pagination={{
          currentIndex: pagination.currentIndex,
          total: pagination.total,
          onPrev: pagination.prev,
          onNext: pagination.next,
          canPrev: pagination.canPrev,
          canNext: pagination.canNext,
        }}
      />

      <div className='overflow-hidden'>
        <AnimatePresence mode='wait' custom={pagination.direction}>
          <motion.div
            key={item.uuid}
            custom={pagination.direction}
            variants={slideVariants}
            initial='enter'
            animate='center'
            exit='exit'
            transition={{ duration: 0.25, ease: 'easeInOut' }}
          >
            <h4 className='mb-2 text-base font-semibold leading-snug text-white/80'>
              {item.question}
            </h4>
            <p className='mb-3 text-[11px] leading-relaxed text-white/40'>
              {item.responseSummary}
            </p>

            <div className='flex items-center justify-between'>
              <ItemSources sources={item.sources} />
              {item.sampleSize != null && (
                <div className='flex items-center gap-1 text-[10px] text-white/30'>
                  <Users className='h-3 w-3' />
                  <span>n={item.sampleSize}</span>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

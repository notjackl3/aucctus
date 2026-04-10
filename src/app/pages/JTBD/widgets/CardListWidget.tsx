import type { IJTBDCustomWidget } from '@libs/api/types/jtbd';
import { DynamicIcon } from '@libs/utils/iconMap';
import { cn } from '@libs/utils/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, X as XIcon } from 'lucide-react';
import React, { useState } from 'react';

import { ItemSources } from './ItemSources';
import { WidgetHeader } from './WidgetHeader';

interface CardListWidgetProps {
  widget: IJTBDCustomWidget;
}

export const CardListWidget: React.FC<CardListWidgetProps> = ({ widget }) => {
  const items = [...widget.cardListItems].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
  const [expandedUuid, setExpandedUuid] = useState<string | null>(null);

  if (items.length === 0) return null;

  return (
    <div>
      <WidgetHeader
        icon={
          <DynamicIcon
            variant={widget.icon || 'list'}
            className='h-3.5 w-3.5'
          />
        }
        label={widget.title || 'Findings'}
        description={widget.description}
      />
      <div className='space-y-2'>
        {items.map((item, index) => {
          const isExpanded = expandedUuid === item.uuid;
          const hasProsOrCons = item.pros.length > 0 || item.cons.length > 0;

          return (
            <motion.div
              key={item.uuid}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className='overflow-hidden rounded-lg border border-white/[0.08] bg-white/[0.03]'
            >
              <button
                onClick={() => setExpandedUuid(isExpanded ? null : item.uuid)}
                className='flex w-full items-start gap-3 p-3 text-left transition-colors hover:bg-white/[0.03]'
              >
                <div className='min-w-0 flex-1'>
                  <h4 className='text-sm font-medium leading-snug text-white/80'>
                    {item.title}
                  </h4>
                  <p className='mt-1 line-clamp-2 text-xs text-white/45'>
                    {item.description}
                  </p>
                  <ItemSources sources={item.sources} />
                </div>
                {hasProsOrCons && (
                  <ChevronDown
                    className={cn(
                      'mt-0.5 h-4 w-4 shrink-0 text-white/30 transition-transform',
                      isExpanded && 'rotate-180',
                    )}
                  />
                )}
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && hasProsOrCons && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className='overflow-hidden'
                  >
                    <div className='grid grid-cols-2 gap-3 px-3 pb-3'>
                      {item.pros.length > 0 && (
                        <div>
                          <div className='mb-1.5 flex items-center gap-1'>
                            <Check className='h-3 w-3 text-emerald-400' />
                            <span className='text-[10px] font-semibold uppercase tracking-wider text-emerald-400'>
                              Pros
                            </span>
                          </div>
                          <ul className='space-y-1'>
                            {item.pros.map((pro, i) => (
                              <li
                                key={i}
                                className='text-[11px] leading-snug text-white/50'
                              >
                                {pro}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {item.cons.length > 0 && (
                        <div>
                          <div className='mb-1.5 flex items-center gap-1'>
                            <XIcon className='h-3 w-3 text-red-400' />
                            <span className='text-[10px] font-semibold uppercase tracking-wider text-red-400'>
                              Cons
                            </span>
                          </div>
                          <ul className='space-y-1'>
                            {item.cons.map((con, i) => (
                              <li
                                key={i}
                                className='text-[11px] leading-snug text-white/50'
                              >
                                {con}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

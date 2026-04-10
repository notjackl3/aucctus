import type { IJTBDCustomWidget } from '@libs/api/types/jtbd';
import { DynamicIcon } from '@libs/utils/iconMap';
import { cn } from '@libs/utils/react';
import { motion } from 'framer-motion';
import { MessageCircle } from 'lucide-react';
import React, { useCallback, useRef } from 'react';

import { SourcePill } from './SourcePill';
import { WidgetHeader } from './WidgetHeader';
import { platformIcons } from './platformIcons';

function relativeTime(iso: string | null): string | null {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

interface SocialPostWidgetProps {
  widget: IJTBDCustomWidget;
}

export const SocialPostWidget: React.FC<SocialPostWidgetProps> = ({
  widget,
}) => {
  const items = [...widget.socialPostItems].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const amount = 260;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    });
  }, []);

  if (items.length === 0) return null;

  return (
    <div>
      <WidgetHeader
        icon={
          <DynamicIcon
            variant={widget.icon || 'message-circle'}
            className='h-3.5 w-3.5'
          />
        }
        label={widget.title || 'Social Listening'}
        description={widget.description}
        metadata={`${items.length} posts`}
        pagination={
          items.length > 2
            ? {
                currentIndex: 0,
                total: 1,
                onPrev: () => scroll('left'),
                onNext: () => scroll('right'),
                canPrev: true,
                canNext: true,
              }
            : undefined
        }
      />

      <div
        ref={scrollRef}
        className='scrollbar-hide flex gap-3 overflow-x-auto pb-1'
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {items.map((item, index) => {
          const platform = platformIcons[item.platform];
          const time = relativeTime(item.postedAt);

          return (
            <motion.div
              key={item.uuid}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              className={cn(
                'w-[240px] flex-none rounded-lg border p-3.5',
                platform.bg,
              )}
              style={{ scrollSnapAlign: 'start' }}
            >
              <div className='mb-2 flex items-center gap-1.5'>
                <div
                  className={cn('flex items-center gap-1.5', platform.color)}
                >
                  {platform.glyph}
                  <span className='text-[10px] font-semibold uppercase tracking-wider'>
                    {item.platform}
                  </span>
                </div>
              </div>

              <p className='mb-3 line-clamp-4 text-xs leading-relaxed text-white/70'>
                &ldquo;{item.content}&rdquo;
              </p>

              <div className='border-t border-white/[0.06] pt-2'>
                <div className='flex items-center justify-between text-[10px] text-white/30'>
                  <div className='flex items-center gap-1.5'>
                    <span className='font-medium text-white/50'>
                      {item.author}
                    </span>
                    {item.subredditOrChannel && (
                      <>
                        <span>&middot;</span>
                        <span>{item.subredditOrChannel}</span>
                      </>
                    )}
                  </div>
                  <div className='flex items-center gap-2'>
                    {time && <span>{time}</span>}
                    {item.engagementCount > 0 && (
                      <div className='flex items-center gap-1'>
                        <MessageCircle className='h-3 w-3' />
                        <span>{item.engagementCount}</span>
                      </div>
                    )}
                  </div>
                </div>
                {item.sourceUrl && (
                  <div className='mt-1.5'>
                    <SourcePill source={item.platform} url={item.sourceUrl} />
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

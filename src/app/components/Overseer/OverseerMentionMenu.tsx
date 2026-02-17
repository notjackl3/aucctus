import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import { MentionItem } from '@stores/overseer/types';
import React, { useEffect, useMemo, useRef, useState } from 'react';

interface OverseerMentionMenuProps {
  query: string;
  onSelect: (item: MentionItem) => void;
  onClose: () => void;
  visible: boolean;
  concepts?: MentionItem[];
}

const OverseerMentionMenu: React.FC<OverseerMentionMenuProps> = ({
  query,
  onSelect,
  onClose,
  visible,
  concepts = [],
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const q = query.toLowerCase();

  const filteredConcepts = useMemo(() => {
    return concepts.filter((c) => c.name.toLowerCase().includes(q));
  }, [q, concepts]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, filteredConcepts.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && filteredConcepts.length > 0) {
        e.preventDefault();
        onSelect(filteredConcepts[activeIndex]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [visible, activeIndex, filteredConcepts, onSelect, onClose]);

  if (!visible || filteredConcepts.length === 0) return null;

  return (
    <div
      ref={menuRef}
      className='absolute bottom-full left-0 right-0 z-50 mb-0 max-h-[140px] overflow-y-auto rounded-lg rounded-b-none border border-b-0 border-white/15 bg-black/90 shadow-2xl backdrop-blur-xl'
    >
      <div className='flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-white/30'>
        <Icon
          variant='lightbulb'
          width={12}
          height={12}
          className='stroke-current'
        />
        Concept Bank
      </div>
      {filteredConcepts.map((item, i) => (
        <button
          key={item.id}
          onClick={() => onSelect(item)}
          className={cn(
            'flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] transition-colors',
            i === activeIndex
              ? 'bg-white/[0.12] text-white'
              : 'text-white/60 hover:bg-white/[0.08] hover:text-white/80',
          )}
        >
          <span className='flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20'>
            <Icon
              variant='lightbulb'
              width={12}
              height={12}
              className='stroke-amber-300'
            />
          </span>
          <span className='flex-1 truncate'>{item.name}</span>
        </button>
      ))}
    </div>
  );
};

export default OverseerMentionMenu;

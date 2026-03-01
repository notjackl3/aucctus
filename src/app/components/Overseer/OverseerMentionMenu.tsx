import { cn } from '@libs/utils/react';
import { MentionItem } from '@stores/overseer/types';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Lightbulb, Users } from 'lucide-react';

interface OverseerMentionMenuProps {
  query: string;
  onSelect: (item: MentionItem) => void;
  onClose: () => void;
  visible: boolean;
  concepts?: MentionItem[];
  personas?: MentionItem[];
}

const OverseerMentionMenu: React.FC<OverseerMentionMenuProps> = ({
  query,
  onSelect,
  onClose,
  visible,
  concepts = [],
  personas = [],
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const q = query.toLowerCase();

  const filteredPersonas = useMemo(() => {
    return personas.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.segment?.toLowerCase().includes(q),
    );
  }, [q, personas]);

  const filteredConcepts = useMemo(() => {
    return concepts.filter((c) => c.name.toLowerCase().includes(q));
  }, [q, concepts]);

  const allItems = useMemo(
    () => [...filteredPersonas, ...filteredConcepts],
    [filteredPersonas, filteredConcepts],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => Math.min(i + 1, allItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && allItems.length > 0) {
        e.preventDefault();
        onSelect(allItems[activeIndex]);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [visible, activeIndex, allItems, onSelect, onClose]);

  if (!visible || allItems.length === 0) return null;

  return (
    <div
      ref={menuRef}
      className='absolute bottom-full left-0 right-0 z-50 mb-0 max-h-[140px] overflow-y-auto rounded-lg rounded-b-none border border-b-0 border-white/15 bg-black/90 shadow-2xl backdrop-blur-xl'
    >
      {/* Living Personas section */}
      {filteredPersonas.length > 0 && (
        <>
          <div className='flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-white/30'>
            <Users className='h-3 w-3' />
            Living Personas
          </div>
          {filteredPersonas.map((item, i) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className={cn(
                'flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] transition-colors',
                i === activeIndex
                  ? 'text-white'
                  : 'text-white/60 hover:text-white/80',
              )}
            >
              {item.avatar ? (
                <img
                  src={item.avatar}
                  alt={item.name}
                  className='h-5 w-5 shrink-0 rounded-full object-cover'
                />
              ) : (
                <span className='flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-[9px] font-bold text-purple-300'>
                  {item.name.charAt(0)}
                </span>
              )}
              <span className='flex-1 truncate'>{item.name}</span>
              {item.segment && (
                <span className='max-w-[100px] shrink-0 truncate text-[9px] text-white/30'>
                  {item.segment}
                </span>
              )}
            </button>
          ))}
        </>
      )}

      {/* Concept Bank section */}
      {filteredConcepts.length > 0 && (
        <>
          <div className='flex items-center gap-1.5 border-t border-white/[0.08] px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-white/30'>
            <Lightbulb className='h-3 w-3' />
            Concept Bank
          </div>
          {filteredConcepts.map((item, i) => {
            const globalIndex = filteredPersonas.length + i;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] transition-colors',
                  globalIndex === activeIndex
                    ? 'text-white'
                    : 'text-white/60 hover:text-white/80',
                )}
              >
                <span className='flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20'>
                  <Lightbulb className='h-3 w-3 stroke-amber-300' />
                </span>
                <span className='flex-1 truncate'>{item.name}</span>
              </button>
            );
          })}
        </>
      )}
    </div>
  );
};

export default OverseerMentionMenu;

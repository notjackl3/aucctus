import { cn } from '@libs/utils/react';
import { MentionItem } from '@stores/overseer/types';
import { Lightbulb, Users } from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';

export interface MentionMenuSection {
  label: string;
  icon: React.ReactNode;
  items: MentionItem[];
}

export interface MentionMenuProps {
  query: string;
  onSelect: (item: MentionItem) => void;
  onClose: () => void;
  visible: boolean;
  sections: MentionMenuSection[];
  className?: string;
  itemClassName?: string;
  activeItemClassName?: string;
  inactiveItemClassName?: string;
  sectionLabelClassName?: string;
  sectionDividerClassName?: string;
  avatarFallbackClassName?: string;
  segmentClassName?: string;
}

/**
 * Shared MentionMenu component with keyboard navigation.
 * Renders filterable sections of mention items with arrow key navigation,
 * Enter to select, and Escape to close.
 */
const MentionMenu: React.FC<MentionMenuProps> = ({
  query,
  onSelect,
  onClose,
  visible,
  sections,
  className,
  itemClassName = 'flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] transition-colors',
  activeItemClassName = 'text-white',
  inactiveItemClassName = 'text-white/60 hover:text-white/80',
  sectionLabelClassName = 'flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-white/70',
  sectionDividerClassName = 'border-t border-white/[0.08]',
  avatarFallbackClassName = 'flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/20 text-[9px] font-bold text-purple-300',
  segmentClassName = 'max-w-[100px] shrink-0 truncate text-[9px] text-white/70',
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const menuRef = useRef<HTMLDivElement>(null);
  const q = query.toLowerCase();

  // Filter items in each section
  const filteredSections = useMemo(() => {
    return sections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.segment?.toLowerCase().includes(q),
        ),
      }))
      .filter((section) => section.items.length > 0);
  }, [q, sections]);

  // Flatten all filtered items for keyboard navigation
  const allItems = useMemo(
    () => filteredSections.flatMap((s) => s.items),
    [filteredSections],
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

  let globalIndex = 0;

  return (
    <div ref={menuRef} className={className}>
      {filteredSections.map((section, sectionIdx) => (
        <React.Fragment key={section.label}>
          <div
            className={cn(
              sectionLabelClassName,
              sectionIdx > 0 && sectionDividerClassName,
            )}
          >
            {section.icon}
            {section.label}
          </div>
          {section.items.map((item) => {
            const currentIndex = globalIndex++;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className={cn(
                  itemClassName,
                  currentIndex === activeIndex
                    ? activeItemClassName
                    : inactiveItemClassName,
                )}
              >
                {item.type === 'persona' ? (
                  item.avatar ? (
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className='h-5 w-5 shrink-0 rounded-full object-cover'
                    />
                  ) : (
                    <span className={avatarFallbackClassName}>
                      {item.name.charAt(0)}
                    </span>
                  )
                ) : (
                  <span className='flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20'>
                    <Lightbulb className='h-3 w-3 stroke-amber-300' />
                  </span>
                )}
                <span className='flex-1 truncate'>{item.name}</span>
                {item.segment && (
                  <span className={segmentClassName}>{item.segment}</span>
                )}
              </button>
            );
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

export default MentionMenu;

/**
 * Helper to build standard persona + concept sections.
 */
export function buildMentionSections(
  personas: MentionItem[] = [],
  concepts: MentionItem[] = [],
): MentionMenuSection[] {
  const sections: MentionMenuSection[] = [];
  if (personas.length > 0) {
    sections.push({
      label: 'Living Personas',
      icon: <Users className='h-3 w-3' />,
      items: personas,
    });
  }
  if (concepts.length > 0) {
    sections.push({
      label: 'Concept Bank',
      icon: <Lightbulb className='h-3 w-3' />,
      items: concepts,
    });
  }
  return sections;
}

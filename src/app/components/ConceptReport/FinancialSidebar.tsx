import { ComponentTooltip, GlassSurface } from '@components';
import { motion } from 'framer-motion';
import { Building, CircleDollarSign, TrendingUp } from 'lucide-react';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

interface FinancialSection {
  id: string;
  label: string;
  icon: React.ElementType;
}

const SECTIONS: FinancialSection[] = [
  { id: 'business-model', label: 'Business Model', icon: Building },
  { id: 'market-sizing', label: 'Market Sizing', icon: CircleDollarSign },
  { id: 'projections', label: 'Projections', icon: TrendingUp },
];

interface FinancialSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

const FinancialSidebar: React.FC<FinancialSidebarProps> = ({
  activeSection,
  onSectionChange,
}) => {
  const [expanded, setExpanded] = useState(false);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({
    top: 0,
    height: 0,
    width: 0,
    left: 0,
  });

  const recalcIndicator = useCallback(() => {
    const activeIndex = SECTIONS.findIndex((s) => s.id === activeSection);
    const activeEl = sectionRefs.current[activeIndex];
    const containerEl = listRef.current;

    if (!activeEl || !containerEl) return;

    const containerRect = containerEl.getBoundingClientRect();
    const activeRect = activeEl.getBoundingClientRect();

    const next = {
      top: activeRect.top - containerRect.top,
      height: activeRect.height,
      width: activeRect.width,
      left: activeRect.left - containerRect.left,
    };

    setIndicatorStyle((prev) => {
      if (
        prev.top === next.top &&
        prev.height === next.height &&
        prev.width === next.width &&
        prev.left === next.left
      )
        return prev;
      return next;
    });
  }, [activeSection]);

  useLayoutEffect(() => {
    recalcIndicator();
  }, [recalcIndicator, expanded]);

  useEffect(() => {
    const t = window.setTimeout(() => recalcIndicator(), 240);
    return () => window.clearTimeout(t);
  }, [activeSection, expanded, recalcIndicator]);

  useEffect(() => {
    const onResize = () => recalcIndicator();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [recalcIndicator]);

  return (
    <div
      className='flex-shrink-0 transition-all duration-200 ease-in-out'
      style={{ width: expanded ? '200px' : '52px' }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onTransitionEnd={(e) => {
        if (e.propertyName === 'width') recalcIndicator();
      }}
    >
      <GlassSurface className='sticky top-4 w-full overflow-hidden'>
        <div className='p-2'>
          {/* Header - Expanded only */}
          <div
            style={{
              opacity: expanded ? 1 : 0,
              height: expanded ? '24px' : 0,
              marginBottom: expanded ? '8px' : 0,
              overflow: 'hidden',
              transition:
                'opacity 150ms ease-out, height 200ms ease-out, margin 200ms ease-out',
            }}
          >
            <span className='aucctus-text-tertiary whitespace-nowrap text-xs font-medium uppercase tracking-wide'>
              Financial
            </span>
          </div>

          {/* Section list with sliding indicator */}
          <div ref={listRef} className='relative'>
            <motion.div
              className='aucctus-border-primary aucctus-bg-secondary pointer-events-none absolute z-0 rounded-lg border'
              initial={false}
              animate={{
                top: indicatorStyle.top,
                height: indicatorStyle.height,
                width: indicatorStyle.width,
                left: indicatorStyle.left,
              }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
            />

            <div className='relative z-10 flex flex-col gap-1'>
              {SECTIONS.map((section, index) => {
                const Icon = section.icon;
                const isActive = section.id === activeSection;

                const sectionItem = (
                  <div
                    ref={(el) => {
                      sectionRefs.current[index] = el;
                    }}
                    onClick={() => onSectionChange(section.id)}
                    className={`flex cursor-pointer items-center rounded-lg transition-colors ${
                      isActive
                        ? 'aucctus-text-brand-primary'
                        : 'aucctus-text-tertiary aucctus-bg-secondary-hover hover:aucctus-text-secondary'
                    }`}
                    style={{
                      padding: expanded ? '8px 10px' : '8px',
                      justifyContent: expanded ? 'flex-start' : 'center',
                      gap: expanded ? '10px' : '0',
                    }}
                  >
                    <Icon className='h-4 w-4 flex-shrink-0' />
                    <div
                      className='flex min-w-0 flex-1 items-center justify-between'
                      style={{
                        opacity: expanded ? 1 : 0,
                        width: expanded ? 'auto' : 0,
                        overflow: 'hidden',
                        transition: 'opacity 150ms ease-out',
                      }}
                    >
                      <span className='truncate whitespace-nowrap text-sm font-medium'>
                        {section.label}
                      </span>
                    </div>
                  </div>
                );

                if (!expanded) {
                  return (
                    <ComponentTooltip key={section.id} tip={section.label}>
                      {sectionItem}
                    </ComponentTooltip>
                  );
                }

                return (
                  <React.Fragment key={section.id}>
                    {sectionItem}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </GlassSurface>
    </div>
  );
};

export default FinancialSidebar;

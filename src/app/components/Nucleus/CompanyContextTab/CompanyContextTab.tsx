/**
 * CompanyContextTab - Company Context tab with icon sidebar navigation
 *
 * Displays a compact icon sidebar for switching between sub-sections:
 * - Intelligence: Status pills + CategoriesGrid
 * - Data & Uploads: UploadsTab component
 *
 * Uses URL params (?section=) for sub-navigation state.
 */

import { ComponentTooltip, GlassSurface } from '@components';
import type {
  NucleusReportQuestion,
  NucleusReportSection,
  OverviewStatus,
  SectionType,
} from '@libs/api/types';
import { cn } from '@libs/utils/react';
import { motion } from 'framer-motion';
import { Database, LayoutDashboard, Palette, Radar } from 'lucide-react';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import { CategoriesGrid } from '../CategoriesGrid';
import OverviewTab from '../OverviewTab/OverviewTab';
import PersonalizationTab from '../PersonalizationTab/PersonalizationTab';
import type { CategoryState, QuestionState } from '../StatusDropdown';
import { UploadsTab } from '../UploadsTab';

/** Sub-section identifiers */
type ContextSection =
  | 'overview'
  | 'intelligence'
  | 'data-uploads'
  | 'personalization';

/** Sidebar item configuration */
interface SidebarItem {
  id: ContextSection;
  icon: React.ElementType;
  label: string;
}

/** Build sidebar items based on access level */
const getSidebarItems = (isAucctusAdmin: boolean): SidebarItem[] => [
  ...(isAucctusAdmin
    ? [{ id: 'overview' as const, icon: LayoutDashboard, label: 'Overview' }]
    : []),
  { id: 'intelligence', icon: Radar, label: 'Intelligence' },
  { id: 'data-uploads', icon: Database, label: 'Data & Uploads' },
  ...(isAucctusAdmin
    ? [
        {
          id: 'personalization' as const,
          icon: Palette,
          label: 'Personalization',
        },
      ]
    : []),
];

/** Category state info returned by getCategoryStateInfo */
interface CategoryStateInfo {
  state: CategoryState;
  validated: number;
  newDetails: number;
  needsInput: number;
  totalSources: number;
}

/** State config returned by getStateConfig */
interface StateConfig {
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
  label: string;
}

/** Props for the CompanyContextTab component */
export interface CompanyContextTabProps {
  allSections: NucleusReportSection[];
  reportSections: NucleusReportSection[];
  expandedCategory: string | null;
  setExpandedCategory: (categoryId: string | null) => void;
  getCategoryStateInfo: (section: NucleusReportSection) => CategoryStateInfo;
  getStateConfig: (state: CategoryState | QuestionState) => StateConfig;
  sectionTypeDisplayNames: Record<SectionType, string>;
  setCategoryStatusOverrides: React.Dispatch<
    React.SetStateAction<Record<string, CategoryState>>
  >;
  activeDropdown: string | null;
  setActiveDropdown: (id: string | null) => void;
  questionStatusOverrides: Record<string, QuestionState>;
  handleQuestionStatusChange: (
    questionId: string,
    newStatus: QuestionState,
  ) => void;
  handleSectionStatusChange: (
    sectionId: string,
    newStatus: CategoryState,
  ) => void;
  getQuestionState: (question: NucleusReportQuestion) => QuestionState;
  reportUuid: string;
  overviewStatus?: OverviewStatus;
  isAdmin: boolean;
  isAucctusAdmin: boolean;
  onNavigateToCategory: (categoryId: string) => void;
}

const CompanyContextTab: React.FC<CompanyContextTabProps> = ({
  allSections,
  reportSections,
  expandedCategory,
  setExpandedCategory,
  getCategoryStateInfo,
  getStateConfig,
  setCategoryStatusOverrides,
  activeDropdown,
  setActiveDropdown,
  questionStatusOverrides,
  handleQuestionStatusChange,
  handleSectionStatusChange,
  getQuestionState,
  reportUuid,
  overviewStatus,
  isAdmin,
  isAucctusAdmin: isAucctusAdminProp,
  onNavigateToCategory,
}) => {
  const sidebarItems = useMemo(
    () => getSidebarItems(isAucctusAdminProp),
    [isAucctusAdminProp],
  );
  const [searchParams, setSearchParams] = useSearchParams();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const listRef = useRef<HTMLDivElement | null>(null);
  const [indicatorStyle, setIndicatorStyle] = useState({
    top: 0,
    height: 0,
    width: 0,
    left: 0,
  });

  const defaultSection: ContextSection = isAucctusAdminProp
    ? 'overview'
    : 'intelligence';
  const activeSection: ContextSection =
    (searchParams.get('section') as ContextSection) || defaultSection;

  const setActiveSection = useCallback(
    (section: ContextSection) => {
      const newParams = new URLSearchParams(searchParams);
      if (section === 'overview') {
        newParams.delete('section');
      } else {
        newParams.set('section', section);
      }
      setSearchParams(newParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );

  // Sliding indicator position calculation
  const recalcIndicator = useCallback(() => {
    const activeIndex = sidebarItems.findIndex((s) => s.id === activeSection);
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
      ) {
        return prev;
      }
      return next;
    });
  }, [activeSection, sidebarItems]);

  useLayoutEffect(() => {
    recalcIndicator();
  }, [recalcIndicator, sidebarExpanded]);

  useEffect(() => {
    const t = window.setTimeout(() => recalcIndicator(), 240);
    return () => window.clearTimeout(t);
  }, [activeSection, sidebarExpanded, recalcIndicator]);

  useEffect(() => {
    const onResize = () => recalcIndicator();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [recalcIndicator]);

  // Memoize getCategoryStateInfo wrapper for CategoriesGrid
  const getCategoryStateInfoById = useMemo(
    () => (categoryId: string) => {
      const section = reportSections.find(
        (s: NucleusReportSection) => s.sectionType === categoryId,
      );
      return section
        ? getCategoryStateInfo(section)
        : {
            state: 'needs_input' as CategoryState,
            validated: 0,
            newDetails: 0,
            needsInput: 0,
            totalSources: 0,
          };
    },
    [reportSections, getCategoryStateInfo],
  );

  return (
    <div className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
      <div className='flex gap-4'>
        {/* Left Sidebar - Expandable on hover */}
        <div
          className='flex-shrink-0 transition-all duration-200 ease-in-out'
          style={{ width: sidebarExpanded ? '200px' : '52px' }}
          onMouseEnter={() => setSidebarExpanded(true)}
          onMouseLeave={() => setSidebarExpanded(false)}
          onTransitionEnd={(e) => {
            if (e.propertyName === 'width') recalcIndicator();
          }}
        >
          <GlassSurface
            as='nav'
            className='sticky top-6 w-full overflow-hidden'
            variant='default'
          >
            <div className='p-2'>
              {/* Header - visible when expanded */}
              <div
                style={{
                  opacity: sidebarExpanded ? 1 : 0,
                  height: sidebarExpanded ? '24px' : 0,
                  marginBottom: sidebarExpanded ? '8px' : 0,
                  overflow: 'hidden',
                  transition:
                    'opacity 150ms ease-out, height 200ms ease-out, margin 200ms ease-out',
                }}
              >
                <span className='aucctus-text-xs-medium aucctus-text-tertiary whitespace-nowrap uppercase tracking-wide'>
                  Sections
                </span>
              </div>

              {/* Section list with sliding indicator */}
              <div ref={listRef} className='relative'>
                {/* Sliding selection indicator */}
                <motion.div
                  className='aucctus-border-primary aucctus-bg-secondary pointer-events-none absolute z-0 rounded-lg border'
                  initial={false}
                  animate={{
                    top: indicatorStyle.top,
                    height: indicatorStyle.height,
                    width: indicatorStyle.width,
                    left: indicatorStyle.left,
                  }}
                  transition={{
                    type: 'spring',
                    stiffness: 500,
                    damping: 35,
                  }}
                />

                <div className='relative z-10 flex flex-col gap-1'>
                  {sidebarItems.map((item, index) => {
                    const SidebarIcon = item.icon;
                    const isActive = activeSection === item.id;

                    const button = (
                      <div
                        ref={(el) => {
                          sectionRefs.current[index] = el;
                        }}
                        onClick={() => setActiveSection(item.id)}
                        className={cn(
                          'flex cursor-pointer items-center rounded-lg transition-colors',
                          isActive
                            ? 'aucctus-text-brand-primary'
                            : 'aucctus-text-tertiary aucctus-bg-primary-hover hover:aucctus-text-secondary',
                        )}
                        style={{
                          padding: sidebarExpanded ? '8px 10px' : '8px',
                          justifyContent: sidebarExpanded
                            ? 'flex-start'
                            : 'center',
                          gap: sidebarExpanded ? '10px' : '0',
                        }}
                      >
                        <SidebarIcon className='h-4 w-4 flex-shrink-0' />
                        <div
                          className='flex min-w-0 flex-1 items-center'
                          style={{
                            opacity: sidebarExpanded ? 1 : 0,
                            width: sidebarExpanded ? 'auto' : 0,
                            overflow: 'hidden',
                            transition: 'opacity 150ms ease-out',
                          }}
                        >
                          <span className='aucctus-text-sm-medium truncate whitespace-nowrap'>
                            {item.label}
                          </span>
                        </div>
                      </div>
                    );

                    if (!sidebarExpanded) {
                      return (
                        <ComponentTooltip key={item.id} tip={item.label}>
                          {button}
                        </ComponentTooltip>
                      );
                    }

                    return (
                      <React.Fragment key={item.id}>{button}</React.Fragment>
                    );
                  })}
                </div>
              </div>
            </div>
          </GlassSurface>
        </div>

        {/* Main Content Area */}
        <div className='min-w-0 flex-1'>
          {isAucctusAdminProp && activeSection === 'overview' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <OverviewTab
                reportUuid={reportUuid}
                overviewStatus={overviewStatus}
              />
            </motion.div>
          )}

          {activeSection === 'intelligence' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              data-tab='categories'
            >
              <CategoriesGrid
                allCategories={allSections}
                expandedCategory={expandedCategory}
                setExpandedCategory={setExpandedCategory}
                getCategoryStateInfo={getCategoryStateInfoById}
                getStateConfig={getStateConfig}
                setCategoryStatusOverrides={setCategoryStatusOverrides}
                activeDropdown={activeDropdown}
                setActiveDropdown={setActiveDropdown}
                questionStatusOverrides={questionStatusOverrides}
                handleQuestionStatusChange={handleQuestionStatusChange}
                handleSectionStatusChange={handleSectionStatusChange}
                getQuestionState={getQuestionState}
                reportUuid={reportUuid}
                isAdmin={isAdmin}
              />
            </motion.div>
          )}

          {activeSection === 'data-uploads' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <UploadsTab onNavigateToCategory={onNavigateToCategory} />
            </motion.div>
          )}

          {isAucctusAdminProp && activeSection === 'personalization' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <PersonalizationTab />
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompanyContextTab;

/**
 * LivingPersonasTab - Living Personas Tab Component
 *
 * Main tab content for the Living Personas feature within the Nucleus page.
 * Displays a collapsible sidebar of personas and main content area for the selected persona.
 *
 * Layout:
 * - Left sidebar (68px collapsed → 240px expanded on hover) with sliding indicator
 * - Main content area for selected persona details
 * - Dynamic color theming based on selected persona's avatar
 */

import { ComponentTooltip, GlassSurface, Icon } from '@components';
import { usePersonas } from '@hooks/query/persona.hook';
import type { IPersonaListItem } from '@libs/api/types/persona';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useSearchParams } from 'react-router-dom';
import PersonaDetailView from './PersonaDetailView';
import PersonaSidebarItem from './PersonaSidebarItem';
import { CreatePersonaModal, LivingPersonasInitModal } from './modals';

/** Props for the LivingPersonasTab component */
export interface LivingPersonasTabProps {
  /** Optional callback when persona is selected */
  onPersonaSelect?: (uuid: string | null) => void;
}

/** Sidebar loading skeleton */
const SidebarSkeleton: React.FC = () => (
  <div className='flex flex-col items-center gap-2'>
    {Array.from({ length: 4 }).map((_, i) => (
      <div
        key={i}
        className='aucctus-bg-secondary h-12 w-12 animate-pulse rounded-lg'
      />
    ))}
  </div>
);

/** Sidebar width constants */
const SIDEBAR_COLLAPSED = 68;
const SIDEBAR_EXPANDED = 240;

/**
 * LivingPersonasTab Component
 *
 * Main container for the Living Personas feature with:
 * - Collapsible glass morphic sidebar with sliding indicator
 * - Main content area for selected persona
 * - Dynamic color theming
 * - API-driven data with loading and error states
 */
const LivingPersonasTab: React.FC<LivingPersonasTabProps> = ({
  onPersonaSelect,
}) => {
  // Fetch personas from API
  const { personas, isLoading, isError, refetch } = usePersonas();

  // URL search params for shareable persona selection
  const [searchParams, setSearchParams] = useSearchParams();
  const personaUuidFromUrl = searchParams.get('persona');

  // Modal states
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isInitModalOpen, setIsInitModalOpen] = useState(true);

  // Active persona selection - synced with URL params
  const [activePersonaUuid, setActivePersonaUuid] = useState<string | null>(
    personaUuidFromUrl,
  );

  // Sidebar expanded state (hover)
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  // Refs for sliding indicator calculation
  const sidebarContainerRef = useRef<HTMLDivElement>(null);
  const personaItemRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  // Sliding indicator position
  const [indicatorStyle, setIndicatorStyle] = useState({
    top: 0,
    height: 0,
    width: 0,
    left: 0,
  });

  // Sliding indicator position calculation
  const recalcIndicator = useCallback(() => {
    if (!activePersonaUuid) return;

    const activeEl = personaItemRefs.current.get(activePersonaUuid);
    const containerEl = sidebarContainerRef.current;

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
  }, [activePersonaUuid]);

  useLayoutEffect(() => {
    recalcIndicator();
  }, [recalcIndicator, sidebarExpanded]);

  useEffect(() => {
    const t = window.setTimeout(() => recalcIndicator(), 240);
    return () => window.clearTimeout(t);
  }, [activePersonaUuid, sidebarExpanded, recalcIndicator]);

  useEffect(() => {
    const onResize = () => recalcIndicator();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [recalcIndicator]);

  // Sync active persona with URL params and loaded data
  useEffect(() => {
    if (isLoading || personas.length === 0) return;

    if (personaUuidFromUrl) {
      const exists = personas.some((p) => p.uuid === personaUuidFromUrl);
      if (exists) {
        if (activePersonaUuid !== personaUuidFromUrl) {
          setActivePersonaUuid(personaUuidFromUrl);
        }
        return;
      }
    }

    if (
      activePersonaUuid &&
      personas.some((p) => p.uuid === activePersonaUuid)
    ) {
      return;
    }

    const firstUuid = personas[0].uuid;
    setActivePersonaUuid(firstUuid);
    setSearchParams(
      (prev) => {
        prev.set('persona', firstUuid);
        return prev;
      },
      { replace: true },
    );
  }, [
    isLoading,
    personas,
    personaUuidFromUrl,
    activePersonaUuid,
    setSearchParams,
  ]);

  // Get the active persona data from API response
  const activePersona = useMemo(
    () => personas.find((p) => p.uuid === activePersonaUuid) ?? null,
    [personas, activePersonaUuid],
  );

  // Handle persona selection - update state and URL
  const handlePersonaSelect = useCallback(
    (uuid: string) => {
      setActivePersonaUuid(uuid);
      setSearchParams(
        (prev) => {
          prev.set('persona', uuid);
          return prev;
        },
        { replace: true },
      );
      onPersonaSelect?.(uuid);
    },
    [onPersonaSelect, setSearchParams],
  );

  // Handle add persona click
  const handleAddPersona = useCallback(() => {
    setIsCreateModalOpen(true);
  }, []);

  // Handle persona creation success
  const handleCreateSuccess = useCallback(
    (personaUuid: string) => {
      setIsCreateModalOpen(false);
      handlePersonaSelect(personaUuid);
    },
    [handlePersonaSelect],
  );

  // Dynamic CSS variable for persona color theming
  const personaColorStyle = useMemo(
    () =>
      activePersona?.themeColor
        ? ({
            '--persona-color': activePersona.themeColor,
          } as React.CSSProperties)
        : undefined,
    [activePersona?.themeColor],
  );

  // Loading state
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className='mx-auto px-4 py-6 sm:px-6 lg:px-8'
      >
        <div className='flex gap-4'>
          <GlassSurface
            as='aside'
            className='w-[68px] shrink-0 p-2 py-4'
            variant='default'
          >
            <SidebarSkeleton />
          </GlassSurface>
          <div className='min-w-0 flex-1'>
            <GlassSurface className='animate-pulse p-6'>
              <div className='space-y-4'>
                <div className='aucctus-bg-secondary h-6 w-48 rounded' />
                <div className='aucctus-bg-secondary h-4 w-32 rounded' />
                <div className='mt-6 flex gap-4'>
                  <div className='aucctus-bg-secondary h-20 w-20 rounded-xl' />
                  <div className='flex-1 space-y-3'>
                    <div className='aucctus-bg-secondary h-4 w-full rounded' />
                    <div className='aucctus-bg-secondary h-4 w-3/4 rounded' />
                    <div className='aucctus-bg-secondary h-4 w-1/2 rounded' />
                  </div>
                </div>
              </div>
            </GlassSurface>
          </div>
        </div>
      </motion.div>
    );
  }

  // Error state
  if (isError) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8'
      >
        <div className='aucctus-border-secondary aucctus-bg-secondary flex min-h-[400px] flex-col items-center justify-center rounded-xl border p-12 text-center'>
          <Icon
            variant='alert-circle'
            className='aucctus-text-error-primary mb-4 h-12 w-12'
          />
          <h2 className='aucctus-header-sm-bold aucctus-text-primary mb-2'>
            Unable to Load Personas
          </h2>
          <p className='aucctus-text-md aucctus-text-secondary mb-6 max-w-md'>
            Something went wrong while loading your personas. Please try again.
          </p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => refetch()}
            className='btn btn-primary btn-md flex items-center gap-2'
          >
            <Icon variant='refresh' className='h-4 w-4' />
            <span>Retry</span>
          </motion.button>
        </div>
      </motion.div>
    );
  }

  // Empty state - show init modal + inline fallback
  if (personas.length === 0) {
    return (
      <>
        <LivingPersonasInitModal
          open={isInitModalOpen}
          onOpenChange={setIsInitModalOpen}
          onCreatePersona={handleAddPersona}
        />

        {/* Inline fallback when modal is dismissed */}
        {!isInitModalOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className='mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-24 sm:px-6 lg:px-8'
          >
            <div className='aucctus-bg-brand-secondary mb-4 flex h-14 w-14 items-center justify-center rounded-full'>
              <Icon
                variant='user-group'
                className='aucctus-stroke-brand-primary h-7 w-7 fill-none'
              />
            </div>
            <h2 className='aucctus-header-sm-bold aucctus-text-primary mb-2'>
              No Personas Yet
            </h2>
            <p className='aucctus-text-sm aucctus-text-secondary mb-6 max-w-sm text-center'>
              Create your first persona to start building research-driven
              customer profiles.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAddPersona}
              className='btn btn-primary btn-md flex items-center gap-2'
            >
              <Plus className='h-4 w-4' />
              <span>Create Your First Persona</span>
            </motion.button>
          </motion.div>
        )}

        <CreatePersonaModal
          open={isCreateModalOpen}
          onOpenChange={setIsCreateModalOpen}
          onSuccess={handleCreateSuccess}
        />
      </>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className='mx-auto px-4 py-6 sm:px-6 lg:px-8'
        style={personaColorStyle}
      >
        <div className='flex gap-4'>
          {/* Left Sidebar - Expandable on hover */}
          <div
            className='flex-shrink-0 transition-all duration-200 ease-in-out'
            style={{
              width: sidebarExpanded ? SIDEBAR_EXPANDED : SIDEBAR_COLLAPSED,
            }}
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
              <div
                className='transition-[padding]'
                style={{
                  padding: sidebarExpanded ? '12px' : '6px',
                  transitionDuration: '200ms',
                  transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                {/* Expanded header - "Personas" label + count badge */}
                <div
                  className='mb-3 flex items-center justify-between'
                  style={{
                    opacity: sidebarExpanded ? 1 : 0,
                    height: sidebarExpanded ? 'auto' : 0,
                    overflow: 'hidden',
                    transition: 'opacity 150ms ease-out, height 200ms ease-out',
                  }}
                >
                  <span className='aucctus-text-xs-medium aucctus-text-tertiary whitespace-nowrap uppercase tracking-wide'>
                    Personas
                  </span>
                  <span className='aucctus-text-xs aucctus-text-tertiary aucctus-border-secondary rounded-full border px-1.5 py-0.5 text-[10px]'>
                    {personas.length}
                  </span>
                </div>

                {/* Collapsed header - centered count badge */}
                <div
                  className='mb-2 flex justify-center'
                  style={{
                    opacity: sidebarExpanded ? 0 : 1,
                    height: sidebarExpanded ? 0 : 'auto',
                    overflow: 'hidden',
                    transition: 'opacity 150ms ease-out, height 200ms ease-out',
                  }}
                >
                  <span className='aucctus-text-xs aucctus-text-tertiary aucctus-border-secondary rounded-full border px-1.5 py-0.5 text-[10px]'>
                    {personas.length}
                  </span>
                </div>

                {/* Persona list with sliding indicator */}
                <div ref={sidebarContainerRef} className='relative'>
                  {/* Sliding selection indicator */}
                  {activePersonaUuid && (
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
                  )}

                  <div className='relative z-10 flex flex-col gap-1'>
                    {personas.map((persona: IPersonaListItem) => (
                      <div
                        key={persona.uuid}
                        ref={(el) => {
                          if (el) {
                            personaItemRefs.current.set(persona.uuid, el);
                          } else {
                            personaItemRefs.current.delete(persona.uuid);
                          }
                        }}
                      >
                        <PersonaSidebarItem
                          uuid={persona.uuid}
                          name={persona.name}
                          segment={persona.segment}
                          avatar={persona.avatar}
                          themeColor={persona.themeColor}
                          isSelected={persona.uuid === activePersonaUuid}
                          isExpanded={sidebarExpanded}
                          onClick={() => handlePersonaSelect(persona.uuid)}
                        />
                      </div>
                    ))}

                    {/* Add Persona Button */}
                    {sidebarExpanded ? (
                      <div
                        onClick={handleAddPersona}
                        className='aucctus-text-tertiary aucctus-border-secondary hover:aucctus-text-secondary hover:aucctus-bg-secondary mt-1 flex w-full cursor-pointer items-center gap-3 rounded-xl border border-dashed p-3 transition-all'
                      >
                        <div className='aucctus-border-secondary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-dashed'>
                          <Plus className='h-4 w-4' />
                        </div>
                        <span
                          className='aucctus-text-sm-medium whitespace-nowrap'
                          style={{
                            opacity: sidebarExpanded ? 1 : 0,
                            overflow: 'hidden',
                            transition: 'opacity 150ms ease-out',
                          }}
                        >
                          Add Persona
                        </span>
                      </div>
                    ) : (
                      <ComponentTooltip tip='Add Persona'>
                        <div
                          onClick={handleAddPersona}
                          className='aucctus-text-tertiary aucctus-border-secondary hover:aucctus-text-secondary hover:aucctus-bg-secondary mx-auto mt-1 flex h-14 w-14 cursor-pointer items-center justify-center rounded-xl border border-dashed transition-all'
                        >
                          <Plus className='h-5 w-5' />
                        </div>
                      </ComponentTooltip>
                    )}
                  </div>
                </div>
              </div>
            </GlassSurface>
          </div>

          {/* Main Content Area */}
          <div className='min-w-0 flex-1'>
            <AnimatePresence mode='wait'>
              {activePersona ? (
                <motion.div
                  key={activePersona.uuid}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <PersonaDetailView listItem={activePersona} />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className='aucctus-bg-secondary flex h-64 items-center justify-center rounded-xl'
                >
                  <p className='aucctus-text-md aucctus-text-tertiary'>
                    Select a persona to view details
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>

      <CreatePersonaModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
};

export default LivingPersonasTab;

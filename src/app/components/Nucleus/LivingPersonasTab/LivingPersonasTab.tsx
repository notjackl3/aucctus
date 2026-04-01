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

import { ComponentTooltip, GlassSurface, toast } from '@components';
import { useAccountBranding } from '@hooks/query/accountBranding.hook';
import { usePersonas, personaKeys } from '@hooks/query/persona.hook';
import { useSocketEvent } from '@hooks/sockets/aucctus';
import type { IPersonaListItem } from '@libs/api/types/persona';
import type {
  ILivingPersonasDocumentProcessingProgressMessage,
  ILivingPersonasPersonaReadyMessage,
} from '@libs/api/types/socketMessages/inbound';
import { useQueryClient } from 'react-query';
import { cn } from '@libs/utils/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  CheckCircle2,
  Plus,
  RefreshCw,
  Sparkles,
  Users,
} from 'lucide-react';
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
 * Display stages for the generating view.
 *
 * The backend sends different raw stages depending on the code path:
 * - First document:      started → extracting → building_persona → completed
 * - Subsequent documents: started → extracting → analyzing → creating_evidence → completed
 *
 * We map all raw backend stages into 4 universal display stages so the
 * UI always progresses linearly regardless of which path runs.
 */
const DISPLAY_STAGES = [
  'initializing',
  'extracting',
  'building',
  'complete',
] as const;
type DisplayStageKey = (typeof DISPLAY_STAGES)[number];

const DISPLAY_STAGE_LABELS: Record<DisplayStageKey, string> = {
  initializing: 'Initializing document processing...',
  extracting: 'Extracting document content...',
  building: 'Building persona profile...',
  complete: 'Complete!',
};

/** Map raw backend stage values to display stages */
const mapBackendStage = (raw: string): DisplayStageKey | null => {
  switch (raw) {
    case 'started':
      return 'initializing';
    case 'extracting':
      return 'extracting';
    case 'analyzing':
    case 'creating_evidence':
    case 'building_persona':
      return 'building';
    case 'completed':
      return 'complete';
    default:
      return null;
  }
};

/** Module-level map to persist processing stage per persona across remounts */
const generatingStageMap = new Map<string, DisplayStageKey>();

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
  const { branding } = useAccountBranding();
  const queryClient = useQueryClient();

  // Brand colors for generating state visuals
  const brandColors = useMemo(
    () =>
      branding?.colors && branding.colors.length > 0
        ? branding.colors
        : ['#6366F1', '#8B5CF6', '#A855F7', '#D946EF'],
    [branding?.colors],
  );

  // Split personas into initialized and generating
  const initializedPersonas = useMemo(
    () => personas.filter((p) => p.isInitialized),
    [personas],
  );
  const generatingPersonas = useMemo(
    () => personas.filter((p) => !p.isInitialized),
    [personas],
  );

  // Track the current processing stage for generating personas (forward-only, like the modal)
  const [currentStage, setCurrentStage] = useState<DisplayStageKey | null>(
    () => generatingStageMap.values().next().value ?? null,
  );

  // Listen for document processing progress to advance stages
  useSocketEvent<
    'living_personas.document.processing.progress.account',
    ILivingPersonasDocumentProcessingProgressMessage
  >(
    'living_personas.document.processing.progress.account',
    useCallback(
      (data: ILivingPersonasDocumentProcessingProgressMessage) => {
        if (!generatingPersonas.some((p) => p.uuid === data.personaUuid))
          return;

        const mapped = mapBackendStage(data.stage);
        if (!mapped) return;

        // Only advance forward, never backward
        setCurrentStage((prev) => {
          if (!prev) {
            generatingStageMap.set(data.personaUuid, mapped);
            return mapped;
          }
          const prevIdx = DISPLAY_STAGES.indexOf(prev);
          const newIdx = DISPLAY_STAGES.indexOf(mapped);
          if (newIdx > prevIdx) {
            generatingStageMap.set(data.personaUuid, mapped);
            return mapped;
          }
          return prev;
        });
      },
      [generatingPersonas],
    ),
  );

  // Clean up persisted stages for personas that are no longer generating
  useEffect(() => {
    const generatingUuids = new Set(generatingPersonas.map((p) => p.uuid));
    for (const uuid of generatingStageMap.keys()) {
      if (!generatingUuids.has(uuid)) {
        generatingStageMap.delete(uuid);
      }
    }
    if (generatingPersonas.length === 0) {
      setCurrentStage(null);
    }
  }, [generatingPersonas]);

  // Listen for persona.ready WebSocket events at the tab level
  useSocketEvent<
    'living_personas.persona.ready.account',
    ILivingPersonasPersonaReadyMessage
  >(
    'living_personas.persona.ready.account',
    useCallback(
      (data: ILivingPersonasPersonaReadyMessage) => {
        queryClient.invalidateQueries({ queryKey: personaKeys.lists() });
        // Only show toast if this event is for a persona we're currently watching generate
        if (generatingPersonas.some((p) => p.uuid === data.personaUuid)) {
          toast.success(
            'Persona Ready',
            data.message || 'Your persona has been generated.',
          );
        }
      },
      [queryClient, generatingPersonas],
    ),
  );

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

  // Sync active persona with URL params and loaded data (only initialized personas are selectable)
  useEffect(() => {
    if (isLoading || initializedPersonas.length === 0) return;

    if (personaUuidFromUrl) {
      const exists = initializedPersonas.some(
        (p) => p.uuid === personaUuidFromUrl,
      );
      if (exists) {
        if (activePersonaUuid !== personaUuidFromUrl) {
          setActivePersonaUuid(personaUuidFromUrl);
        }
        return;
      }
    }

    if (
      activePersonaUuid &&
      initializedPersonas.some((p) => p.uuid === activePersonaUuid)
    ) {
      return;
    }

    const firstUuid = initializedPersonas[0].uuid;
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
    initializedPersonas,
    personaUuidFromUrl,
    activePersonaUuid,
    setSearchParams,
  ]);

  // Get the active persona data from API response (only initialized personas are selectable)
  const activePersona = useMemo(
    () => initializedPersonas.find((p) => p.uuid === activePersonaUuid) ?? null,
    [initializedPersonas, activePersonaUuid],
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

  // Render content based on state
  const renderContent = () => {
    // Loading state
    if (isLoading) {
      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'
        >
          <div className='flex items-start gap-4'>
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
            <AlertCircle className='aucctus-text-error-primary mb-4 h-12 w-12' />
            <h2 className='aucctus-header-sm-bold aucctus-text-primary mb-2'>
              Unable to Load Personas
            </h2>
            <p className='aucctus-text-md aucctus-text-secondary mb-6 max-w-md'>
              Something went wrong while loading your personas. Please try
              again.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => refetch()}
              className='btn btn-primary btn-md flex items-center gap-2'
            >
              <RefreshCw className='h-4 w-4' />
              <span>Retry</span>
            </motion.button>
          </div>
        </motion.div>
      );
    }

    // Empty state - show init modal + inline fallback (only when no personas at all, including generating)
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
                <Users className='aucctus-stroke-brand-primary h-7 w-7 fill-none' />
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
        </>
      );
    }

    // Main content with sidebar
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className='mx-auto max-w-7xl px-4 sm:px-6 lg:px-8'
        style={personaColorStyle}
      >
        <div className='flex items-start gap-4'>
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
              className='sticky w-full overflow-hidden'
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
                    {initializedPersonas.map((persona: IPersonaListItem) => (
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

                    {/* Generating personas shown as skeleton items */}
                    {generatingPersonas.map((persona: IPersonaListItem) => (
                      <div key={persona.uuid}>
                        <PersonaSidebarItem
                          uuid={persona.uuid}
                          name={persona.name}
                          segment={persona.segment}
                          themeColor={persona.themeColor}
                          isExpanded={sidebarExpanded}
                          isGenerating
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
                >
                  {generatingPersonas.length > 0 ? (
                    <GlassSurface className='relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden p-12'>
                      {/* Ambient gradient orbs */}
                      <motion.div
                        className='pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full blur-3xl'
                        style={{ background: brandColors[0] }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                          opacity: [0, 0.08, 0.04, 0.08],
                          x: [0, 30, 0],
                          y: [0, 20, 0],
                          scale: [0.8, 1, 1.15, 1],
                        }}
                        transition={{
                          opacity: {
                            duration: 8,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          },
                          x: {
                            duration: 8,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          },
                          y: {
                            duration: 8,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          },
                          scale: {
                            duration: 8,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          },
                        }}
                      />
                      <motion.div
                        className='pointer-events-none absolute -bottom-16 -right-16 h-56 w-56 rounded-full blur-3xl'
                        style={{
                          background: brandColors[1] ?? brandColors[0],
                        }}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{
                          opacity: [0, 0.06, 0.03, 0.06],
                          x: [0, -20, 0],
                          y: [0, -30, 0],
                          scale: [0.8, 1.1, 1, 1.1],
                        }}
                        transition={{
                          opacity: {
                            duration: 10,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          },
                          x: {
                            duration: 10,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          },
                          y: {
                            duration: 10,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          },
                          scale: {
                            duration: 10,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          },
                        }}
                      />
                      {/* Third orb for richer glass depth */}
                      <motion.div
                        className='pointer-events-none absolute left-1/2 top-1/3 h-40 w-40 -translate-x-1/2 rounded-full blur-3xl'
                        style={{
                          background: brandColors[2] ?? brandColors[0],
                        }}
                        initial={{ opacity: 0 }}
                        animate={{
                          opacity: [0, 0.05, 0.02, 0.05],
                          y: [-10, 10, -10],
                          scale: [1, 1.2, 1],
                        }}
                        transition={{
                          duration: 12,
                          repeat: Infinity,
                          ease: 'easeInOut',
                          delay: 1,
                        }}
                      />

                      {/* Glass inner border highlight */}
                      <div
                        className='pointer-events-none absolute inset-0 rounded-xl'
                        style={{
                          border: `1px solid ${brandColors[0]}08`,
                          background: `linear-gradient(160deg, ${brandColors[0]}05 0%, transparent 40%, ${brandColors[1] ?? brandColors[0]}03 100%)`,
                        }}
                      />

                      {/* Central animated icon — staggered mount */}
                      <motion.div
                        className='relative mb-10 flex items-center justify-center'
                        initial={{ opacity: 0, scale: 0.6 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{
                          duration: 0.6,
                          ease: [0.16, 1, 0.3, 1],
                        }}
                      >
                        {/* Outer ring */}
                        <motion.div
                          className='absolute h-24 w-24 rounded-full'
                          style={{
                            border: `1.5px solid ${brandColors[0]}`,
                            opacity: 0.2,
                          }}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{
                            scale: [1, 1.3, 1],
                            opacity: [0.2, 0.05, 0.2],
                          }}
                          transition={{
                            scale: {
                              duration: 3.5,
                              repeat: Infinity,
                              ease: 'easeInOut',
                              delay: 0.4,
                            },
                            opacity: {
                              duration: 3.5,
                              repeat: Infinity,
                              ease: 'easeInOut',
                              delay: 0.4,
                            },
                          }}
                        />
                        {/* Middle ring */}
                        <motion.div
                          className='absolute h-20 w-20 rounded-full'
                          style={{
                            border: `1px solid ${brandColors[1] ?? brandColors[0]}`,
                          }}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{
                            scale: [1.1, 1, 1.1],
                            opacity: [0.1, 0.2, 0.1],
                          }}
                          transition={{
                            scale: {
                              duration: 4,
                              repeat: Infinity,
                              ease: 'easeInOut',
                              delay: 0.6,
                            },
                            opacity: {
                              duration: 4,
                              repeat: Infinity,
                              ease: 'easeInOut',
                              delay: 0.6,
                            },
                          }}
                        />
                        {/* Icon container with glass effect */}
                        <motion.div
                          className='relative flex h-16 w-16 items-center justify-center rounded-full backdrop-blur-sm'
                          style={{
                            background: `linear-gradient(135deg, ${brandColors[0]}20, ${brandColors[1] ?? brandColors[0]}12)`,
                            boxShadow: `0 0 30px ${brandColors[0]}10, inset 0 1px 0 ${brandColors[0]}15`,
                            border: `1px solid ${brandColors[0]}15`,
                          }}
                          animate={{ scale: [1, 1.06, 1] }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        >
                          <Sparkles
                            className='h-7 w-7'
                            style={{ color: brandColors[0] }}
                          />
                        </motion.div>
                      </motion.div>

                      {/* Brand logo or name badge — staggered mount */}
                      {branding?.logoUrl ? (
                        <motion.img
                          src={branding.logoUrl}
                          alt={branding.brandName}
                          className='mb-4 h-8 object-contain'
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 0.5 }}
                          transition={{
                            duration: 0.5,
                            delay: 0.3,
                            ease: 'easeOut',
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              'none';
                          }}
                        />
                      ) : branding?.brandName ? (
                        <motion.span
                          className='aucctus-text-xs-bold aucctus-text-tertiary mb-4 uppercase tracking-widest'
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 0.5 }}
                          transition={{
                            duration: 0.5,
                            delay: 0.3,
                            ease: 'easeOut',
                          }}
                        >
                          {branding.brandName}
                        </motion.span>
                      ) : null}

                      {/* Text content — staggered mount */}
                      <motion.h3
                        className='aucctus-header-sm-bold aucctus-text-primary mb-2'
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.5,
                          delay: 0.15,
                          ease: 'easeOut',
                        }}
                      >
                        Crafting Your Persona
                      </motion.h3>
                      <motion.p
                        className='aucctus-text-sm aucctus-text-secondary mb-8 max-w-sm text-center'
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.5,
                          delay: 0.25,
                          ease: 'easeOut',
                        }}
                      >
                        Analyzing documents, extracting insights, and building a
                        research-driven customer profile.
                      </motion.p>

                      {/* Processing stage list — matches CreatePersonaModal */}
                      <motion.div
                        className='w-full max-w-xs space-y-3'
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.5,
                          delay: 0.4,
                          ease: 'easeOut',
                        }}
                      >
                        {DISPLAY_STAGES.map((stage, stageIdx) => {
                          const currentIdx = currentStage
                            ? DISPLAY_STAGES.indexOf(currentStage)
                            : -1;
                          const isStageComplete = currentIdx > stageIdx;
                          const isStageActive = currentIdx === stageIdx;
                          const isFuture = currentIdx < stageIdx;

                          return (
                            <motion.div
                              key={stage}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{
                                delay: 0.5 + stageIdx * 0.08,
                              }}
                              className='flex items-center gap-3'
                            >
                              {/* Stage indicator */}
                              {isStageComplete ||
                              (stage === 'complete' &&
                                currentStage === 'complete') ? (
                                <CheckCircle2 className='h-5 w-5 shrink-0 text-success-500' />
                              ) : isStageActive ? (
                                <div className='h-5 w-5 shrink-0'>
                                  <div
                                    className='h-5 w-5 animate-spin rounded-full border-2 border-t-transparent'
                                    style={{
                                      borderColor: `${brandColors[0]}60`,
                                      borderTopColor: 'transparent',
                                    }}
                                  />
                                </div>
                              ) : (
                                <div
                                  className={cn(
                                    'h-5 w-5 shrink-0 rounded-full border-2',
                                    isFuture && 'opacity-30',
                                  )}
                                  style={{
                                    borderColor: isFuture
                                      ? undefined
                                      : `${brandColors[0]}30`,
                                  }}
                                />
                              )}

                              {/* Stage label */}
                              <span
                                className={cn(
                                  'aucctus-text-sm',
                                  isStageComplete ||
                                    (stage === 'complete' &&
                                      currentStage === 'complete')
                                    ? 'aucctus-text-primary'
                                    : isStageActive
                                      ? 'aucctus-text-primary font-medium'
                                      : 'aucctus-text-quaternary',
                                )}
                              >
                                {DISPLAY_STAGE_LABELS[stage]}
                              </span>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    </GlassSurface>
                  ) : (
                    <GlassSurface className='flex h-64 items-center justify-center'>
                      <p className='aucctus-text-md aucctus-text-tertiary'>
                        Select a persona to view details
                      </p>
                    </GlassSurface>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <>
      {renderContent()}

      <CreatePersonaModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
};

export default LivingPersonasTab;

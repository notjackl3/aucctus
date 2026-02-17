/**
 * PersonaDetailView - Wires persona API data to detail UI components
 *
 * Layout order:
 * 1. PersonaMetricsCard (stats bar with actions)
 * 2. EvidenceFoundWidget (conditional, full-width, toggled from stats bar)
 * 3. TrainingDocumentsPanel (edit mode only, above overview+chat)
 * 4. Overview + Chat (side by side)
 * 5. Layout Edit Banner (when edit mode active)
 * 6. PersonaWidgetGrid (with configure mode support)
 */

import { motion, AnimatePresence } from 'framer-motion';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { GlassSurface } from '@components';
import {
  usePersona,
  useEvidence,
  useAcceptEvidence,
  useIgnoreEvidence,
  useRemoveTag,
  useUpdatePersona,
  useAddTag,
  useDeletePersona,
  usePersonaSocketEvents,
  usePersonaContentMutations,
  useCustomWidgetMutations,
} from '@hooks/query/persona.hook';
import type { IPersonaListItem } from '@libs/api/types/persona';
import type { TagColor } from '@libs/api/types/persona';
import PersonaMetricsCard from './PersonaMetricsCard';
import EvidenceFoundWidget from './EvidenceFoundWidget';
import type { EvidenceItem } from './EvidenceFoundWidget';
import PersonaOverviewSection from './PersonaOverviewSection';
import PersonaLiveChat from './PersonaLiveChat';
import TrainingDocumentsPanel from './TrainingDocumentsPanel';
import LayoutEditSaveBanner from './LayoutEditSaveBanner';
import { DeletePersonaModal, AddWidgetModal } from './modals';
import { PersonaWidgetGrid, QuotesCarouselWidget } from './widgets';
import type {
  PersonaWidgetData,
  ContentMutationCallbacks,
  CustomWidgetCallbacks,
} from './widgets';
import type { CardListItem } from './widgets/CardListWidget';
import type { GainItem } from './widgets/GainsWidget';
import type { SocialValueItem } from './widgets/SocialValuesWidget';
import type { PersonaQuote } from './widgets/QuotesCarouselWidget';
import {
  getWidgetPreferences,
  saveWidgetPreferences,
  clearWidgetPreferences,
} from '@libs/utils/persona-widget-preferences';
import useStore from '@stores/store';

/** Props for the PersonaDetailView component */
export interface PersonaDetailViewProps {
  /** Persona list item data (from sidebar) */
  listItem: IPersonaListItem;
}

/** Widget configuration item */
export interface WidgetConfig {
  id: string;
  label: string;
  visible: boolean;
  size: 'small' | 'medium' | 'full';
}

/** Default widget configuration */
const DEFAULT_WIDGET_CONFIG: WidgetConfig[] = [
  { id: 'jobs', label: 'Jobs to be Done', visible: true, size: 'small' },
  { id: 'pains', label: 'Pain Points', visible: true, size: 'small' },
  { id: 'gains', label: 'Gains', visible: true, size: 'small' },
  { id: 'socialValues', label: 'Social Values', visible: true, size: 'small' },
  {
    id: 'motivationsBehaviours',
    label: 'Motivations & Behaviours',
    visible: true,
    size: 'small',
  },
  { id: 'keyFacts', label: 'Key Facts', visible: true, size: 'small' },
  { id: 'timeline', label: 'A Day in Their Life', visible: true, size: 'full' },
];

/** Detail loading skeleton */
const DetailSkeleton: React.FC = () => (
  <div className='animate-pulse space-y-4'>
    <GlassSurface className='p-4'>
      <div className='flex gap-8'>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='flex flex-col gap-2'>
            <div className='aucctus-bg-secondary h-3 w-16 rounded' />
            <div className='aucctus-bg-secondary h-5 w-24 rounded' />
          </div>
        ))}
      </div>
    </GlassSurface>
    <GlassSurface className='p-6'>
      <div className='flex gap-4'>
        <div className='aucctus-bg-secondary h-24 w-24 rounded-xl' />
        <div className='flex-1 space-y-3'>
          <div className='aucctus-bg-secondary h-6 w-48 rounded' />
          <div className='aucctus-bg-secondary h-4 w-32 rounded' />
          <div className='flex gap-2'>
            <div className='aucctus-bg-secondary h-6 w-16 rounded-full' />
            <div className='aucctus-bg-secondary h-6 w-20 rounded-full' />
          </div>
        </div>
      </div>
    </GlassSurface>
    <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
      {Array.from({ length: 3 }).map((_, i) => (
        <GlassSurface key={i} className='h-48 p-4' />
      ))}
    </div>
  </div>
);

/**
 * Maps IPersona data to PersonaWidgetData for the grid
 */
const mapToWidgetData = (persona: {
  jobsToBeDone: Array<{ uuid: string; text: string; priority: number }>;
  pains: Array<{ uuid: string; text: string; severity: number }>;
  gains: Array<{ uuid: string; text: string; impact: number }>;
  socialValues: Array<{ uuid: string; title: string; description?: string }>;
  motivations: Array<{ uuid: string; text: string; priority: number }>;
  behaviours: Array<{ uuid: string; text: string }>;
  keyFacts: Array<{ uuid: string; stat: string; label: string; trend: string }>;
  quotes: Array<{ uuid: string; text: string; context?: string }>;
  workdaySteps: Array<{
    uuid: string;
    time: string;
    title: string;
    description?: string;
    isProductIntervention: boolean;
  }>;
  chartData: Array<{
    uuid: string;
    chartType: string;
    category: string;
    value: string;
    percentage: number;
  }>;
}): PersonaWidgetData => {
  const jobs: CardListItem[] = persona.jobsToBeDone.map((j) => ({
    uuid: j.uuid,
    text: j.text,
    priority: j.priority,
  }));

  const pains: CardListItem[] = persona.pains.map((p) => ({
    uuid: p.uuid,
    text: p.text,
    severity: p.severity,
  }));

  const gains: GainItem[] = persona.gains.map((g) => ({
    uuid: g.uuid,
    text: g.text,
    impact: g.impact,
  }));

  const socialValues: SocialValueItem[] = persona.socialValues.map((sv) => ({
    uuid: sv.uuid,
    title: sv.title,
    description: sv.description,
  }));

  const keyFacts = persona.keyFacts.map((kf) => ({
    uuid: kf.uuid,
    stat: kf.stat,
    label: kf.label,
    trend: kf.trend as 'up' | 'down' | 'neutral',
  }));

  const quotes = persona.quotes.map((q) => ({
    uuid: q.uuid,
    text: q.text,
    context: q.context ?? '',
  }));

  const workdaySteps = persona.workdaySteps.map((ws) => ({
    uuid: ws.uuid,
    time: ws.time,
    title: ws.title,
    description: ws.description ?? '',
    isProductIntervention: ws.isProductIntervention,
  }));

  const motivations = persona.motivations.map((m) => ({
    uuid: m.uuid,
    text: m.text,
    priority: m.priority,
  }));

  const behaviours = persona.behaviours.map((b) => ({
    uuid: b.uuid,
    text: b.text,
  }));

  return {
    jobsToBeDone: jobs,
    pains,
    gains,
    socialValues,
    motivations,
    behaviours,
    keyFacts,
    quotes,
    workdaySteps,
  } as PersonaWidgetData;
};

/**
 * PersonaDetailView Component
 */
const PersonaDetailView: React.FC<PersonaDetailViewProps> = ({ listItem }) => {
  // Account UUID for scoped localStorage persistence
  const account = useStore((state) => state.auth.account);
  const accountUuid = account?.uuid;

  // Refs for height synchronization
  const overviewRef = useRef<HTMLDivElement>(null);
  const chatRef = useRef<HTMLDivElement>(null);

  const { persona, isLoading } = usePersona(listItem.uuid);
  const { evidence: pendingEvidence } = useEvidence(listItem.uuid, 'pending');
  const { acceptEvidence } = useAcceptEvidence();
  const { ignoreEvidence } = useIgnoreEvidence();
  const { removeTag } = useRemoveTag();
  const { updatePersona } = useUpdatePersona();
  const { addTag } = useAddTag();
  const { deletePersona } = useDeletePersona();

  // Content mutations for widget add/delete
  const jobMutations = usePersonaContentMutations(listItem.uuid, 'job');
  const painMutations = usePersonaContentMutations(listItem.uuid, 'pain');
  const gainMutations = usePersonaContentMutations(listItem.uuid, 'gain');
  const socialValueMutations = usePersonaContentMutations(
    listItem.uuid,
    'socialValue',
  );
  const motivationMutations = usePersonaContentMutations(
    listItem.uuid,
    'motivation',
  );
  const behaviourMutations = usePersonaContentMutations(
    listItem.uuid,
    'behaviour',
  );
  const keyFactMutations = usePersonaContentMutations(listItem.uuid, 'keyFact');
  const workdayStepMutations = usePersonaContentMutations(
    listItem.uuid,
    'workdayStep',
  );

  // Custom widget mutations
  const customWidgetMutations = useCustomWidgetMutations(listItem.uuid);

  const customWidgetCallbacks = useMemo(
    (): CustomWidgetCallbacks => ({
      onAddCustomWidgetItem: (widgetUuid, data) =>
        customWidgetMutations.addItem({ widgetUuid, data }),
      onUpdateCustomWidgetItem: (widgetUuid, itemUuid, data) =>
        customWidgetMutations.updateItem({ widgetUuid, itemUuid, data }),
      onDeleteCustomWidgetItem: (widgetUuid, itemUuid) =>
        customWidgetMutations.deleteItem({ widgetUuid, itemUuid }),
      onUpdateCustomWidget: (widgetUuid, data) =>
        customWidgetMutations.updateWidget({ widgetUuid, data }),
      onDeleteCustomWidget: (widgetUuid) =>
        customWidgetMutations.deleteWidget(widgetUuid),
    }),
    [customWidgetMutations],
  );

  const contentCallbacks = useMemo(
    (): ContentMutationCallbacks => ({
      onAddJob: (data) => jobMutations.add(data),
      onDeleteJob: (uuid) => jobMutations.delete(uuid),
      onAddPain: (data) => painMutations.add(data),
      onDeletePain: (uuid) => painMutations.delete(uuid),
      onAddGain: (data) => gainMutations.add(data),
      onDeleteGain: (uuid) => gainMutations.delete(uuid),
      onAddSocialValue: (data) => socialValueMutations.add(data),
      onDeleteSocialValue: (uuid) => socialValueMutations.delete(uuid),
      onAddMotivation: (data) => motivationMutations.add(data),
      onDeleteMotivation: (uuid) => motivationMutations.delete(uuid),
      onAddBehaviour: (data) => behaviourMutations.add(data),
      onDeleteBehaviour: (uuid) => behaviourMutations.delete(uuid),
      onAddKeyFact: (data) => keyFactMutations.add(data),
      onDeleteKeyFact: (uuid) => keyFactMutations.delete(uuid),
      onAddWorkdayStep: (data) => workdayStepMutations.add(data),
      onUpdateWorkdayStep: (uuid, data) =>
        workdayStepMutations.update({ itemUuid: uuid, data }),
      onDeleteWorkdayStep: (uuid) => workdayStepMutations.delete(uuid),
    }),
    [
      jobMutations,
      painMutations,
      gainMutations,
      socialValueMutations,
      motivationMutations,
      behaviourMutations,
      keyFactMutations,
      workdayStepMutations,
    ],
  );

  // WebSocket events for real-time updates (evidence discovered, document processed)
  const { processingProgress } = usePersonaSocketEvents(listItem.uuid);

  // Track previous evidence count for auto-show behavior
  const prevEvidenceCountRef = useRef(pendingEvidence.length);

  // UI state for stats bar actions
  const [isEditMode, setIsEditMode] = useState(false);
  const [isEvidenceVisible, setIsEvidenceVisible] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);

  // Widget configuration state — initialized from localStorage if available
  // Widget configuration state — initialized from localStorage if available
  const initialConfig = useMemo(
    () =>
      getWidgetPreferences(listItem.uuid, accountUuid) ?? DEFAULT_WIDGET_CONFIG,
    // Only compute once per persona — subsequent changes are managed by state
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [listItem.uuid],
  );
  const [widgetConfig, setWidgetConfig] =
    useState<WidgetConfig[]>(initialConfig);
  const [savedWidgetConfig, setSavedWidgetConfig] =
    useState<WidgetConfig[]>(initialConfig);

  // Reset widget config when switching personas
  useEffect(() => {
    const persisted =
      getWidgetPreferences(listItem.uuid, accountUuid) ?? DEFAULT_WIDGET_CONFIG;
    setWidgetConfig(persisted);
    setSavedWidgetConfig(persisted);
    setIsEditMode(false);
  }, [listItem.uuid, accountUuid]);

  // Computed: check if widget config has unsaved changes
  const hasLayoutChanges = useMemo(
    () => JSON.stringify(widgetConfig) !== JSON.stringify(savedWidgetConfig),
    [widgetConfig, savedWidgetConfig],
  );

  // Auto-show evidence widget when new evidence arrives
  useEffect(() => {
    const prevCount = prevEvidenceCountRef.current;
    const currentCount = pendingEvidence.length;
    prevEvidenceCountRef.current = currentCount;

    // Auto-show evidence when new evidence arrives
    if (currentCount > 0 && prevCount === 0) {
      setIsEvidenceVisible(true);
    }
  }, [pendingEvidence.length]);

  // Synchronize chat height with overview height
  useEffect(() => {
    const overviewElement = overviewRef.current;
    const chatElement = chatRef.current;

    if (overviewElement && chatElement && !isLoading) {
      const updateHeight = () => {
        if (overviewElement) {
          chatElement.style.maxHeight = `${overviewElement.offsetHeight}px`;
        }
      };

      // Create a ResizeObserver to detect changes in the overview component
      const resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(overviewElement);

      // Also keep the window resize listener for other layout changes
      window.addEventListener('resize', updateHeight);

      return () => {
        if (overviewElement) {
          resizeObserver.unobserve(overviewElement);
        }
        resizeObserver.disconnect();
        window.removeEventListener('resize', updateHeight);
      };
    }
  }, [isLoading]);

  // Optimistic removal: track dismissed evidence UUIDs
  const [dismissedUuids, setDismissedUuids] = useState<Set<string>>(new Set());

  // Map evidence to widget format, filtering out dismissed items
  const evidenceItems: EvidenceItem[] = useMemo(
    () =>
      pendingEvidence
        .filter((e) => !dismissedUuids.has(e.uuid))
        .map((e) => ({
          uuid: e.uuid,
          type: e.type,
          title: e.title,
          source: e.source ?? '',
          excerpt: e.excerpt ?? '',
          suggestedUpdate: e.suggestedUpdate ?? '',
          targetField: e.targetField ?? '',
          relevance: e.relevance,
        })),
    [pendingEvidence, dismissedUuids],
  );

  // Map full persona data to widget data
  const widgetData = useMemo(() => {
    if (!persona) return undefined;
    const data = mapToWidgetData(persona);
    data.customWidgets = persona.customWidgets ?? [];
    return data;
  }, [persona]);

  // Evidence handlers with optimistic removal
  const handleAcceptEvidence = useCallback(
    (evidenceUuid: string) => {
      setDismissedUuids((prev) => new Set(prev).add(evidenceUuid));
      acceptEvidence({ personaUuid: listItem.uuid, evidenceUuid });
    },
    [acceptEvidence, listItem.uuid],
  );

  const handleIgnoreEvidence = useCallback(
    (evidenceUuid: string) => {
      setDismissedUuids((prev) => new Set(prev).add(evidenceUuid));
      ignoreEvidence({ personaUuid: listItem.uuid, evidenceUuid });
    },
    [ignoreEvidence, listItem.uuid],
  );

  // Tag handler
  const handleRemoveTag = useCallback(
    (tagUuid: string) => {
      removeTag({ personaUuid: listItem.uuid, tagUuid });
    },
    [removeTag, listItem.uuid],
  );

  // Inline editing handlers (WS7)
  const handleNameChange = useCallback(
    (name: string) => {
      updatePersona({ personaUuid: listItem.uuid, data: { name } });
    },
    [updatePersona, listItem.uuid],
  );

  const handleOverviewChange = useCallback(
    (overview: string) => {
      updatePersona({ personaUuid: listItem.uuid, data: { overview } });
    },
    [updatePersona, listItem.uuid],
  );

  const handleAddTag = useCallback(
    (label: string, color: TagColor) => {
      addTag({
        personaUuid: listItem.uuid,
        data: { label, color },
      });
    },
    [addTag, listItem.uuid],
  );

  // Stats bar action handlers
  const handleToggleEditMode = useCallback(() => {
    if (isEditMode) {
      // Exiting edit mode - save config
      setSavedWidgetConfig(widgetConfig);
    }
    setIsEditMode((prev) => !prev);
  }, [isEditMode, widgetConfig]);

  const handleToggleEvidence = useCallback(() => {
    setIsEvidenceVisible((prev) => !prev);
  }, []);

  const handleDelete = useCallback(() => {
    setIsDeleteModalOpen(true);
  }, []);

  const handleDeleteSuccess = useCallback(() => {
    deletePersona(listItem.uuid);
    setIsDeleteModalOpen(false);
  }, [deletePersona, listItem.uuid]);

  const handleAddWidget = useCallback(() => {
    setIsAddWidgetModalOpen(true);
  }, []);

  // Layout edit banner handlers — persist to localStorage on save
  const handleSaveLayout = useCallback(() => {
    setSavedWidgetConfig(widgetConfig);
    saveWidgetPreferences(listItem.uuid, widgetConfig, accountUuid);
    setIsEditMode(false);
  }, [widgetConfig, listItem.uuid, accountUuid]);

  const handleCancelLayout = useCallback(() => {
    setWidgetConfig(savedWidgetConfig);
    setIsEditMode(false);
  }, [savedWidgetConfig]);

  const handleResetLayout = useCallback(() => {
    setWidgetConfig(DEFAULT_WIDGET_CONFIG);
    clearWidgetPreferences(listItem.uuid, accountUuid);
  }, [listItem.uuid, accountUuid]);

  if (isLoading || !persona) {
    return <DetailSkeleton />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='space-y-4'
    >
      {/* 1. Stats Bar */}
      <PersonaMetricsCard
        conceptCount={listItem.conceptCount}
        confidence={listItem.confidence}
        documentCount={listItem.documentCount}
        lastEngagedAt={listItem.lastEngagedAt}
        pendingEvidenceCount={evidenceItems.length}
        onAddWidget={handleAddWidget}
        onToggleEditMode={handleToggleEditMode}
        isEditMode={isEditMode}
        onToggleEvidence={handleToggleEvidence}
        isEvidenceVisible={isEvidenceVisible}
        onDelete={handleDelete}
      />

      {/* 2. Evidence Carousel (conditional, full-width) */}
      <AnimatePresence>
        {isEvidenceVisible && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <EvidenceFoundWidget
              pendingEvidence={evidenceItems}
              onAccept={handleAcceptEvidence}
              onIgnore={handleIgnoreEvidence}
              onClose={handleToggleEvidence}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Training Documents (edit mode only) */}
      <AnimatePresence>
        {isEditMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <TrainingDocumentsPanel
              personaUuid={listItem.uuid}
              personaName={persona.name}
              processingProgress={processingProgress}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. Overview + Chat side by side (stacked on mobile) */}
      <div className='flex flex-col gap-4 lg:flex-row'>
        <PersonaOverviewSection
          ref={overviewRef}
          name={persona.segment}
          representativeName={persona.name}
          avatar={persona.avatar}
          themeColor={persona.themeColor}
          tags={persona.tags}
          demographics={persona.demographics}
          overview={persona.overview}
          isEditable
          onNameChange={handleNameChange}
          onOverviewChange={handleOverviewChange}
          onAddTag={handleAddTag}
          onRemoveTag={handleRemoveTag}
          className='min-w-0 flex-1'
        />
        <div ref={chatRef} className='min-w-0 flex-1'>
          <PersonaLiveChat
            personaUuid={listItem.uuid}
            personaName={persona.name}
            personaAvatarUrl={persona.avatar}
            className='h-full min-h-[480px]'
          />
        </div>
      </div>

      {/* 3.5. Quotes Carousel - full width below overview + chat */}
      {widgetData?.quotes && widgetData.quotes.length > 0 && (
        <QuotesCarouselWidget quotes={widgetData.quotes as PersonaQuote[]} />
      )}

      {/* 4. Sticky Layout Edit Banner (fixed at viewport bottom) */}
      <AnimatePresence>
        {isEditMode && (
          <LayoutEditSaveBanner
            hasChanges={hasLayoutChanges}
            onSave={handleSaveLayout}
            onCancel={handleCancelLayout}
            onReset={handleResetLayout}
          />
        )}
      </AnimatePresence>

      {/* 6. Widget Grid */}
      {widgetData && (
        <PersonaWidgetGrid
          data={widgetData}
          isLayoutMode={isEditMode}
          widgetConfig={widgetConfig}
          onConfigChange={setWidgetConfig}
          contentCallbacks={contentCallbacks}
          customWidgetCallbacks={customWidgetCallbacks}
        />
      )}

      {/* Modals */}
      <DeletePersonaModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        personaName={persona.name}
        onConfirm={handleDeleteSuccess}
      />

      <AddWidgetModal
        open={isAddWidgetModalOpen}
        onOpenChange={setIsAddWidgetModalOpen}
        personaUuid={listItem.uuid}
        onCreateWidget={customWidgetMutations.createWidgetAsync}
      />
    </motion.div>
  );
};

export default PersonaDetailView;

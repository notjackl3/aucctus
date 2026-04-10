import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  Suspense,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { AppPath } from '@routes/routes';
import {
  QuestionCarousel,
  OpportunityMap,
  FloatingAnchorThought,
  LandingView,
  ExplorationModeSelector,
  PlaygroundLoadingIndicator,
  PlaygroundLoadingTransition,
  IdeationModeSwitcher,
  DebugContextButton,
  PlaygroundModeTabs,
} from '@components/IdeaPlayground';
import type { IAnchorThought } from '@components/IdeaPlayground/types';
import { animationStyles } from '@components/Card/ConceptGeneration/UserExploration/components/util/animation-keyframes';
import useStore from '@stores/store';
import telemetry from '@libs/telemetry';
import { toast } from '@components';
import {
  useAnchorThoughts,
  useCreateSeed,
  useQuestions,
  useAnchorThought,
  useGetGeneratedIdeas,
  useGenerateConcepts,
} from '@hooks/query/ideaPlayground.hook';
import { usePersonas } from '@hooks/query/persona.hook';
import { isAucctusAdmin } from '@libs/utils/account';
import type { MentionItem } from '@stores/overseer/types';

const LazyJTBDCanvas = React.lazy(() => import('@pages/JTBD/JTBDCanvas'));

const JTBDLoadingSkeleton: React.FC = () => (
  <div className='grid grid-cols-1 gap-6 px-8 pt-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className='space-y-3 rounded-2xl border border-white/[0.1] bg-white/[0.05] p-5 backdrop-blur-xl'
      >
        <div className='flex items-center justify-between'>
          <div className='h-5 w-12 animate-pulse rounded-full bg-white/[0.08]' />
          <div className='h-4 w-8 animate-pulse rounded bg-white/[0.08]' />
        </div>
        <div className='h-5 w-full animate-pulse rounded bg-white/[0.08]' />
        <div className='h-4 w-3/4 animate-pulse rounded bg-white/[0.08]' />
        <div className='h-4 w-1/2 animate-pulse rounded bg-white/[0.08]' />
      </div>
    ))}
  </div>
);

const IdeaPlaygroundQBased: React.FC = () => {
  // Track page time for analytics
  const [inputValue, setInputValue] = useState('');
  const [currentTopic, setCurrentTopic] = useState('');
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showOpportunityMap, setShowOpportunityMap] = useState(false);
  // Track if data is ready to show carousel (after loading transition completes)
  const [isDataReady, setIsDataReady] = useState(false);
  // Track selected files for upload (max 3)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  // Track if logo animation intro has completed (for showing title)
  const [showLogoTitle, setShowLogoTitle] = useState(false);
  // Track selected living personas for tagging
  const [selectedPersonas, setSelectedPersonas] = useState<MentionItem[]>([]);

  // URL parameter handling
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const seedUuidFromUrl = searchParams.get('seed') || undefined;

  // Mode switching
  const { user } = useStore((state) => state.auth);
  const isAdmin = useMemo(() => isAucctusAdmin(user), [user]);
  const currentMode =
    searchParams.get('mode') === 'jtbd' ? 'jtbd' : 'playground';

  const handleModeChange = useCallback(
    (mode: 'playground' | 'jtbd') => {
      if (mode === 'jtbd') {
        setSearchParams({ mode: 'jtbd' });
      } else {
        // Preserve seed if present, remove mode
        const seed = searchParams.get('seed');
        if (seed) {
          setSearchParams({ seed });
        } else {
          setSearchParams({});
        }
      }
    },
    [searchParams, setSearchParams],
  );

  // Manage seedUuid in local state (synchronized with URL params)
  const [currentSeedUuid, setCurrentSeedUuid] = useState<string | null>(null);
  const [hasRestoredSession, setHasRestoredSession] = useState(false);
  // Track if the current seed was just created (not from URL on mount)
  const [isNewlyCreatedSeed, setIsNewlyCreatedSeed] = useState(false);

  // Store access for UI state only (carousel navigation, concept selection)
  const ideaPlaygroundStore = useStore((state) => state.ideaPlayground);
  const prepopulatedAnchorThought = useStore(
    (state) => state.ideaPlayground.prepopulatedAnchorThought,
  );
  // Fetch anchor thoughts using React Query hook
  const { anchorThoughts, isLoading: isLoadingThoughts } = useAnchorThoughts();

  // Create seed mutation
  const { createSeedAsync } = useCreateSeed();

  // Fetch living personas for @mention menu
  const { personas: personaList } = usePersonas();
  const personaItems: MentionItem[] = useMemo(() => {
    if (!personaList) return [];
    return personaList.map((p) => ({
      id: p.uuid,
      name: p.name,
      type: 'persona' as const,
      segment: p.segment,
      themeColor: p.themeColor,
      avatar: p.avatar,
    }));
  }, [personaList]);

  const handlePersonaSelect = useCallback((item: MentionItem) => {
    setSelectedPersonas((prev) => {
      if (prev.some((p) => p.id === item.id)) return prev;
      return [...prev, item];
    });
  }, []);

  const handlePersonaRemove = useCallback((id: string) => {
    setSelectedPersonas((prev) => prev.filter((p) => p.id !== id));
  }, []);

  // Fetch anchor thought for seed restoration (only when seedUuidFromUrl exists)
  const {
    anchorThought: seedAnchorThought,
    isLoading: isLoadingAnchorThought,
  } = useAnchorThought(seedUuidFromUrl);

  // Fetch questions for seed restoration (only when seedUuidFromUrl exists)
  const {
    questions: existingQuestions,
    isLoading: isLoadingExistingQuestions,
  } = useQuestions(seedUuidFromUrl);

  // Check if generated ideas exist (for auto-showing OpportunityMap)
  const {
    isGenerating: conceptsGenerating,
    hasConcepts: hasGeneratedConcepts,
    isLoading: isLoadingGeneratedIdeas,
  } = useGetGeneratedIdeas(currentSeedUuid || undefined);

  // Hook for generating concepts with force regenerate
  const { generateConceptsAsync } = useGenerateConcepts(
    currentSeedUuid || '',
    true, // force regenerate
  );

  // Check if we're waiting for session restoration
  const isAwaitingSessionRestoration =
    seedUuidFromUrl &&
    !hasRestoredSession &&
    !isNewlyCreatedSeed &&
    (isLoadingExistingQuestions || isLoadingAnchorThought);

  // Inject keyframe animations
  useEffect(() => {
    const styleId = 'playground-animations';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = animationStyles;
      document.head.appendChild(style);
    }
  }, []);

  // Consume prepopulated anchor thought from external navigation (e.g., Signal Scanning)
  useEffect(() => {
    if (prepopulatedAnchorThought && !hasStartedTyping && !seedUuidFromUrl) {
      setInputValue(prepopulatedAnchorThought);
      // Clear the prepopulated thought after consuming
      ideaPlaygroundStore.clearPrepopulatedAnchorThought();
      telemetry.log('ideaPlayground.prepopulated.consumed', {
        thoughtLength: prepopulatedAnchorThought.length,
        source: 'external_navigation',
      });
    }
  }, [
    prepopulatedAnchorThought,
    hasStartedTyping,
    seedUuidFromUrl,
    ideaPlaygroundStore,
  ]);

  // Restore session if seed exists in URL
  useEffect(() => {
    if (
      seedUuidFromUrl &&
      !hasRestoredSession &&
      !isLoadingExistingQuestions &&
      !isLoadingAnchorThought
    ) {
      // Seed in URL - restore session
      if (existingQuestions.length > 0 && seedAnchorThought) {
        // Valid seed with questions and anchor thought, restore session
        setCurrentSeedUuid(seedUuidFromUrl);
        setHasStartedTyping(true);
        // Use anchor thought as the current topic instead of first question
        setCurrentTopic(seedAnchorThought.title || seedAnchorThought.thought);
        setHasRestoredSession(true);
        // Reset the newly created seed flag since we're now in restoration mode
        setIsNewlyCreatedSeed(false);

        // Let the loading transition check backend flags to determine readiness
        // (isDataReady will be set by PlaygroundLoadingTransition.onReady)

        telemetry.log('ideaPlayground.session.restored', {
          seedUuid: seedUuidFromUrl,
          questionCount: existingQuestions.length,
          anchorThought: seedAnchorThought.thought,
        });
      } else if (
        !isLoadingExistingQuestions &&
        !isLoadingAnchorThought &&
        (existingQuestions.length === 0 || !seedAnchorThought)
      ) {
        // Invalid seed or seed with no questions/anchor thought (only mark as error if done loading)
        toast.error('Session not found. Starting fresh.');
        navigate('/playground');
        setHasRestoredSession(true);
        setIsNewlyCreatedSeed(false);
        ideaPlaygroundStore.reset();
      }
    }
  }, [
    seedUuidFromUrl,
    hasRestoredSession,
    isLoadingExistingQuestions,
    isLoadingAnchorThought,
    existingQuestions,
    seedAnchorThought,
    navigate,
    ideaPlaygroundStore,
  ]);

  // Auto-show OpportunityMap if concepts exist or are being generated
  useEffect(() => {
    // Only check when we have a seed and session is ready
    if (
      currentSeedUuid &&
      hasStartedTyping &&
      !isLoadingGeneratedIdeas &&
      (conceptsGenerating || hasGeneratedConcepts)
    ) {
      setShowOpportunityMap(true);
      telemetry.log('ideaPlayground.opportunityMap.autoOpened', {
        seedUuid: currentSeedUuid,
        isGenerating: conceptsGenerating,
        hasConcepts: hasGeneratedConcepts,
      });
    }
  }, [
    currentSeedUuid,
    hasStartedTyping,
    isLoadingGeneratedIdeas,
    conceptsGenerating,
    hasGeneratedConcepts,
  ]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (showDropdown) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleInspirationClick = async (thought: IAnchorThought) => {
    setCurrentTopic(thought.thought);
    setInputValue(thought.thought);

    // Start transition immediately (optimistic)
    setHasStartedTyping(true);

    try {
      // Create seed with the selected anchor thought using hook (with optional file and personas)
      const { seedUuid } = await createSeedAsync({
        thoughtText: thought.thought,
        files: selectedFiles.length > 0 ? selectedFiles : undefined,
        livingPersonaUuids:
          selectedPersonas.length > 0
            ? selectedPersonas.map((p) => p.id)
            : undefined,
      });

      // Set seed UUID in local state (synchronized with URL)
      setCurrentSeedUuid(seedUuid);

      // Reset carousel to first question and clear files
      ideaPlaygroundStore.reset();
      setSelectedFiles([]);

      // Mark this as a newly created seed (not a restoration)
      setIsNewlyCreatedSeed(true);

      // Update URL with seed parameter
      setSearchParams({ seed: seedUuid });
    } catch (error) {
      // On error, return to main screen with toast
      toast.error('Failed to start exploration. Please try again.');
      setHasStartedTyping(false);
      setCurrentTopic('');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputValue(value);
  };

  const handleSubmit = async () => {
    if (!inputValue.trim()) return;

    const thoughtText = inputValue.trim();
    setCurrentTopic(thoughtText);

    // Start transition immediately (optimistic)
    setHasStartedTyping(true);

    try {
      // Create seed with custom input using hook (with optional files and personas)
      const { seedUuid } = await createSeedAsync({
        thoughtText,
        files: selectedFiles.length > 0 ? selectedFiles : undefined,
        livingPersonaUuids:
          selectedPersonas.length > 0
            ? selectedPersonas.map((p) => p.id)
            : undefined,
      });

      // Set seed UUID in local state (synchronized with URL)
      setCurrentSeedUuid(seedUuid);

      // Reset carousel to first question and clear files
      ideaPlaygroundStore.reset();
      setSelectedFiles([]);

      // Mark this as a newly created seed (not a restoration)
      setIsNewlyCreatedSeed(true);

      // Update URL with seed parameter
      setSearchParams({ seed: seedUuid });

      telemetry.log('ideaPlayground.seed.created.custom', {
        seedUuid,
        thoughtLength: thoughtText.length,
        hasFiles: selectedFiles.length > 0,
        fileCount: selectedFiles.length,
        personaCount: selectedPersonas.length,
      });
    } catch (error) {
      // On error, return to main screen with toast
      toast.error('Failed to start exploration. Please try again.');
      setHasStartedTyping(false);
      setCurrentTopic('');
    }
  };

  // Handler for textarea keydown (for any future key handling beyond Enter)
  const handleKeyDown = () => {
    // Additional key handling can go here if needed
  };

  const handleRestart = () => {
    setInputValue('');
    setCurrentTopic('');
    setHasStartedTyping(false);
    setCurrentSeedUuid(null);
    setHasRestoredSession(false);
    setIsNewlyCreatedSeed(false);
    setIsDataReady(false);
    setSelectedFiles([]);
    setShowLogoTitle(false);
    setSelectedPersonas([]);
    // Clear URL parameter and reset UI state
    setSearchParams({});
    ideaPlaygroundStore.reset();
    // Clear cached seedUuid so returning to playground starts fresh
    ideaPlaygroundStore.clearLastActiveSeedUuid();
  };

  // Show title after logo animation completes its first cycle (~5 seconds at 75fps)
  useEffect(() => {
    if (currentSeedUuid && !isDataReady && !showLogoTitle) {
      const timer = setTimeout(() => {
        setShowLogoTitle(true);
      }, 5000); // 5 seconds for logo animation intro

      return () => clearTimeout(timer);
    }
  }, [currentSeedUuid, isDataReady, showLogoTitle]);

  // Cache the active seedUuid in the store for session restoration via NavDrawer
  // Only set when currentSeedUuid changes, don't re-run on store reference changes
  useEffect(() => {
    if (currentSeedUuid) {
      ideaPlaygroundStore.setLastActiveSeedUuid(currentSeedUuid);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSeedUuid]);

  const handleClose = () => {
    // Clear cached seedUuid so returning to playground starts fresh
    ideaPlaygroundStore.clearLastActiveSeedUuid();
    navigate(AppPath.ConceptBank);
  };

  const handleGenerateIdeas = async () => {
    // Trigger concept generation with force regenerate
    if (currentSeedUuid) {
      try {
        // Clear any previously selected concepts when generating new ones
        ideaPlaygroundStore.clearSelectedConcepts();

        // Show the OpportunityMap immediately - it will show loading state
        setShowOpportunityMap(true);

        // Trigger the generation (this will update the query state)
        await generateConceptsAsync();
      } catch (error) {
        // If generation fails, hide the map and show error
        setShowOpportunityMap(false);
        toast.error('Failed to generate concepts', undefined, 3000);
      }
    }
  };

  const handleCloseOpportunityMap = () => {
    setShowOpportunityMap(false);
  };

  return (
    <div className='relative h-screen overflow-hidden'>
      <style>{animationStyles}</style>

      {/* Debug Context Button - Top Left (only in debug mode) */}
      {currentMode === 'playground' && (
        <DebugContextButton
          seedUuid={currentSeedUuid}
          className='absolute left-4 top-4 z-50'
        />
      )}

      {/* Background Image with Blur — ALWAYS visible in both modes */}
      <div
        className='absolute -inset-4 bg-cover bg-center bg-no-repeat'
        style={{
          backgroundImage: `url('/images/darker-background.png')`,
          filter: 'blur(4px) contrast(1.3)',
          animation: 'moveBackground 30s ease infinite',
          transform: 'scale(1.05)',
        }}
      />

      {/* Inlay */}
      <div className='absolute inset-0 bg-black/45'>
        {/* Floating Inspiration Cards - Only show in playground mode and if not awaiting restoration */}
        {currentMode === 'playground' &&
          !isLoadingThoughts &&
          !isAwaitingSessionRestoration && (
            <FloatingAnchorThought
              thoughts={anchorThoughts}
              onCardClick={handleInspirationClick}
              isVisible={!hasStartedTyping}
            />
          )}
      </div>

      {/* Mode Tabs — top-left, admin only */}
      {isAdmin && (
        <PlaygroundModeTabs
          activeMode={currentMode}
          onModeChange={handleModeChange}
          showJTBD={isAdmin}
          className='absolute left-6 top-6 z-40'
        />
      )}

      {/* JTBD Mode */}
      {currentMode === 'jtbd' && (
        <Suspense fallback={<JTBDLoadingSkeleton />}>
          <div className='relative z-10 h-full pt-20'>
            <LazyJTBDCanvas />
          </div>
        </Suspense>
      )}

      {/* Playground Mode — existing content unchanged */}
      {currentMode === 'playground' && (
        <>
          {/* Loading Indicator for session restoration */}
          {isAwaitingSessionRestoration && (
            <PlaygroundLoadingIndicator
              show={true}
              message='Restoring your session...'
            />
          )}

          {/* Loading Indicator for anchor thoughts - Only show if not awaiting restoration */}
          {!isAwaitingSessionRestoration && (
            <PlaygroundLoadingIndicator
              show={isLoadingThoughts && !hasStartedTyping}
              message='Loading innovation ideas...'
            />
          )}

          {/* Entry State - Clean centered layout - Only show if not awaiting restoration */}
          {!isAwaitingSessionRestoration && (
            <AnimatePresence>
              {!hasStartedTyping && (
                <LandingView
                  inputValue={inputValue}
                  onInputChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  onSubmit={handleSubmit}
                  onFilesChange={setSelectedFiles}
                  selectedFiles={selectedFiles}
                  style={{ opacity: 1 }}
                  personaItems={personaItems}
                  selectedPersonas={selectedPersonas}
                  onPersonaSelect={handlePersonaSelect}
                  onPersonaRemove={handlePersonaRemove}
                />
              )}
            </AnimatePresence>
          )}

          {/* Interface State - After Starting - Only show if not awaiting restoration */}
          {!isAwaitingSessionRestoration && (
            <AnimatePresence>
              {hasStartedTyping && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className='relative z-10 flex min-h-screen'
                >
                  {/* Loading Transition - Show until data is ready */}
                  {!isDataReady && (
                    <div className='flex flex-1 flex-col'>
                      <div className='px-8 pb-4 pt-8'>
                        <ExplorationModeSelector
                          currentTopic={currentTopic}
                          onRestart={handleRestart}
                          onClose={handleClose}
                          showTitle={showLogoTitle}
                          personas={selectedPersonas}
                        />
                      </div>
                      <div className='relative flex-1 pt-24'>
                        <PlaygroundLoadingTransition
                          seedUuid={currentSeedUuid}
                          onReady={() => setIsDataReady(true)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Question Carousel - Show when data is ready */}
                  {isDataReady && (
                    <div className='flex flex-1 flex-col'>
                      <div className='px-8 pb-4 pt-8'>
                        <ExplorationModeSelector
                          currentTopic={currentTopic}
                          onRestart={handleRestart}
                          onClose={handleClose}
                          showTitle={true}
                          personas={selectedPersonas}
                        />
                      </div>

                      {/* Main Map Area - Question Carousel */}
                      <div className='relative flex-1 pt-24'>
                        <QuestionCarousel
                          topic={currentTopic || 'Cheese on chicken in QSR'}
                          seedUuid={currentSeedUuid}
                          onGenerateIdeas={handleGenerateIdeas}
                          onViewConcepts={() => setShowOpportunityMap(true)}
                          hasGeneratedConcepts={hasGeneratedConcepts}
                        />
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Opportunity Map Overlay */}
          {showOpportunityMap && (
            <OpportunityMap
              seedUuid={currentSeedUuid}
              onClose={handleCloseOpportunityMap}
              livingPersonaUuids={
                selectedPersonas.length > 0
                  ? selectedPersonas.map((p) => p.id)
                  : undefined
              }
              personaInfos={selectedPersonas.map((p) => ({
                uuid: p.id,
                name: p.name,
                segment: p.segment || '',
                themeColor: p.themeColor,
                avatar: p.avatar,
              }))}
            />
          )}

          {/* Mode Switcher - Bottom Left (only on intro/landing page, only in playground mode) */}
          {!hasStartedTyping && (
            <IdeationModeSwitcher
              currentMode='playground'
              className='absolute bottom-6 left-6'
            />
          )}
        </>
      )}
    </div>
  );
};

export default IdeaPlaygroundQBased;

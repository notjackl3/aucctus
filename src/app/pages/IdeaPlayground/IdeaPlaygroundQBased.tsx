import React, { useState, useEffect } from 'react';
import { useTransition, animated } from 'react-spring';
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

const IdeaPlaygroundQBased: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [currentTopic, setCurrentTopic] = useState('');
  const [hasStartedTyping, setHasStartedTyping] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showOpportunityMap, setShowOpportunityMap] = useState(false);
  // Track if data is ready to show carousel (after loading transition completes)
  const [isDataReady, setIsDataReady] = useState(false);
  // Track selected file for upload
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  // Track if logo animation intro has completed (for showing title)
  const [showLogoTitle, setShowLogoTitle] = useState(false);

  // URL parameter handling
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const seedUuidFromUrl = searchParams.get('seed') || undefined;

  // Manage seedUuid in local state (synchronized with URL params)
  const [currentSeedUuid, setCurrentSeedUuid] = useState<string | null>(null);
  const [hasRestoredSession, setHasRestoredSession] = useState(false);
  // Track if the current seed was just created (not from URL on mount)
  const [isNewlyCreatedSeed, setIsNewlyCreatedSeed] = useState(false);

  // Store access for UI state only (carousel navigation, concept selection)
  const ideaPlaygroundStore = useStore((state) => state.ideaPlayground);

  // Fetch anchor thoughts using React Query hook
  const { anchorThoughts, isLoading: isLoadingThoughts } = useAnchorThoughts();

  // Create seed mutation
  const { createSeedAsync } = useCreateSeed();

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

  // Entry state animation
  const entryTransition = useTransition(!hasStartedTyping, {
    from: { opacity: 1 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { duration: 600 },
  });

  // Interface state animation
  const interfaceTransition = useTransition(hasStartedTyping, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 },
    config: { duration: 600 },
    delay: 300,
  });

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

    try {
      // Create seed with the selected anchor thought using hook (with optional file)
      const { seedUuid } = await createSeedAsync({
        thoughtText: thought.thought,
        file: selectedFile || undefined,
      });

      // Set seed UUID in local state (synchronized with URL)
      setCurrentSeedUuid(seedUuid);

      // Reset carousel to first question and clear file
      ideaPlaygroundStore.reset();
      setSelectedFile(null);

      // Mark this as a newly created seed (not a restoration)
      setIsNewlyCreatedSeed(true);

      // Update URL with seed parameter
      setSearchParams({ seed: seedUuid });

      setHasStartedTyping(true);
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
  };

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      const thoughtText = inputValue.trim();
      setCurrentTopic(thoughtText);

      try {
        // Create seed with custom input using hook (with optional file)
        const { seedUuid } = await createSeedAsync({
          thoughtText,
          file: selectedFile || undefined,
        });

        // Set seed UUID in local state (synchronized with URL)
        setCurrentSeedUuid(seedUuid);

        // Reset carousel to first question and clear file
        ideaPlaygroundStore.reset();
        setSelectedFile(null);

        // Mark this as a newly created seed (not a restoration)
        setIsNewlyCreatedSeed(true);

        // Update URL with seed parameter
        setSearchParams({ seed: seedUuid });

        telemetry.log('ideaPlayground.seed.created.custom', {
          seedUuid,
          thoughtLength: thoughtText.length,
          hasFile: !!selectedFile,
        });

        setHasStartedTyping(true);
      } catch (error) {
        // Error handling is done in the hook
      }
    }
  };

  const handleRestart = () => {
    setInputValue('');
    setCurrentTopic('');
    setHasStartedTyping(false);
    setCurrentSeedUuid(null);
    setHasRestoredSession(false);
    setIsNewlyCreatedSeed(false);
    setIsDataReady(false);
    setSelectedFile(null);
    setShowLogoTitle(false);
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
  useEffect(() => {
    if (currentSeedUuid) {
      ideaPlaygroundStore.setLastActiveSeedUuid(currentSeedUuid);
    }
  }, [currentSeedUuid, ideaPlaygroundStore]);

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
      <DebugContextButton
        seedUuid={currentSeedUuid}
        className='absolute left-4 top-4 z-50'
      />

      {/* Background Image with Blur */}
      <div
        className='absolute -inset-4 bg-cover bg-center bg-no-repeat'
        style={{
          backgroundImage: `url('/images/darker-background.png')`,
          filter: 'blur(6px)',
          animation: 'moveBackground 30s ease infinite',
          transform: 'scale(1.05)',
        }}
      />

      {/* Inlay */}
      <div className='absolute inset-0 bg-black/45'>
        {/* Floating Inspiration Cards - Only show if not awaiting restoration */}
        {!isLoadingThoughts && !isAwaitingSessionRestoration && (
          <FloatingAnchorThought
            thoughts={anchorThoughts}
            onCardClick={handleInspirationClick}
            isVisible={!hasStartedTyping}
          />
        )}
      </div>

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
      {!isAwaitingSessionRestoration &&
        entryTransition(
          (style, item) =>
            item && (
              <LandingView
                inputValue={inputValue}
                onInputChange={handleInputChange}
                onKeyPress={handleKeyPress}
                onFileChange={setSelectedFile}
                selectedFile={selectedFile}
                style={style}
              />
            ),
        )}

      {/* Interface State - After Starting - Only show if not awaiting restoration */}
      {!isAwaitingSessionRestoration &&
        interfaceTransition(
          (style, item) =>
            item && (
              <animated.div
                style={style}
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
              </animated.div>
            ),
        )}

      {/* Opportunity Map Overlay */}
      {showOpportunityMap && (
        <OpportunityMap
          seedUuid={currentSeedUuid}
          onClose={handleCloseOpportunityMap}
        />
      )}

      {/* Mode Switcher - Bottom Left (only on intro/landing page) */}
      {!hasStartedTyping && (
        <IdeationModeSwitcher
          currentMode='playground'
          className='absolute bottom-6 left-6'
        />
      )}
    </div>
  );
};

export default IdeaPlaygroundQBased;

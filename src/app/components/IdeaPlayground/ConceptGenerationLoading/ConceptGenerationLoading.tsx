import React, { useState, useEffect } from 'react';
import { LogoAnimation } from '@components';
import { AgentProgressBar } from '@components/Progress';

interface ConceptGenerationLoadingProps {
  /**
   * Optional className for positioning
   */
  className?: string;
}

/**
 * Fun generation messages that rotate every 4 seconds
 */
const GENERATION_MESSAGES = [
  'Brewing up brilliant concepts...',
  'Connecting the innovation dots...',
  'Unleashing creative possibilities...',
  'Crafting breakthrough ideas...',
  'Exploring uncharted territories...',
  'Synthesizing market insights...',
  'Building your innovation portfolio...',
  'Discovering hidden opportunities...',
  'Generating game-changing concepts...',
  'Mapping the future landscape...',
  'Curating strategic directions...',
  'Assembling innovation blueprints...',
  'Forging new pathways forward...',
  'Architecting bold solutions...',
  'Uncovering strategic gems...',
];

/**
 * Loading screen for concept generation with LogoAnimation,
 * rotating messages, and progress tracking.
 */
const ConceptGenerationLoading: React.FC<ConceptGenerationLoadingProps> = ({
  className,
}) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isMessageVisible, setIsMessageVisible] = useState(true);

  // Message rotation effect
  useEffect(() => {
    const messageDuration = 4000; // 4 seconds per message
    const fadeOutDuration = 300; // 300ms fade out

    const rotateMessage = () => {
      // Fade out
      setIsMessageVisible(false);

      // After fade out, change message and fade in
      setTimeout(() => {
        setCurrentMessageIndex(
          (prev) => (prev + 1) % GENERATION_MESSAGES.length,
        );
        setIsMessageVisible(true);
      }, fadeOutDuration);
    };

    const interval = setInterval(rotateMessage, messageDuration);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={`flex flex-col items-center justify-center gap-8 ${className || ''}`}
    >
      {/* Logo Animation */}
      <LogoAnimation size={200} loop fps={90} />

      {/* Loading Message with fade animation */}
      <div className='flex h-8 flex-col items-center justify-center'>
        <p
          className='aucctus-text-lg text-center text-white transition-opacity duration-300'
          style={{ opacity: isMessageVisible ? 1 : 0 }}
        >
          {GENERATION_MESSAGES[currentMessageIndex]}
        </p>
      </div>

      {/* Progress Bar */}
      <div className='w-full max-w-md px-4'>
        <AgentProgressBar
          agentName='IdeaPlaygroundConceptGeneration'
          fallbackEstimatedSeconds={120}
          showTimeRemaining
          showPercentage={false}
          size='md'
          theme='brand'
          className='[&_*]:!text-white'
        />
      </div>
    </div>
  );
};

export default ConceptGenerationLoading;

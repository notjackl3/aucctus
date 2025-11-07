import React from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import { animationStyles } from '@components/Card/ConceptGeneration/UserExploration/components/util/animation-keyframes';
import { useNucleusLoadingState } from './hooks/useNucleusLoadingState';
import { NucleusHeroBackground } from '../NucleusHeroBackground';
import CategoryPill from './components/CategoryPill';
import ActiveBadge from './components/ActiveBadge';
import NucleusLoadingCardCarousel from './components/NucleusLoadingCardCarousel';

export interface NucleusLoadingStateProps {}

const NucleusLoadingState: React.FC<NucleusLoadingStateProps> = ({}) => {
  const {
    companyName,
    liveAnswers,
    categoryProgress,
    centerCard,
    leftCards,
    rightCards,
    exitDirection,
    isNotified,
    isEmailLoading,
    handleEmailNotification,
    nucleusReportProgress,
  } = useNucleusLoadingState();

  // CSS keyframes for header animations
  const headerAnimationStyles = `
    @keyframes fadeSlideUp {
      from { 
        opacity: 0; 
        transform: translateY(var(--slide-distance, 20px));
      }
      to { 
        opacity: 1; 
        transform: translateY(0);
      }
    }
  `;

  return (
    <div className='min-h-screen'>
      <style>{animationStyles + headerAnimationStyles}</style>
      {/* Header Section with Background Video/Image */}
      <div className='relative min-h-screen overflow-hidden'>
        <NucleusHeroBackground
          videoUrl={nucleusReportProgress?.headquartersVideoUrl}
        />

        {/* Header Content */}
        <div className='relative z-10 flex flex-col items-center justify-center px-6 pb-12 pt-32'>
          {/* Actively Researching Badge */}
          <ActiveBadge />

          {/* Company Name */}
          <h1
            style={
              {
                '--slide-distance': '30px',
                animation: 'fadeSlideUp 0.8s ease-out forwards',
                animationDelay: '0.3s',
                opacity: 0,
              } as React.CSSProperties
            }
            className='aucctus-header-2xl-bold aucctus-text-white mb-4 text-center drop-shadow-xl'
          >
            {companyName}
          </h1>

          {/* Subtitle */}
          <p
            style={
              {
                '--slide-distance': '20px',
                animation: 'fadeSlideUp 0.8s ease-out forwards',
                animationDelay: '0.4s',
                opacity: 0,
              } as React.CSSProperties
            }
            className='aucctus-text-lg aucctus-text-white mx-auto mb-8 max-w-2xl text-center leading-relaxed'
          >
            Our agents are learning everything about your company
          </p>

          {/* Floating Live Answer Cards - Carousel */}
          <NucleusLoadingCardCarousel
            liveAnswers={liveAnswers}
            centerCard={centerCard}
            leftCards={leftCards}
            rightCards={rightCards}
            exitDirection={exitDirection}
          />

          {/* Category Progress Pills */}
          <div
            style={
              {
                '--slide-distance': '20px',
                animation: 'fadeSlideUp 0.8s ease-out forwards',
                animationDelay: '0.5s',
                opacity: 0,
              } as React.CSSProperties
            }
            className={cn(
              'mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-3',
            )}
          >
            {categoryProgress.map((category) => (
              <CategoryPill
                key={category.id}
                progress={category.progress}
                name={category.shortName}
              />
            ))}
          </div>

          {/* Notification Toggle */}
          <div
            style={
              {
                '--slide-distance': '20px',
                animation: 'fadeSlideUp 0.8s ease-out forwards',
                animationDelay: '0.6s',
                opacity: 0,
              } as React.CSSProperties
            }
            className='mt-6'
          >
            <button
              onClick={handleEmailNotification}
              disabled={isEmailLoading || isNotified}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2.5 transition-all disabled:cursor-not-allowed',
                'border opacity-90 shadow-lg',
                'hidden', // TODO: Uncomment this when we have a way to notify the user when the nucleus report is done
                isNotified
                  ? ''
                  : 'aucctus-bg-primary aucctus-border-secondary bg-opacity-0 hover:bg-opacity-25',
              )}
              aria-label='Toggle notification when done'
            >
              {isEmailLoading ? (
                <div className='flex items-center gap-2'>
                  <div className='h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white' />
                  <span className='aucctus-text-sm-medium text-white'>
                    Setting up...
                  </span>
                </div>
              ) : isNotified ? (
                <>
                  <Icon
                    variant='check'
                    width={16}
                    height={16}
                    className='stroke-white'
                  />
                  <span className='aucctus-text-sm-medium text-white'>
                    Notifying You
                  </span>
                </>
              ) : (
                <>
                  <Icon
                    variant='mail'
                    width={16}
                    height={16}
                    className='stroke-white'
                  />
                  <span className='aucctus-text-sm-medium text-white'>
                    Notify When Done
                  </span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NucleusLoadingState;

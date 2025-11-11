import React, { useCallback } from 'react';
import { Icon } from '@components';
import { useModal } from '../../../context/ModalContextProvider';
import { cn } from '@libs/utils/react';
import magicShareBg from '../../../assets/magic-share-background.png';
import { ConceptShareFormat } from '@libs/api/types';
import { useMagicShareModal } from '@components/Modal/MagicShareModal/hooks/useMagicShareModal';
import BetaDisclaimer from '@components/BetaDisclaimer';

interface MagicShareModalProps {
  conceptUuid: string;
}

type ShareFormat = ConceptShareFormat;

interface PresetOption {
  id: string;
  title: string;
  format: ShareFormat;
  description: string;
}

const PRESET_OPTIONS: PresetOption[] = [
  {
    id: 'executive',
    title: 'Exec 1-Pager',
    format: 'pdf',
    description: 'Create a single-paged Executive Report.',
  },
  // {
  //   id: 'pitch',
  //   title: '10 Slide Pitch Deck',
  //   format: 'pdf',
  //   description: 'Create a 10-slide pitch deck for stakeholders.',
  // },
  {
    id: 'promo',
    title: 'Promotional Video',
    format: 'video',
    description: 'Create an engaging video showcasing your concept.',
  },
];

const FORMAT_OPTIONS: Array<{
  value: ShareFormat;
  label: string;
  icon: IconVariant;
  enabled: boolean;
}> = [
  { value: 'pdf', label: 'PDF', icon: 'file-2', enabled: true },
  { value: 'video', label: 'Video', icon: 'play-square', enabled: true },
  {
    value: 'ppt',
    label: 'PowerPoint',
    icon: 'presentation-chart',
    enabled: false,
  },
];

const MagicShareModal: React.FC<MagicShareModalProps> = ({ conceptUuid }) => {
  const { closeModal } = useModal();
  const carouselRef = React.useRef<HTMLDivElement>(null);

  // CSS for card carousel animation
  const cardCarouselStyles = `
    @keyframes card-carousel-pdf {
      0%, 20% {
        transform: translateX(calc(-50% - 5rem)) translateY(var(--card-y)) rotate(-12deg) scale(0.9);
        z-index: 2;
      }
      23.33% {
        transform: translateX(calc(-50% - 6rem)) translateY(var(--card-y)) rotate(-12deg) scale(0.9);
        z-index: 3;
      }
      26.66%, 46.66% {
        transform: translateX(-50%) translateY(var(--card-y-center)) rotate(0deg) scale(1.05);
        z-index: 3;
      }
      50% {
        z-index: 3;
      }
      53.33%, 73.33% {
        transform: translateX(calc(-50% + 5rem)) translateY(var(--card-y)) rotate(12deg) scale(0.9);
        z-index: 1;
      }
      76.66% {
        z-index: 1;
      }
      80%, 100% {
        transform: translateX(calc(-50% - 5rem)) translateY(var(--card-y)) rotate(-12deg) scale(0.9);
        z-index: 2;
      }
    }
    
    @keyframes card-carousel-ppt {
      0%, 20% {
        transform: translateX(-50%) translateY(var(--card-y-center)) rotate(0deg) scale(1.05);
        z-index: 3;
      }
      23.33% {
        z-index: 3;
      }
      26.66%, 46.66% {
        transform: translateX(calc(-50% + 5rem)) translateY(var(--card-y)) rotate(12deg) scale(0.9);
        z-index: 1;
      }
      50% {
        z-index: 1;
      }
      53.33%, 73.33% {
        transform: translateX(calc(-50% - 5rem)) translateY(var(--card-y)) rotate(-12deg) scale(0.9);
        z-index: 2;
      }
      76.66% {
        transform: translateX(calc(-50% - 6rem)) translateY(var(--card-y)) rotate(-12deg) scale(0.9);
        z-index: 3;
      }
      80%, 100% {
        transform: translateX(-50%) translateY(var(--card-y-center)) rotate(0deg) scale(1.05);
        z-index: 3;
      }
    }
    
    @keyframes card-carousel-mov {
      0%, 20% {
        transform: translateX(calc(-50% + 5rem)) translateY(var(--card-y)) rotate(12deg) scale(0.9);
        z-index: 1;
      }
      23.33% {
        z-index: 1;
      }
      26.66%, 46.66% {
        transform: translateX(calc(-50% - 5rem)) translateY(var(--card-y)) rotate(-12deg) scale(0.9);
        z-index: 2;
      }
      50% {
        transform: translateX(calc(-50% - 6rem)) translateY(var(--card-y)) rotate(-12deg) scale(0.9);
        z-index: 3;
      }
      53.33%, 73.33% {
        transform: translateX(-50%) translateY(var(--card-y-center)) rotate(0deg) scale(1.05);
        z-index: 3;
      }
      76.66% {
        z-index: 3;
      }
      80%, 100% {
        transform: translateX(calc(-50% + 5rem)) translateY(var(--card-y)) rotate(12deg) scale(0.9);
        z-index: 1;
      }
    }

    .animate-card-pdf {
      animation: card-carousel-pdf 18s ease-in-out infinite;
    }
    
    .animate-card-ppt {
      animation: card-carousel-ppt 18s ease-in-out infinite;
    }
    
    .animate-card-mov {
      animation: card-carousel-mov 18s ease-in-out infinite;
    }
  `;

  const {
    description,
    setDescription,
    format,
    setFormat,
    isTyping,
    isSendingEmail,
    isLoading,
    shouldEmail,
    hasMagicShareUuid,
    isSubmittingGenerate,
    progress,
    hasError,
    errorMessage,
    isComplete,
    isGenerating,
    progressMessage,
    generatedTitle,
    actualFormat,
    handlePresetClick,
    handleGenerate,
    handleCancel,
    handleRestart,
    handleDownload,
    handleEmail,
    handleScroll,
    canScrollLeft,
    canScrollRight,
  } = useMagicShareModal({ conceptUuid, onClose: closeModal });

  const scrollPrev = useCallback(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  }, []);

  const scrollNext = useCallback(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  }, []);

  const onScroll = useCallback(() => {
    if (carouselRef.current) {
      handleScroll(carouselRef.current.scrollLeft);
    }
  }, [handleScroll]);

  const canScrollRightWithRef = useCallback(() => {
    if (!carouselRef.current) return false;
    return canScrollRight(
      carouselRef.current.scrollWidth,
      carouselRef.current.clientWidth,
    );
  }, [canScrollRight]);

  const getFormatIcon = useCallback((formatValue: ShareFormat) => {
    return FORMAT_OPTIONS.find((o) => o.value === formatValue)?.icon || 'file';
  }, []);

  return (
    <div className='relative flex w-full max-w-xl flex-col overflow-hidden'>
      {/* Inject card carousel animation styles */}
      <style>{cardCarouselStyles}</style>

      {/* Loading Overlay */}
      {isLoading && (
        <div className='absolute inset-0 z-[100] flex items-center justify-center bg-black/20 backdrop-blur-sm'>
          <div className='flex flex-col items-center gap-3'>
            <Icon
              variant='loading-02'
              className='h-8 w-8 animate-spin stroke-white'
            />
            <span className='aucctus-text-sm-medium text-white'>
              Loading...
            </span>
          </div>
        </div>
      )}

      {/* Hero Section with Floating Cards */}
      <div
        className={cn(
          'relative flex items-center justify-center overflow-hidden bg-cover bg-center transition-all duration-700',
          isGenerating || isComplete || hasError ? 'h-64' : 'h-56',
        )}
        style={
          {
            backgroundImage: `url(${magicShareBg})`,
            '--card-y': isGenerating || isComplete ? '0.5rem' : '1rem',
            '--card-y-center': isGenerating || isComplete ? '-0.5rem' : '0rem',
          } as React.CSSProperties
        }
      >
        {/* Cancel Button - top left when generating */}
        {isGenerating && (
          <button
            onClick={handleCancel}
            className='aucctus-border-secondary group absolute left-4 top-4 z-50 flex h-8 items-center gap-1.5 rounded-full border border-opacity-25 px-3 transition-colors hover:bg-white/20'
            aria-label='Cancel'
          >
            <Icon
              variant='closeX'
              className='h-3.5 w-3.5 stroke-white/70 group-hover:stroke-white'
            />
            <span className='text-sm font-medium text-white/70 group-hover:text-white'>
              Cancel
            </span>
          </button>
        )}

        {/* Restart Button - top left when complete or error */}
        {(isComplete || hasError) && (
          <button
            onClick={handleRestart}
            className='aucctus-border-secondary group absolute left-4 top-4 z-50 flex h-8 items-center gap-1.5 rounded-full border border-opacity-25 px-3 transition-colors hover:bg-white/20'
            aria-label='Restart'
          >
            <Icon
              variant='refresh'
              className='h-3.5 w-3.5 stroke-white/70 group-hover:stroke-white'
            />
            <span className='text-sm font-medium text-white/70 group-hover:text-white'>
              Restart
            </span>
          </button>
        )}

        {/* Close Button */}
        <button
          onClick={closeModal}
          className='group absolute right-4 top-4 z-50 flex h-8 w-8 items-center justify-center rounded-full transition-colors hover:bg-white/20'
          aria-label='Close'
        >
          <Icon
            variant='closeX'
            className='h-4 w-4 stroke-white/70 group-hover:stroke-white'
          />
        </button>

        {/* Floating Cards */}
        <div className='absolute inset-0 flex items-center justify-center'>
          {/* PDF Card */}
          <div className='animate-card-pdf absolute left-1/2'>
            <div className='flex h-32 w-24 flex-col rounded-lg border border-white/20 bg-white/10 p-2.5 shadow-2xl backdrop-blur-md'>
              <div className='h-1.5 w-full rounded bg-white/40'></div>
              <div className='mt-1 h-1 w-3/4 rounded bg-white/30'></div>
              <div className='mt-1.5 flex flex-1 flex-col gap-1'>
                <div className='h-2 rounded bg-white/20'></div>
                <div className='h-2 rounded bg-white/15'></div>
                <div className='h-2 rounded bg-white/15'></div>
                <div className='h-2 rounded bg-white/10'></div>
              </div>
              <div className='mt-auto flex items-center justify-center gap-1 pt-1.5'>
                <Icon
                  variant='file-2'
                  className='h-3.5 w-3.5 fill-transparent stroke-slate-200'
                />
                <span className='text-[10px] font-medium text-slate-200'>
                  PDF
                </span>
              </div>
            </div>
          </div>

          {/* PowerPoint Card */}
          <div className='animate-card-ppt absolute left-1/2'>
            <div className='flex h-32 w-24 flex-col rounded-lg border border-white/30 bg-white/15 p-2.5 shadow-2xl backdrop-blur-md'>
              <div className='relative flex-1 overflow-hidden'>
                <div className='flex flex-col gap-1.5'>
                  <div className='aspect-video rounded border border-red-400/30 bg-gradient-to-br from-red-600/30 to-red-700/20 p-1.5'>
                    <div className='mb-1 h-1 w-2/3 rounded bg-red-300/40'></div>
                    <div className='h-0.5 w-1/2 rounded bg-red-300/30'></div>
                  </div>
                  <div className='aspect-video rounded border border-orange-400/30 bg-gradient-to-br from-orange-500/30 to-red-500/20 p-1.5'>
                    <div className='mb-1 h-1 w-2/3 rounded bg-orange-300/40'></div>
                    <div className='h-0.5 w-1/2 rounded bg-orange-300/30'></div>
                  </div>
                  <div className='aspect-video rounded border border-pink-400/30 bg-gradient-to-br from-pink-500/30 to-pink-600/20 p-1.5'>
                    <div className='mb-1 h-1 w-2/3 rounded bg-pink-300/40'></div>
                    <div className='h-0.5 w-1/2 rounded bg-pink-300/30'></div>
                  </div>
                </div>
                <div className='via-white/8 pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white/15 via-30% to-transparent'></div>
              </div>
              <div className='mt-auto flex items-center justify-center gap-1 pt-1.5'>
                <Icon
                  variant='presentation-chart'
                  className='h-3.5 w-3.5 stroke-orange-200'
                />
                <span className='text-[10px] font-medium text-orange-200'>
                  PPT
                </span>
              </div>
            </div>
          </div>

          {/* Video Card */}
          <div className='animate-card-mov absolute left-1/2'>
            <div className='flex h-32 w-24 flex-col rounded-lg border border-white/20 bg-white/10 p-2.5 shadow-2xl backdrop-blur-md'>
              <div className='flex flex-1 items-center justify-center'>
                <div className='relative flex h-12 w-20 items-center justify-center rounded bg-gradient-to-br from-pink-600/30 to-rose-600/30'>
                  <div className='flex h-8 w-8 items-center justify-center rounded-full bg-white/90'>
                    <Icon
                      variant='play-square'
                      className='ml-0.5 h-4 w-4 fill-pink-600 text-pink-600'
                    />
                  </div>
                </div>
              </div>
              <div className='mt-auto flex items-center justify-center gap-1 pt-1.5'>
                <Icon
                  variant='play-square'
                  className='h-3.5 w-3.5 stroke-rose-200'
                />
                <span className='text-[10px] font-medium text-rose-200'>
                  MOV
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Beta Disclaimer - Always visible */}
      <div className='aucctus-bg-primary flex px-6 pt-4'>
        <BetaDisclaimer darkMode />
      </div>

      {/* Generation/Completion/Error Section */}
      {(isGenerating || isComplete || hasError) && (
        <div className='aucctus-bg-primary animate-fade-in px-6 pb-6 pt-2'>
          <div className='flex items-center gap-6'>
            {/* Preview Icon */}
            <div
              className={cn(
                'flex h-20 w-20 flex-shrink-0 flex-col items-center justify-center gap-1 rounded-lg',
                hasError
                  ? 'bg-gradient-to-br from-red-100 to-red-200'
                  : 'bg-gradient-to-br from-pink-100 to-orange-100',
              )}
            >
              <Icon
                variant={
                  hasError ? 'alert-circle' : getFormatIcon(actualFormat)
                }
                className={cn(
                  'h-8 w-8',
                  hasError
                    ? 'fill-red-600 stroke-red-600'
                    : 'fill-pink-600 stroke-pink-600',
                )}
              />
              <span
                className={cn(
                  'aucctus-text-xs-semibold',
                  hasError ? 'text-red-600' : 'text-pink-600',
                )}
              >
                {hasError ? 'Error' : generatedTitle}
              </span>
            </div>

            {/* Content */}
            <div className='flex-1'>
              <h3 className='aucctus-text-primary aucctus-text-xl-bold'>
                {hasError
                  ? 'Generation Failed'
                  : isComplete
                    ? generatedTitle
                    : `Generating ${generatedTitle}...`}
              </h3>

              {/* Fun message below title */}
              <p
                className={cn(
                  'aucctus-text-sm mb-1.5 mt-0.5',
                  hasError
                    ? 'aucctus-text-error-primary'
                    : 'aucctus-text-secondary',
                )}
              >
                {hasError
                  ? errorMessage
                  : isComplete
                    ? "Boom! That would've taken your intern 3 hours."
                    : progressMessage}
              </p>

              {/* Progress Bar */}
              {!hasError && (
                <div className='relative w-[100%]'>
                  <div className='aucctus-bg-tertiary h-3 overflow-hidden rounded'>
                    <div
                      className={cn(
                        'h-full transition-all duration-300',
                        isComplete
                          ? 'bg-green-600 bg-[linear-gradient(45deg,rgba(255,255,255,.08)_25%,transparent_25%,transparent_50%,rgba(255,255,255,.08)_50%,rgba(255,255,255,.08)_75%,transparent_75%,transparent)] bg-[length:1rem_1rem]'
                          : 'bg-gradient-to-r from-pink-500 to-orange-500',
                      )}
                      style={{ width: isComplete ? '100%' : `${progress}%` }}
                    >
                      {/* Striped animation - only during generation */}
                      {!isComplete && (
                        <div className='absolute inset-0 animate-[shimmer_2s_linear_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:200%_100%]'></div>
                      )}
                    </div>
                  </div>

                  {/* Checkmark at end when complete */}
                  {isComplete && (
                    <div className='absolute -right-1 top-1/2 flex h-5 w-5 -translate-y-1/2 transform items-center justify-center rounded-full border-[3px] border-white bg-green-600'>
                      <Icon
                        variant='check'
                        className='aucctus-stroke-white h-3 w-3'
                        strokeWidth={3}
                      />
                    </div>
                  )}
                </div>
              )}

              {/* Progress percentage below progress bar */}
              {!hasError && (
                <p className='aucctus-text-secondary aucctus-text-xs mt-1'>
                  {isComplete ? 'Completed' : `${Math.round(progress)}%`}
                </p>
              )}
            </div>

            {/* Action Buttons */}
            {hasError ? (
              <button
                onClick={handleRestart}
                className='btn btn-primary btn-sm h-9 flex-shrink-0 px-3'
              >
                Try Again
              </button>
            ) : (
              <div className='flex flex-shrink-0 flex-col gap-2'>
                <button
                  onClick={handleEmail}
                  className='btn btn-primary btn-sm h-9 px-3'
                  disabled={isSendingEmail || shouldEmail || !hasMagicShareUuid}
                >
                  {isSendingEmail
                    ? 'Sending...'
                    : shouldEmail
                      ? isComplete
                        ? 'Email Sent'
                        : 'Email Scheduled'
                      : !hasMagicShareUuid
                        ? 'Initializing...'
                        : isComplete
                          ? 'Email'
                          : 'Email when ready'}
                </button>
                <button
                  onClick={handleDownload}
                  className='btn btn-primary btn-sm h-9 px-3'
                  disabled={!isComplete}
                >
                  {'Download'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content Section */}
      {!isGenerating && !isComplete && !hasError && (
        <div className='aucctus-bg-primary max-h-[calc(90vh-14rem)] space-y-4 overflow-y-auto px-6 pb-6 pt-2'>
          {/* Title */}
          <div className='text-center'>
            <div className='mb-2 flex items-center justify-center gap-2'>
              <span className='text-2xl'>✨</span>
              <h2 className='aucctus-text-primary aucctus-header-lg-bold leading-tight'>
                Magic Share
              </h2>
            </div>
            <p className='aucctus-text-secondary aucctus-text-xl mb-8'>
              Share anything from your concept, instantly
            </p>
          </div>

          {/* Description Input with Integrated Suggestions */}
          <div className='aucctus-border-secondary focus-within:aucctus-border-brand overflow-hidden rounded-md border transition-colors'>
            <textarea
              placeholder='Describe what you want to share and who you want to share it with'
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className='aucctus-bg-primary aucctus-text-primary placeholder:aucctus-text-placeholder min-h-[120px] w-full resize-none rounded-none border-0 p-3 text-base focus:outline-none focus:ring-0'
              autoFocus
              disabled={isTyping}
            />

            {/* Quick Suggestions Carousel */}
            <div className='aucctus-bg-brand-primary/5 aucctus-border-primary border-t px-2 py-3'>
              <div className='flex items-center gap-2'>
                <div
                  className='flex-1 overflow-hidden'
                  ref={carouselRef}
                  onScroll={onScroll}
                >
                  <div className='flex gap-2'>
                    {PRESET_OPTIONS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handlePresetClick(preset)}
                        className='aucctus-bg-primary aucctus-border-secondary aucctus-text-primary aucctus-text-sm-medium hover:aucctus-bg-primary-hover flex-shrink-0 whitespace-nowrap rounded-full border px-4 py-1.5 transition-colors'
                      >
                        {preset.title}
                      </button>
                    ))}
                  </div>
                </div>

                <div className='flex flex-shrink-0 items-center gap-0.5'>
                  <button
                    onClick={scrollPrev}
                    disabled={!canScrollLeft}
                    className='aucctus-bg-primary-hover flex h-7 w-7 items-center justify-center rounded-full transition-colors disabled:opacity-50'
                    aria-label='Previous suggestions'
                  >
                    <Icon
                      variant='chevronleft'
                      className='aucctus-stroke-secondary h-3.5 w-3.5'
                    />
                  </button>

                  <button
                    onClick={scrollNext}
                    disabled={!canScrollRightWithRef()}
                    className='aucctus-bg-primary-hover flex h-7 w-7 items-center justify-center rounded-full transition-colors disabled:opacity-50'
                    aria-label='Next suggestions'
                  >
                    <Icon
                      variant='chevronright'
                      className='aucctus-stroke-secondary h-3.5 w-3.5'
                    />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Format Selection */}
          <div>
            <div className='grid grid-cols-3 gap-2'>
              {FORMAT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => option.enabled && setFormat(option.value)}
                  disabled={!option.enabled}
                  className={cn(
                    'aucctus-border-secondary flex items-center justify-center gap-2 rounded-md border p-3 transition-colors',
                    !option.enabled &&
                      'aucctus-bg-disabled cursor-not-allowed opacity-50',
                    option.enabled && format === option.value
                      ? 'aucctus-bg-brand-primary/5 aucctus-border-brand'
                      : option.enabled && 'aucctus-bg-primary-hover',
                  )}
                >
                  <Icon
                    variant={option.icon}
                    className={cn(
                      'h-4 w-4',
                      option.enabled
                        ? 'aucctus-stroke-primary'
                        : 'aucctus-stroke-disabled',
                    )}
                  />
                  <span
                    className={cn(
                      'aucctus-text-sm-medium',
                      option.enabled
                        ? 'aucctus-text-primary'
                        : 'aucctus-text-disabled',
                    )}
                  >
                    {option.label}
                  </span>
                  {!option.enabled && (
                    <span className='aucctus-text-disabled aucctus-text-xs ml-1'>
                      (Soon)
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div>
            <button
              onClick={handleGenerate}
              disabled={isSubmittingGenerate}
              className={cn(
                'btn btn-primary w-full',
                isSubmittingGenerate && 'btn-disabled',
              )}
            >
              {isSubmittingGenerate ? (
                <div className='flex items-center justify-center gap-2'>
                  <Icon variant='loading-02' className='h-5 w-5 animate-spin' />
                  <span>Generating...</span>
                </div>
              ) : (
                'Generate'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default React.memo(MagicShareModal);

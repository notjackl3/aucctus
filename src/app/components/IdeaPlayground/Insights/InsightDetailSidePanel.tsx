import React, { useState, useEffect } from 'react';
import { Loading } from '@components';
import { InsightCard } from '../types';
import { getSourceInitial, getSourceColor } from './utils';
import { FileText, Quote, Target, X } from 'lucide-react';
import AucctusLogo from '@assets/aucctus_logo.png';

interface InsightDetailSidePanelProps {
  selectedInsight: InsightCard | null;
  isOpen: boolean;
  getSentimentIcon: (sentiment: InsightCard['sentiment']) => React.ReactNode;
  onClose: () => void;
  onAddRelatedInsight?: (insight: InsightCard) => void;
}

const InsightDetailSidePanel: React.FC<InsightDetailSidePanelProps> = ({
  selectedInsight,
  isOpen,
  getSentimentIcon,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Mount: Add to DOM first
      setIsVisible(true);
      // Wait for next paint cycle, then trigger animation
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else if (isVisible) {
      // Unmount: Start exit animation
      setIsAnimating(false);
      // Wait for animation to complete before hiding
      setTimeout(() => {
        setIsVisible(false);
      }, 300);
    }
  }, [isOpen, isVisible]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose();
    }, 300);
  };

  if (!isVisible || !selectedInsight) return null;

  // Related insights feature - to be implemented later
  // const relatedInsights = [];

  return (
    <>
      {/* Backdrop */}
      <div
        className={`aucctus-bg-overlay fixed inset-0 z-40 backdrop-blur-sm transition-opacity duration-300 ${
          isAnimating ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Side Panel */}
      <div
        className={`aucctus-bg-primary aucctus-border-primary fixed right-0 top-0 z-50 h-full w-[500px] overflow-y-auto border-l shadow-2xl backdrop-blur-xl transition-transform duration-300 ease-out ${
          isAnimating ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className='p-12'>
          {/* Header */}
          <div className='relative mb-6 flex items-center justify-between'>
            <h2 className='aucctus-text-xs-medium aucctus-text-placeholder uppercase tracking-wider'>
              Insight Deep Dive
            </h2>
            <button
              onClick={handleClose}
              className='btn btn-sm btn-secondary absolute -right-3 -top-3'
            >
              <X size={12} className='aucctus-stroke-secondary' />
            </button>
          </div>

          {/* Citation-only view for Nucleus and File insights */}
          {selectedInsight.sourceType === 'nucleus' ||
          selectedInsight.sourceType === 'file' ? (
            <div className='mb-8 mt-2'>
              <div className='aucctus-border-secondary aucctus-bg-secondary shadow-glass mb-6 rounded-lg border p-4 backdrop-blur-sm'>
                <h4 className='aucctus-text-xl-semibold aucctus-text-primary mb-3 capitalize'>
                  {selectedInsight.insight}
                </h4>
                <div className='flex items-center gap-3'>
                  {/* Source type badge with logo */}
                  <div className='aucctus-bg-tertiary aucctus-border-tertiary inline-flex items-center gap-1.5 rounded-full border px-2 py-1'>
                    {selectedInsight.sourceType === 'nucleus' ? (
                      <div className='flex h-4 w-4 items-center justify-center overflow-hidden rounded-full bg-white'>
                        <img
                          src={AucctusLogo}
                          alt='Nucleus'
                          className='h-full w-full object-contain p-0.5'
                        />
                      </div>
                    ) : (
                      <FileText
                        size={12}
                        className='aucctus-stroke-secondary'
                      />
                    )}
                    <span className='aucctus-text-xs-medium aucctus-text-secondary'>
                      {selectedInsight.sourceType === 'nucleus'
                        ? 'Nucleus'
                        : 'Uploaded Document'}
                    </span>
                  </div>
                  {/* Category/filename badge */}
                  <div className='aucctus-bg-tertiary aucctus-border-tertiary inline-flex items-center gap-1 rounded-full border px-2 py-1'>
                    <span className='aucctus-text-xs-medium aucctus-text-secondary max-w-[200px] truncate'>
                      {selectedInsight.source}
                    </span>
                  </div>
                </div>
              </div>
              {selectedInsight.citation && (
                <div>
                  <div className='mb-3 flex items-center gap-2'>
                    <Quote size={16} className='aucctus-stroke-secondary' />
                    <span className='aucctus-text-xs-medium aucctus-text-placeholder uppercase tracking-wider'>
                      {selectedInsight.sourceType === 'nucleus'
                        ? 'Supporting Context'
                        : 'Source Citation'}
                    </span>
                  </div>
                  {selectedInsight.sourceType === 'nucleus' ? (
                    <div className='aucctus-border-secondary border-l-2 pl-4'>
                      <p className='aucctus-text-secondary aucctus-text-sm leading-relaxed'>
                        {selectedInsight.citation}
                      </p>
                    </div>
                  ) : (
                    <blockquote className='aucctus-border-secondary border-l-2 pl-4'>
                      <p className='aucctus-text-secondary aucctus-text-sm italic leading-relaxed'>
                        &ldquo;{selectedInsight.citation}&rdquo;
                      </p>
                    </blockquote>
                  )}
                </div>
              )}
            </div>
          ) : /* Error State - Show only error message */
          selectedInsight.citationValidationStatus === 'error' ? (
            <div className='mt-8 flex items-center justify-center'>
              <div className='aucctus-bg-secondary aucctus-border-secondary flex flex-col items-center justify-center rounded-lg border p-8 text-center'>
                <div className='mb-4 text-5xl'>😅</div>
                <h3 className='aucctus-text-xl-semibold aucctus-text-primary mb-3 max-w-[320px]'>
                  Oops! We Couldn&apos;t Find More Details on This Insight
                </h3>
                <p className='aucctus-text-md aucctus-text-tertiary max-w-[300px] leading-relaxed'>
                  Our agents had a hard time finding more insights on this
                  topic. Please try again later or explore other insights.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Section 1: What We Found */}
              <div className='mb-8 mt-2'>
                <div className='aucctus-border-secondary aucctus-bg-secondary shadow-glass mb-4 rounded-lg border p-4 backdrop-blur-sm'>
                  <div>
                    <h4 className='aucctus-text-xl-semibold aucctus-text-primary mb-3 capitalize'>
                      {selectedInsight.insight}
                    </h4>
                    <div className='mb-3 flex items-center gap-3'>
                      {selectedInsight.url ? (
                        <button
                          onClick={() =>
                            window.open(
                              selectedInsight.url,
                              '_blank',
                              'noopener,noreferrer',
                            )
                          }
                          className='aucctus-bg-tertiary aucctus-border-tertiary inline-flex cursor-pointer items-center gap-1 rounded-full border px-2 py-1 transition-colors hover:bg-white/10'
                          title={`Open ${selectedInsight.source}`}
                        >
                          <div
                            className={`aucctus-text-xs flex h-4 w-4 items-center justify-center rounded-full ${getSourceColor(selectedInsight.source)} aucctus-text-white`}
                          >
                            {getSourceInitial(selectedInsight.source)}
                          </div>
                          <span className='aucctus-text-xs-medium aucctus-text-secondary max-w-[80px] truncate'>
                            {selectedInsight.source.replace('.com', '')}
                          </span>
                        </button>
                      ) : (
                        <div className='aucctus-bg-tertiary aucctus-border-tertiary inline-flex items-center gap-1 rounded-full border px-2 py-1'>
                          <div
                            className={`aucctus-text-xs flex h-4 w-4 items-center justify-center rounded-full ${getSourceColor(selectedInsight.source)} aucctus-text-white`}
                          >
                            {getSourceInitial(selectedInsight.source)}
                          </div>
                          <span className='aucctus-text-xs-medium aucctus-text-secondary max-w-[80px] truncate'>
                            {selectedInsight.source.replace('.com', '')}
                          </span>
                        </div>
                      )}
                      <div className='flex items-center gap-1'>
                        {getSentimentIcon(selectedInsight.sentiment)}
                      </div>
                    </div>
                  </div>
                </div>
                <div className='space-y-3'>
                  <div className='aucctus-text-xs-medium aucctus-text-placeholder mb-2 uppercase tracking-wider'>
                    MORE DETAILS
                  </div>
                  {selectedInsight.citationValidationStatus === 'pending' && (
                    <div className='flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-4'>
                      <Loading isSmall />
                      <span className='aucctus-text-tertiary aucctus-text-sm'>
                        Validating citation and gathering more details...
                      </span>
                    </div>
                  )}
                  {selectedInsight.citationValidationStatus === 'success' &&
                    selectedInsight.moreDetails && (
                      <p className='aucctus-text-secondary leading-relaxed'>
                        {selectedInsight.moreDetails}
                      </p>
                    )}
                </div>
              </div>

              {/* Section 2: Why This Matters */}
              <div className='mb-8'>
                <div className='mb-4 flex items-center gap-2'>
                  <Target
                    size={20}
                    className='aucctus-stroke-success-primary'
                  />
                  <h3 className='aucctus-text-lg-semibold aucctus-text-primary'>
                    Why This Matters
                  </h3>
                </div>

                {!selectedInsight.whyItMatters && (
                  <div className='flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-4'>
                    <Loading isSmall />
                    <span className='aucctus-text-tertiary aucctus-text-sm'>
                      Analyzing implications...
                    </span>
                  </div>
                )}

                {selectedInsight.whyItMatters && (
                  <>
                    {/* The Good News */}
                    <div className='aucctus-bg-success-primary aucctus-border-success-subtle shadow-glass mb-4 rounded-lg border p-4 backdrop-blur-sm'>
                      <div className='mb-3 flex items-start gap-2'>
                        <span className='aucctus-text-success-primary aucctus-text-sm-semibold'>
                          The Good News:
                        </span>
                      </div>
                      <p className='aucctus-text-secondary aucctus-text-sm leading-relaxed'>
                        {selectedInsight.whyItMatters.goodNews}
                      </p>
                    </div>

                    {/* The Bad News */}
                    <div className='aucctus-bg-error-primary aucctus-border-error-subtle shadow-glass mb-4 rounded-lg border p-4 backdrop-blur-sm'>
                      <div className='mb-3 flex items-start gap-2'>
                        <span className='aucctus-text-error-primary aucctus-text-sm-semibold'>
                          The Bad News:
                        </span>
                      </div>
                      <p className='aucctus-text-secondary aucctus-text-sm leading-relaxed'>
                        {selectedInsight.whyItMatters.badNews}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </>
          )}

          {/* Section 3: Other Relevant Insights - To be implemented later */}
          {/* 
          <div className='mb-6'>
            <div className='mb-4 flex items-center gap-2'>
              <Columns3 size={20} className='aucctus-stroke-research-primary' />
              <h3 className='aucctus-text-lg-semibold aucctus-text-primary'>
                Other Relevant Insights
              </h3>
            </div>
          </div>
          */}
        </div>
      </div>
    </>
  );
};

export default InsightDetailSidePanel;

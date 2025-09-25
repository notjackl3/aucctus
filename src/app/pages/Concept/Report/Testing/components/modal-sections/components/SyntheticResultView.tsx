import React from 'react';
import { Icon } from '@components';
import { SyntheticResultViewProps } from '../TestResults.types';

const SyntheticResultView: React.FC<SyntheticResultViewProps> = ({
  result,
  viewMode,
  onToggleViewMode,
}) => {
  return (
    <div className='px-4 pb-4'>
      {/* Conditional Content Based on View Mode */}
      {viewMode === 'raw' && result.rawInterviewTranscript ? (
        // Raw Interview Transcript View - Clean, no heading
        <div className='space-y-6'>
          <pre className='aucctus-text-sm aucctus-text-secondary whitespace-pre-wrap font-sans leading-relaxed'>
            {result.rawInterviewTranscript}
          </pre>
        </div>
      ) : (
        // Structured Synthetic Interview Sections (Default View)
        <div className='space-y-6'>
          {result.keyInsights && (
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <Icon
                  variant='lightbulb'
                  className='aucctus-stroke-brand-primary h-4 w-4'
                />
                <h3 className='aucctus-text-sm-medium aucctus-text-primary'>
                  Key Insights
                </h3>
              </div>
              <p className='aucctus-text-sm aucctus-text-secondary leading-relaxed'>
                {result.keyInsights}
              </p>
            </div>
          )}

          {result.painPoints && (
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <Icon
                  variant='alert-triangle'
                  className='aucctus-stroke-warning-primary h-4 w-4'
                />
                <h3 className='aucctus-text-sm-medium aucctus-text-primary'>
                  Pain Points
                </h3>
              </div>
              <p className='aucctus-text-sm aucctus-text-secondary leading-relaxed'>
                {result.painPoints}
              </p>
            </div>
          )}

          {result.solutionFeedback && (
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <Icon
                  variant='message-circle'
                  className='aucctus-stroke-success-primary h-4 w-4'
                />
                <h3 className='aucctus-text-sm-medium aucctus-text-primary'>
                  Solution Feedback
                </h3>
              </div>
              <p className='aucctus-text-sm aucctus-text-secondary leading-relaxed'>
                {result.solutionFeedback}
              </p>
            </div>
          )}

          {result.willingnessToPayFeedback && (
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <Icon
                  variant='currency-dollar'
                  className='aucctus-stroke-brand-primary h-4 w-4'
                />
                <h3 className='aucctus-text-sm-medium aucctus-text-primary'>
                  Willingness to Pay
                </h3>
              </div>
              <p className='aucctus-text-sm aucctus-text-secondary leading-relaxed'>
                {result.willingnessToPayFeedback}
              </p>
            </div>
          )}

          {result.overallSentiment && (
            <div className='space-y-3'>
              <div className='flex items-center gap-2'>
                <Icon
                  variant='heart'
                  className='aucctus-stroke-error-primary h-4 w-4'
                />
                <h3 className='aucctus-text-sm-medium aucctus-text-primary'>
                  Overall Sentiment
                </h3>
              </div>
              <p className='aucctus-text-sm aucctus-text-secondary leading-relaxed'>
                {result.overallSentiment}
              </p>
            </div>
          )}

          {/* Fallback to summary if structured fields are not available */}
          {!result.keyInsights &&
            !result.painPoints &&
            !result.solutionFeedback &&
            !result.willingnessToPayFeedback &&
            !result.overallSentiment &&
            result.summary && (
              <div className='space-y-3'>
                <div className='flex items-center gap-2'>
                  <Icon
                    variant='clipboard'
                    className='aucctus-stroke-brand-primary h-4 w-4'
                  />
                  <h3 className='aucctus-text-sm-medium aucctus-text-primary'>
                    Summary
                  </h3>
                </div>
                <p className='aucctus-text-sm aucctus-text-secondary leading-relaxed'>
                  {result.summary}
                </p>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default SyntheticResultView;

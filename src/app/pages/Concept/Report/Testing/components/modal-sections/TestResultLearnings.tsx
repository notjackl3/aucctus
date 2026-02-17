import React from 'react';
import { cn } from '@libs/utils/react';
import { ITestLearningData } from '@libs/api/types';
import { ArrowUp, Lightbulb, MessageCircle } from 'lucide-react';

interface TestResultLearningsProps {
  learnings: ITestLearningData[];
  summary?: string;
  keywords?: string[];
  className?: string;
}

const TestResultLearnings: React.FC<TestResultLearningsProps> = ({
  learnings,
  summary,
  keywords,
  className,
}) => {
  if (learnings.length === 0 && !summary) {
    return null;
  }

  return (
    <div
      className={cn(
        'aucctus-bg-primary aucctus-border-secondary space-y-4 rounded-lg border p-4',
        className,
      )}
    >
      {/* Header */}
      <div className='flex items-center gap-2'>
        <Lightbulb className='aucctus-stroke-success-primary h-5 w-5' />
        <h3 className='aucctus-text-lg-semibold aucctus-text-success-primary'>
          AI-Generated Insights
        </h3>
      </div>

      {/* Summary */}
      {summary && (
        <div className='aucctus-bg-secondary-subtle rounded-lg p-4'>
          <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary mb-2'>
            Summary
          </h4>
          <p className='aucctus-text-sm-regular aucctus-text-secondary'>
            {summary}
          </p>
        </div>
      )}

      {/* Keywords */}
      {keywords && keywords.length > 0 && (
        <div>
          <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary mb-2'>
            Key Topics
          </h4>
          <div className='flex flex-wrap gap-2'>
            {keywords.map((keyword, index) => (
              <span
                key={index}
                className='aucctus-bg-brand-secondary aucctus-text-brand-primary rounded-full px-3 py-1 text-xs font-medium'
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Learnings */}
      {learnings.length > 0 && (
        <div>
          <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary mb-3'>
            Key Learnings ({learnings.length})
          </h4>
          <div className='space-y-3'>
            {learnings.map((learning) => (
              <div
                key={learning.uuid}
                className='aucctus-bg-secondary-extra-subtle aucctus-border-secondary rounded-lg border p-4'
              >
                <div className='space-y-3'>
                  {/* Learning Content */}
                  <div>
                    <h5 className='aucctus-text-sm-semibold aucctus-text-brand-primary mb-2 flex items-center gap-2'>
                      <MessageCircle className='aucctus-stroke-brand-primary h-4 w-4' />
                      Learning
                    </h5>
                    <p className='aucctus-text-sm-regular aucctus-text-secondary'>
                      {learning.learning}
                    </p>
                  </div>

                  {/* Impact */}
                  <div>
                    <h5 className='aucctus-text-sm-semibold aucctus-text-warning-primary mb-2 flex items-center gap-2'>
                      <ArrowUp className='aucctus-stroke-warning-primary h-4 w-4' />
                      Impact
                    </h5>
                    <p className='aucctus-text-sm-regular aucctus-text-secondary'>
                      {learning.impact}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TestResultLearnings;

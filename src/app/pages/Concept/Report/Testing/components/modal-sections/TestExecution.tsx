import React, { useState } from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';

const TestExecution: React.FC = () => {
  const [selectedMode, setSelectedMode] = useState<string | null>(
    'facilitated',
  );

  return (
    <div className='space-y-6'>
      {/* Execution Mode Selection - 2x2 Grid */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        {/* Facilitated Option */}
        <div
          className={cn(
            'aucctus-border-secondary cursor-pointer rounded-lg border p-4 transition-colors',
            selectedMode === 'facilitated'
              ? 'aucctus-border-brand-primary aucctus-bg-secondary-extra-subtle'
              : 'aucctus-bg-primary hover:aucctus-bg-secondary-subtle',
          )}
          onClick={() => setSelectedMode('facilitated')}
        >
          <div className='mb-3 flex items-start justify-between'>
            <div className='flex items-center gap-2'>
              <Icon
                variant='users-03'
                className={cn(
                  'h-5 w-5',
                  selectedMode === 'facilitated'
                    ? 'aucctus-stroke-brand-primary'
                    : 'aucctus-stroke-tertiary',
                )}
              />
              <h4
                className={cn(
                  'aucctus-text-sm-semibold',
                  selectedMode === 'facilitated'
                    ? 'aucctus-text-brand-primary'
                    : 'aucctus-text-brand-primary',
                )}
              >
                Facilitated
              </h4>
            </div>
            {selectedMode === 'facilitated' && (
              <Icon
                variant='check'
                className='aucctus-stroke-brand-primary h-5 w-5'
              />
            )}
          </div>
          <p className='aucctus-text-sm-regular aucctus-text-secondary'>
            Run the test yourself outside of Aucctus, then return to upload
            results
          </p>
        </div>

        {/* Expert-Led Option - Coming Soon */}
        <div className='aucctus-border-secondary aucctus-bg-primary rounded-lg border p-4 opacity-70'>
          <div className='mb-3 flex items-start justify-between'>
            <div className='flex items-center gap-2'>
              <Icon
                variant='users-03'
                className='aucctus-stroke-tertiary h-5 w-5'
              />
              <h4 className='aucctus-text-sm-semibold aucctus-text-tertiary'>
                Expert-Led
              </h4>
            </div>
            <span className='aucctus-bg-secondary-subtle aucctus-text-tertiary aucctus-border-secondary rounded-full border px-2 py-0.5 text-xs'>
              Coming soon
            </span>
          </div>
          <p className='aucctus-text-sm-regular aucctus-text-tertiary'>
            Testing experts at Disruptive Edge will facilitate the test for you
            with real customers, ensuring high-touch engagement and testing best
            practice
          </p>
        </div>

        {/* Automated Option - Coming Soon */}
        <div className='aucctus-border-secondary aucctus-bg-primary rounded-lg border p-4 opacity-70'>
          <div className='mb-3 flex items-start justify-between'>
            <div className='flex items-center gap-2'>
              <Icon
                variant='trendup'
                className='aucctus-stroke-tertiary h-5 w-5'
              />
              <h4 className='aucctus-text-sm-semibold aucctus-text-tertiary'>
                Automated
              </h4>
            </div>
            <span className='aucctus-bg-secondary-subtle aucctus-text-tertiary aucctus-border-secondary rounded-full border px-2 py-0.5 text-xs'>
              Coming soon
            </span>
          </div>
          <p className='aucctus-text-sm-regular aucctus-text-tertiary'>
            Aucctus runs the test for you with real participants that match your
            target profiles
          </p>
        </div>

        {/* Synthetic Option - Coming Soon */}
        <div className='aucctus-border-secondary aucctus-bg-primary rounded-lg border p-4 opacity-70'>
          <div className='mb-3 flex items-start justify-between'>
            <div className='flex items-center gap-2'>
              <Icon
                variant='ai-conclusion'
                className='aucctus-stroke-tertiary h-5 w-5'
              />
              <h4 className='aucctus-text-sm-semibold aucctus-text-tertiary'>
                Synthetic
              </h4>
            </div>
            <span className='aucctus-bg-secondary-subtle aucctus-text-tertiary aucctus-border-secondary rounded-full border px-2 py-0.5 text-xs'>
              Coming soon
            </span>
          </div>
          <p className='aucctus-text-sm-regular aucctus-text-tertiary'>
            Simulate this test with AI-agents trained to behave like your target
            profiles
          </p>
        </div>
      </div>

      {/* Information Section */}
      <div className='aucctus-bg-secondary-subtle aucctus-border-secondary rounded-lg border p-6'>
        <div className='flex items-start gap-3'>
          <div className='mt-1'>
            <Icon
              variant='help-circle'
              className='aucctus-stroke-brand-primary h-5 w-5'
            />
          </div>
          <div>
            <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary mb-3'>
              How facilitated testing works
            </h4>
            <ul className='aucctus-text-sm-regular aucctus-text-secondary list-disc space-y-2 pl-5'>
              <li>
                Schedule interview sessions with your selected participants
              </li>
              <li>
                Use the interview guide from the Collateral tab to conduct the
                session
              </li>
              <li>
                Take detailed notes or record the session (with permission)
              </li>
              <li>Return to Aucctus to log your findings in the Results tab</li>
              <li>Update your assumptions based on what you learned</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Test Execution Checklist */}
      {/* <div className='aucctus-border-secondary aucctus-bg-primary rounded-lg border p-6'>
        <h4 className='aucctus-text-md-semibold aucctus-text-brand-primary mb-4'>
          Test Execution Checklist
        </h4>

        <div className='space-y-3'>
          <div className='flex items-center gap-3'>
            <div className='aucctus-bg-success-secondary flex h-6 w-6 items-center justify-center rounded-full'>
              <Icon
                variant='check'
                className='aucctus-stroke-success-primary h-4 w-4'
              />
            </div>
            <span className='aucctus-text-sm-regular aucctus-text-brand-primary'>
              Invite participants
            </span>
          </div>

          <div className='flex items-center gap-3'>
            <div className='aucctus-bg-success-secondary flex h-6 w-6 items-center justify-center rounded-full'>
              <Icon
                variant='check'
                className='aucctus-stroke-success-primary h-4 w-4'
              />
            </div>
            <span className='aucctus-text-sm-regular aucctus-text-brand-primary'>
              Prepare interview guide
            </span>
          </div>

          <div className='flex items-center gap-3'>
            <div className='aucctus-border-secondary flex h-6 w-6 items-center justify-center rounded-full border'>
              <span className='aucctus-text-xs-semibold aucctus-text-tertiary'>
                3
              </span>
            </div>
            <span className='aucctus-text-sm-regular aucctus-text-brand-primary'>
              Conduct test sessions
            </span>
          </div>

          <div className='flex items-center gap-3'>
            <div className='aucctus-border-secondary flex h-6 w-6 items-center justify-center rounded-full border'>
              <span className='aucctus-text-xs-semibold aucctus-text-tertiary'>
                4
              </span>
            </div>
            <span className='aucctus-text-sm-regular aucctus-text-brand-primary'>
              Record and analyze results
            </span>
          </div>

          <div className='flex items-center gap-3'>
            <div className='aucctus-border-secondary flex h-6 w-6 items-center justify-center rounded-full border'>
              <span className='aucctus-text-xs-semibold aucctus-text-tertiary'>
                5
              </span>
            </div>
            <span className='aucctus-text-sm-regular aucctus-text-brand-primary'>
              Update assumptions
            </span>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default TestExecution;

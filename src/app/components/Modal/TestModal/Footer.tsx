import { Button, Header, Icon } from '@components';
import { ConceptTestStatus } from '@libs/api/types';
import React from 'react';

interface FooterProps {
  status: ConceptTestStatus;
}

const defaultProps = {
  inProgress: {
    subHeader:
      'Ready to conclude this test and summarize the results? First, ensure all Findings & Results have been recorded.',
    header: 'Test in Progress',
  },
  completed: {
    subHeader:
      'Your test has concluded and the Findings & Results have been summarized below as Next Steps, and a Summary of findings has been produced at the top of the page.',
    header: 'Test Concluded',
  },
};

const Footer: React.FC<FooterProps> = ({ status }) => {
  const isCompleted = status === 'completed';

  const text = isCompleted ? defaultProps.completed : defaultProps.inProgress;

  return (
    <div className='flex h-24 flex-row items-center justify-between gap-2  rounded-b-lg bg-primary-100 px-8 py-4'>
      <span className='flex flex-row gap-2'>
        {isCompleted ? (
          <Icon
            variant='check'
            className='stroke-primary-500'
            height={24}
            width={24}
          />
        ) : (
          <Icon.LoadingSpinner
            backgroundPathProps={{ className: 'text-primary-500' }}
          />
        )}
        <Header.Three className='text-xl font-semibold' text={text.header} />
      </span>

      <span className='max-w-96 text-wrap text-sm text-slate-500'>
        {text.subHeader}
      </span>

      {/* Conclude Test Button */}
      {status === 'inProgress' && (
        <Button
          color='primary'
          // size='sm'

          // TODO: Add functionality to conclude test
          onClick={() => {}}
        >
          Conclude Test
        </Button>
      )}
    </div>
  );
};

export default Footer;

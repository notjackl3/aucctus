import images from '@assets/img';
import { Card, Icon, Text } from '@components';
import React from 'react';

const WhiteSpaceSuggestions: React.FC = () => {
  return (
    <Card.Ignition
      header={{
        title: 'White Space Suggestions',
        description:
          "Based on what we know about your company, we've suggested some ideas.",
        color: 'bg-gray-50',
        image: {
          src: images.whiteSpaceSuggestions,
          alt: 'White Space Suggestions',
        },
      }}
      footer={
        <>
          <button
            className='btn btn-light w-80 justify-between border border-violet-50 px-2.5 py-2'
            disabled
          >
            View All Suggestions <Icon variant='arrowright' />
          </button>
        </>
      }
    >
      <>
        <button
          className='btn btn-light inline-flex w-80 items-center justify-center gap-2 rounded-lg border px-4 py-2.5 disabled:cursor-not-allowed'
          disabled
        >
          <Icon variant='clock-stopwatch' />
          <div className='text-sm font-medium leading-tight text-gray-500'>
            Coming Soon
          </div>
        </button>

        <Text.WhiteSpaceSuggestion
          title='Drone Delivery Leveraging National Retail Outlets'
          subtitle='Use your network of stores to deliver online orders via drone'
        />
        <Text.WhiteSpaceSuggestion
          title='Pet Care Stations & Membership Plan'
          subtitle='Pet grooming subscription plan and integrated food/toy sales.'
        />
        <Text.WhiteSpaceSuggestion
          title='Tech Support & Repair Services'
          subtitle='In-store hardware repair and education opportunities.'
        />
      </>
    </Card.Ignition>
  );
};

export default WhiteSpaceSuggestions;

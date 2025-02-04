import React from 'react';
import { IInsight, ISource } from '@libs/api/types';
import { Badge, Icon } from '@components';

interface SourceCardProps {
  source: ISource;
}

const SourceCard: React.FC<SourceCardProps> = ({ source }) => {
  const renderLinkButton = (source: ISource) => {
    return (
      <div
        className='cursor-pointer items-center rounded-lg px-2.5
      py-2.5 transition-all !duration-200 hover:scale-105 hover:bg-gray-200 hover:bg-opacity-75'
        onClick={() => window.open(source.url, '_blank')}
      >
        <Icon variant='link-external' />
      </div>
    );
  };

  return (
    <div className='flex w-full flex-col gap-2 self-stretch rounded-lg bg-indigo-100 bg-opacity-25 p-2'>
      <div className='flex'>
        <Badge.SourceInfo source={source} badgeClassName='!border-none' />
        <span className='flex-1'></span>
        {renderLinkButton(source)}
      </div>
      <div className='text-sm text-gray-500'>{source.description}</div>
    </div>
  );
};

interface InsightCardProps {
  insight: IInsight;
  cardClassName?: string;
}

const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  cardClassName = '',
}) => {
  return (
    <div
      className={`flex w-full flex-col gap-2 self-stretch rounded-lg border border-gray-200 bg-white p-4 shadow-sm ${cardClassName}`}
    >
      <div className='text-md mb-4 text-gray-900'>{insight.summary}</div>
      {insight.sources.map((source) => (
        <SourceCard key={source.uuid} source={source} />
      ))}
    </div>
  );
};

export default InsightCard;

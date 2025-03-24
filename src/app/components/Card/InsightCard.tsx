import { Badge, Icon } from '@components';
import React from 'react';
import ReactMarkdown from 'react-markdown';

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
    <div className='flex w-full flex-col gap-2 self-stretch rounded-lg p-2'>
      <div className='flex'>
        <Badge.SourceInfo source={source} badgeClassName='!border-none' />
        <span className='flex-1'></span>
        {renderLinkButton(source)}
      </div>
      <div className='aucctus-text-tertiary aucctus-text-sm break-words'>
        {source.description}
      </div>
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
      className={`aucctus-border-secondary aucctus-bg-primary flex w-full flex-col gap-2 self-stretch rounded-lg border p-4 shadow-sm ${cardClassName}`}
    >
      <div className='aucctus-text-primary aucctus-text-md mb-4'>
        <ReactMarkdown>{insight.summary}</ReactMarkdown>
      </div>
      {insight.sources.map((source) => (
        <SourceCard key={source.uuid} source={source} />
      ))}
    </div>
  );
};

export default InsightCard;

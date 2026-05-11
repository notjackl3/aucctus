import { SourceBadge, adaptISource } from '@components/SourceBadge';
import LinkButton from '@components/SourceBadge/LinkButton';
import { IInsight, ISource } from '@libs/api/types';
import React from 'react';
import ReactMarkdown from 'react-markdown';

interface SourceCardProps {
  source: ISource;
}

const SourceCard: React.FC<SourceCardProps> = ({ source }) => {
  return (
    <div className='flex w-full flex-col gap-2 self-stretch rounded-lg p-2'>
      <div className='flex'>
        <SourceBadge
          citation={adaptISource(source)}
          variant='standard'
          size='md'
          className='!border-none'
        />
        <span className='flex-1'></span>
        <LinkButton source={source} />
      </div>
      <div className='aucctus-text-tertiary aucctus-text-sm break-words'>
        {source.description}
      </div>
    </div>
  );
};

// TODO: Split these into 2 separate files
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

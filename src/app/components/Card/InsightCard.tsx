import { SourceBadge, adaptISource } from '@components/SourceBadge';
import { useCitationResolver } from '@hooks/useCitationResolver';
import { IInsight, ISource } from '@libs/api/types';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { ExternalLink } from 'lucide-react';

interface SourceCardProps {
  source: ISource;
}

const LinkButton: React.FC<{ source: ISource }> = ({ source }) => {
  const resolved = useCitationResolver(source.url);
  if (resolved.kind === 'noop') return null;
  const handleClick = (e: React.MouseEvent) => {
    if (resolved.kind === 'external') {
      window.open(resolved.href, resolved.target, 'noopener,noreferrer');
    } else {
      resolved.onClick(e);
    }
  };
  return (
    <div
      className='cursor-pointer items-center rounded-lg px-2.5
      py-2.5 transition-all !duration-200 hover:scale-105 hover:bg-gray-200 hover:bg-opacity-75'
      onClick={handleClick}
    >
      <ExternalLink />
    </div>
  );
};

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

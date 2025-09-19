import React from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import SourceBadgeList from './SourceBadgeList';
import type { ISource } from '@libs/api/types';
import type { IKeyFindingSourceV3 } from '@libs/api/types/concept/marketScan';

interface KeyFindingCardProps {
  finding: {
    text: string;
    source: string;
    type: string;
    direction: 'up' | 'down';
    sources?: IKeyFindingSourceV3[];
  };
}

const KeyFindingCard: React.FC<KeyFindingCardProps> = ({ finding }) => {
  // Helper function to create source description with citations (like AnswerCard approach)
  const createSourceDescriptionWithCitations = (source: ISource) => {
    const originalSource = finding.sources?.find((s) => s.uuid === source.uuid);
    const citations = originalSource?.citations || [];

    if (!source.description && (!citations || citations.length === 0)) {
      return null; // Will fallback to URL
    }

    return (
      <div className='space-y-2'>
        {source.description && (
          <div className='aucctus-text-xs aucctus-text-secondary'>
            {source.description}
          </div>
        )}
        {citations && citations.length > 0 && (
          <div className='aucctus-text-xs aucctus-text-tertiary space-y-1 italic'>
            {citations.map((citation: string, index: number) => {
              // Strip existing quotes to prevent double-quoting
              let cleaned = citation.trim();
              cleaned = cleaned.replace(/^[""]/, '').replace(/[""]$/, '');
              cleaned = cleaned.replace(/^['']/, '').replace(/['']$/, '');
              cleaned = cleaned.replace(/^[`]/, '').replace(/[`]$/, '');
              return <div key={index}>&ldquo;{cleaned}&rdquo;</div>;
            })}
          </div>
        )}
      </div>
    );
  };

  // Adapt sources from API format to ISource format
  const adaptedSources: ISource[] =
    finding.sources?.map((source) => ({
      uuid: source.uuid,
      title: source.title,
      description: source.summary,
      url: source.url,
      classification: source.classification,
    })) || [];

  return (
    <div className='aucctus-bg-primary aucctus-border-secondary h-full rounded-lg border p-4 shadow-sm transition-all duration-200 hover:shadow-md'>
      <div className='flex items-start gap-3'>
        <div
          className={cn({
            'flex-shrink-0 rounded-full border p-1.5': true,
            'aucctus-bg-success-secondary aucctus-border-success':
              finding.direction === 'up',
            'aucctus-bg-error-secondary aucctus-border-error':
              finding.direction === 'down',
          })}
        >
          <Icon
            variant={finding.direction === 'up' ? 'arrowup' : 'arrowdown'}
            className={cn({
              'h-3 w-3': true,
              'aucctus-stroke-success-primary': finding.direction === 'up',
              'aucctus-stroke-error-primary': finding.direction === 'down',
            })}
          />
        </div>
        <div className='min-w-0 flex-1'>
          <p className='aucctus-text-xs aucctus-text-secondary mb-3 leading-relaxed'>
            {finding.text}
          </p>

          {/* APPROACH 1: Separate citations display (current implementation) */}
          {/* Uncomment this block to show citations separately */}
          {/* 
          {finding.sources && finding.sources.some(source => source.citations && source.citations.length > 0) && (
            <div className='mb-3'>
              {finding.sources
                .filter(source => source.citations && source.citations.length > 0)
                .map((source, sourceIndex) => (
                  <div key={sourceIndex}>
                    {createCitationDisplay(source.citations!)}
                  </div>
                ))
              }
            </div>
          )}
          */}

          {/* APPROACH 2: Integrated citations in source badges (like AnswerCard) */}
          {/* Source badges with integrated citations */}
          {adaptedSources.length > 0 && (
            <SourceBadgeList
              sources={adaptedSources}
              className='mt-1'
              showPublishedDate={false}
              createSourceDescription={createSourceDescriptionWithCitations}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(KeyFindingCard);

import { Card } from '@components';
import { SourceBadge, adaptISource } from '@components/SourceBadge';
import LinkButton from '@components/SourceBadge/LinkButton';
import { ISource } from '@libs/api/types';
import React from 'react';

interface ConclusionVisualizationSourcesProps {
  sources: ISource[];
  showTooltip?: boolean;
}

const ConclusionVisualizationSources: React.FC<
  ConclusionVisualizationSourcesProps
> = ({ sources }) => {
  const renderSpacer = () => {
    return <span className='flex-1'></span>;
  };

  const renderSourceHeader = (source: ISource) => {
    return (
      <div className='flex w-full'>
        <SourceBadge
          citation={adaptISource(source)}
          variant='standard'
          size='md'
        />
        {renderSpacer()}
        <LinkButton source={source} />
      </div>
    );
  };

  const renderSourceContent = (source: ISource) => {
    return (
      <div className='mx-2 mb-2 flex flex-col gap-4 px-2 pb-2'>
        <div className='text-md text-gray-900'>{source.title}</div>
        <div className='aucctus-text-tertiary text-sm'>
          {source.description}
        </div>
      </div>
    );
  };

  const renderSources = () => {
    return sources.map((source) => {
      return (
        <Card.Detail
          key={source.url + Math.random()}
          cardClassName='w-full my-4'
          headerClassName='border-none !px-2'
          title={''}
          isHideFooter={true}
          headerAction={renderSourceHeader(source)}
        >
          {renderSourceContent(source)}
        </Card.Detail>
      );
    });
  };

  return <div>{renderSources()}</div>;
};

export default ConclusionVisualizationSources;

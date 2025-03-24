import { Badge, Card, Icon } from '@components';
import React from 'react';

interface ConclusionVisualizationSourcesProps {
  sources: ISource[];
  showTooltip?: boolean;
}

const ConclusionVisualizationSources: React.FC<
  ConclusionVisualizationSourcesProps
> = ({ sources }) => {
  const renderLinkButton = (source: ISource) => {
    return (
      <div
        className='cursor-pointer items-center rounded-lg px-2.5 py-2.5 transition-all !duration-200 hover:scale-105 hover:bg-gray-100'
        onClick={() => window.open(source.url, '_blank')}
      >
        <Icon variant='link-external' />
      </div>
    );
  };

  const renderSpacer = () => {
    return <span className='flex-1'></span>;
  };

  const renderSourceHeader = (source: ISource) => {
    return (
      <div className='flex w-full'>
        <Badge.SourceInfo
          source={source}
          onClick={() => window.open(source.url, '_blank')}
          showPublishedDate={true}
        />
        {renderSpacer()}
        {renderLinkButton(source)}
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

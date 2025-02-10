import { ISource } from '@libs/api/types';
import images from '@assets/img';
import { FunctionComponent, useCallback } from 'react';
import { cn } from '@libs/utils/react';

interface MultiSourceBadgeProps {
  sources: ISource[];
  width?: number;
}

const MultiSourceBadge: FunctionComponent<MultiSourceBadgeProps> = ({
  sources,
  width = 80,
}) => {
  const getBaseUrl = (url: string): string => {
    try {
      const urlObject = new URL(url);
      return urlObject.hostname.replace(/^www\./, '');
    } catch (e) {
      return url;
    }
  };

  const renderSourceImages = useCallback(() => {
    const numPlusSources = Math.max(sources.length - 4, 1);
    const numShowSources = Math.max(sources.length - numPlusSources, 0);
    const sourcesToShow = sources.slice(0, numShowSources);

    return (
      <div className='flex flex-row'>
        {sourcesToShow.map((source, index) => (
          <div
            className={cn(
              'flex h-4 w-4 items-center justify-center overflow-hidden rounded-full bg-white',
              index !== sourcesToShow.length - 1 || sources.length <= 4
                ? '-mr-1'
                : '',
            )}
            key={source.url + Math.random()}
          >
            <img
              className='h-full w-full object-contain'
              alt='source-logo'
              src={`https://logo.clearbit.com/${getBaseUrl(source.url) || ''}`}
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = images.link;
              }}
            />
          </div>
        ))}
        <div className='-ml-1 flex items-center justify-center'>
          <span
            className={`flex h-4 w-4 items-center justify-center rounded-full bg-gray-800 pr-[0.1rem] text-[0.6rem] font-medium text-white ${
              sourcesToShow.length < 1 ? 'ml-[0.3rem]' : ''
            }`}
          >
            +{numPlusSources}
          </span>
        </div>
      </div>
    );
  }, [sources]);

  return (
    <div
      className={cn(
        'flex items-center rounded-2xl border border-gray-300 p-1',
        `w-[${width}px]`,
      )}
    >
      {renderSourceImages()}
    </div>
  );
};

export default MultiSourceBadge;

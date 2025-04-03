import { Card, Icon, Modal } from '@components';
import { useModal } from '@context/ModalContextProvider';
import {
  IInsight,
  ISource,
  ISupport,
  ITrendsAndDrivers,
} from '@libs/api/types';
import { FunctionComponent, useCallback, useMemo, useRef } from 'react';
import SourceBadgeFooter from './Sources/SourceBadgeFooter';

const iconDefaultProps = {
  height: 19,
  width: 19,
  stroke: '#2B3674',
};

interface ITrendsAndDriversProps {
  trendAndDriver: ITrendsAndDrivers;
  cardClassName?: string;
}

const TrendAndDriverCard: FunctionComponent<ITrendsAndDriversProps> = ({
  trendAndDriver,
  cardClassName = '',
}) => {
  const { openModal } = useModal();

  const sources = useMemo<ISource[]>(() => {
    // Create a Map where each key is a source's URL and each value is the source object
    const sourceMap: Map<string, ISource> = new Map(
      trendAndDriver.support.insights
        .flatMap((insight: IInsight) => insight.sources)
        .map((source: ISource) => [source.url, source]),
    );

    // Convert the Map's values to an array
    return Array.from(sourceMap.values());
  }, [trendAndDriver.support.insights]);

  const handleSupportModalClick = useCallback(
    (title: string, conclusion: string, support: ISupport) => {
      openModal(
        Modal.ConclusionVisualization,
        {
          conclusion: title,
          reasoning: conclusion,
          insights: support.insights,
          sources: sources,
        },
        { position: 'right' },
      );
    },
    [openModal, sources],
  );

  const footerActionRef = useRef<HTMLDivElement>(null);

  const conclusionVisualizationButton = useMemo(() => {
    return (
      <div
        onClick={() =>
          handleSupportModalClick(
            trendAndDriver.name,
            trendAndDriver.description,
            trendAndDriver.support,
          )
        }
        className='aucctus-bg-tertiary-hover flex aspect-square 
        cursor-pointer items-center justify-center
        rounded-md p-[4px] transition-colors'
      >
        <Icon variant='link-source' {...iconDefaultProps} />
      </div>
    );
  }, [
    handleSupportModalClick,
    trendAndDriver.description,
    trendAndDriver.name,
    trendAndDriver.support,
  ]);

  return (
    <Card.Detail
      cardClassName={cardClassName}
      title=''
      key={trendAndDriver.uuid}
      isHideHeader
      footerAction={
        <div
          ref={footerActionRef}
          className='flex w-full justify-between gap-2'
        >
          {sources.length > 0 && (
            <SourceBadgeFooter
              className='flex gap-2 overflow-hidden'
              parentContainerRef={footerActionRef}
              sources={sources}
            />
          )}
          {conclusionVisualizationButton}
        </div>
      }
    >
      <div className='aucctus-bg-primary-hover flex cursor-pointer flex-col gap-4 p-6'>
        <span className='aucctus-text-primary aucctus-text-md-bold'>
          {trendAndDriver.name}
        </span>

        <p className='aucctus-text-secondary aucctus-text-sm'>
          {trendAndDriver.description}
        </p>
      </div>
    </Card.Detail>
  );
};

export default TrendAndDriverCard;

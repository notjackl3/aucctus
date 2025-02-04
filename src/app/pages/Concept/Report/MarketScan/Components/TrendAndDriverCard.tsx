import images from '@assets/img';
import { Card, Icon, Modal } from '@components';
import { useModal } from '@context/ModalContextProvider';
import { IInsight, ISupport, ITrendsAndDrivers } from '@libs/api/types';
import { FunctionComponent, useCallback } from 'react';

const iconDefaultProps = {
  height: 19,
  width: 19,
  stroke: '#2B3674',
};

interface ITrendsAndDriversProps {
  trendAndDriver: ITrendsAndDrivers;
}

const trends = {
  increasing: 'Increasing Popularity',
  decreasing: 'Decreasing Popularity',
  stagnating: 'Stagnant Popularity',
};

const TrendAndDriverCard: FunctionComponent<ITrendsAndDriversProps> = ({
  trendAndDriver,
}) => {
  const { openModal } = useModal();

  const handleSupportModalClick = useCallback(
    (title: string, conclusion: string, support: ISupport) => {
      openModal(
        Modal.ConclusionVisualization,
        {
          conclusion: title,
          reasoning: support.insights
            .map((i: IInsight) => i.description)
            .join('\n\n'),
          insights: support.insights,
          sources: Array.from(
            new Map(
              support.insights
                .flatMap((i: IInsight) => i.sources) // Flatten all sources arrays
                .map((source) => [source.url, source]), // Use source.url as the key
            ).values(), // Get only the unique values
          ),
        },
        { position: 'right' },
      );
    },
    [openModal, trendAndDriver],
  );

  const renderTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return (
          <Icon variant='increasing' {...iconDefaultProps} stroke='#17B26A' />
        );
      case 'decreasing':
        return (
          <div className='rounded-md bg-[#EAECF0] p-[4px]'>
            <Icon variant='decreasing' {...iconDefaultProps} stroke='#F04438' />
          </div>
        );
      case 'stagnating':
        return (
          <div className='rounded-md bg-[#EAECF0] p-[4px]'>
            <Icon variant='stagnating' {...iconDefaultProps} stroke='#F79009' />
          </div>
        );
    }
  };
  return (
    <Card.Detail
      title=''
      key={trendAndDriver.uuid}
      isHideHeader
      footerAction={
        <div className='flex w-full items-center justify-between p-2'>
          <div className='flex items-center gap-2'>
            <div className='mr-2'>
              {renderTrendIcon(trendAndDriver.trendChange)}
            </div>
            <div>
              <div className='text-[8px] font-normal text-[#0C111D]'>
                12 Month-Trend
              </div>

              <div className='text-[10px] font-bold leading-[20px] text-[#0C111D]'>
                {trends[trendAndDriver.trendChange]}
              </div>
            </div>
          </div>
          <div
            onClick={() =>
              handleSupportModalClick(
                trendAndDriver.name,
                trendAndDriver.description,
                trendAndDriver.support,
              )
            }
            className='cursor-pointer rounded-md bg-[#EAECF0] p-[4px]'
          >
            <Icon variant='link-source' {...iconDefaultProps} />
          </div>
        </div>
      }
    >
      <div className='flex cursor-pointer flex-col gap-4 p-6 hover:bg-gray-50'>
        <img
          alt='delivery-trend'
          src={trendAndDriver.imagePath ?? 'url'}
          className='h-[120px] w-full object-cover object-center'
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            const imageArray = [
              images.trendOne,
              images.trendTwo,
              images.trendThree,
            ];
            const randomImage =
              imageArray[Math.floor(Math.random() * imageArray.length)];
            e.currentTarget.src = randomImage;
          }}
        />
        <span className='text-base font-bold leading-6 text-gray-950'>
          {trendAndDriver.name}
        </span>

        <p className='font-400 text-sm text-[#0C111D]'>
          {trendAndDriver.description}
        </p>
      </div>
    </Card.Detail>
  );
};

export default TrendAndDriverCard;

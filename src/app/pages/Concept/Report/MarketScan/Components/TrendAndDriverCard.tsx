import images from '@assets/img';
import { Card, Icon } from '@components';
import EditMarketScanElement from '@components/Modal/MarketScanElement/EditMarketScanElement';
import { useModal } from '@context/ModalContextProvider';
import {
  useTrendAndDriverDelete,
  useTrendAndDriverUpdate,
} from '@hooks/query/concepts.hook';
import { ITrendsAndDrivers } from '@libs/api/types';
import { FunctionComponent } from 'react';

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
  const { mutate: deleteItem } = useTrendAndDriverDelete();
  const { mutate: updateItem } = useTrendAndDriverUpdate();

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
          <div className='cursor-pointer rounded-md bg-[#EAECF0] p-[4px]'>
            <Icon variant='link-source' {...iconDefaultProps} />
          </div>
        </div>
      }
    >
      <div
        className='flex cursor-pointer flex-col gap-4 p-6 hover:bg-gray-50'
        // onClick={() =>
        //   openModal(EditMarketScanElement, {
        //     item: trendAndDriver,
        //     deleteItem,
        //     updateItem,
        //   })
        // }
      >
        <img
          alt='delivery-trend'
          src={trendAndDriver.imagePath ?? 'url'}
          className='h-[120px] w-full object-cover object-center'
          onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
            const randomNumber = Math.floor(Math.random() * 3) + 1; // Random number between 1 and 3
            e.currentTarget.src = images.trendOne;
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

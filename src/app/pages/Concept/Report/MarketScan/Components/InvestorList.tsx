// Tailwind CSS equivalent for EcosystemList
import { FunctionComponent, useCallback } from 'react';
import EditMarketScanElement from '@components/Modal/MarketScanElement/EditMarketScanElement';
import { useModal } from '@context/ModalContextProvider';
import {
  useEcosystemCreate,
  useEcosystemDelete,
  useEcosystemUpdate,
} from '@hooks/query/concepts.hook';
import { Ecosystem, EcosystemType } from '@libs/api/types';
import { Card, Icon } from '@components';
import AddMarketScanElement from '@components/Modal/MarketScanElement/AddMarketScanElement';
import { useParams } from 'react-router-dom';

const iconDefaultProps = {
  height: 24,
  width: 24,
  stroke: '#2B3674',
};

interface IEcosystemListProps {
  title: string;
  data: Ecosystem[];
  ecosystemType: EcosystemType;
}

const InvestorList: FunctionComponent<IEcosystemListProps> = ({
  title,
  data,
  ecosystemType,
}) => {
  const { id: conceptId = '' } = useParams();
  const { openModal } = useModal();
  const { mutate: addEcosystem } = useEcosystemCreate(conceptId || '');
  const { mutate: deleteItem } = useEcosystemDelete();
  const { mutate: updateItem } = useEcosystemUpdate();

  const onContainerClick = useCallback(
    (item: Ecosystem) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      openModal(EditMarketScanElement, { item, deleteItem, updateItem });
      e.preventDefault();
    },
    [deleteItem, openModal, updateItem],
  );

  const onClick = useCallback(
    (item: Ecosystem) =>
      (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
        window.open(item.source, '_blank');
        e.preventDefault();
        e.stopPropagation();
      },
    [],
  );

  return (
    <Card.Detail
      title={title}
      footerAction={
        <button
          className='bg-light rounded-md p-2 shadow hover:shadow-lg'
          onClick={() => {
            openModal(AddMarketScanElement, {
              addItem: addEcosystem,
              ecosystemType,
            });
          }}
        >
          <Icon variant='plus' />
        </button>
      }
    >
      <div className='flex w-full flex-col'>
        {data?.map((item) => (
          <div
            key={item.uuid}
            className='flex cursor-pointer items-center justify-between border-b p-4 last:border-none hover:bg-gray-50'
            onClick={onContainerClick(item)}
          >
            <img
              className='h-12 w-12'
              alt='company-logo'
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                e.currentTarget.src = 'path/to/default-logo.png';
              }}
              src={`https://logo.clearbit.com/${item.source}`}
            />
            <div className='ml-4 flex-1'>
              <span className='text-lg font-semibold text-blue-900'>
                {item.name}
              </span>
              <p className='mt-1 text-sm text-gray-600'>{item.description}</p>
            </div>
            <button
              className='bg-light rounded-md p-2 shadow hover:shadow-lg'
              onClick={onClick(item)}
            >
              <Icon variant='link-external' {...iconDefaultProps} />
            </button>
          </div>
        ))}
      </div>
    </Card.Detail>
  );
};

export default InvestorList;

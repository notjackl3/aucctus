import { FunctionComponent, useCallback, useRef } from 'react';
import ConceptDetailCard from '../../../../components/Cards/ConceptDetailCard/ConceptDetailCard';
import { Ecosystem } from '../../../../../libs/api/types';
import images from '../../../../assets/img';
import Icon from '../../../../components/Icons/Icon/Icon';
import { useEcosystemDelete, useEcosystemUpdate } from '../../../../hooks/query/concepts.hook';
import { useModal } from '../../../../context/modal/ModalContextProvider';
import EditMarketScanElement from '../../../../components/Modal/EditMarketScanElement/EditMarketScanElement';

import styles from './styles/marketDetails.module.scss';

const iconDefaultProps = {
  height: 24,
  width: 24,
  stroke: '#2B3674',
};

interface IEcosystemListProps {
  title: string;
  data: Ecosystem[];
}

const EcosystemList: FunctionComponent<IEcosystemListProps> = ({ title, data }) => {
  const { openModal } = useModal();
  const { mutate: deleteItem } = useEcosystemDelete();
  const { mutate: updateItem } = useEcosystemUpdate();
  const ref = useRef<HTMLDivElement>(null);

  const onContainerClick = useCallback(
    (item: Ecosystem) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      openModal(EditMarketScanElement, { item, deleteItem, updateItem });
      e.preventDefault();
    },
    [deleteItem, openModal, updateItem]
  );

  const onClick = useCallback(
    (item: Ecosystem) => (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      window.open(item.source, '_blank');
      e.preventDefault();
      e.stopPropagation();
    },
    []
  );

  return (
    <div ref={ref}>
      <ConceptDetailCard title={title} isHideFooter>
        <div className={styles.cardContent}>
          {data?.map((item) => (
            <div key={item.uuid} className={`${styles.cardRow} ${styles.editCard}`} onClick={onContainerClick(item)}>
              <img
                className={styles.cardLogo}
                alt="company-logo"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  e.currentTarget.src = images.companyLogoDefault;
                }}
                src={`https://logo.clearbit.com/${item.source}`}
              />
              <div className={styles.cardDescription}>
                <span className={styles.cardDescriptionTitle}>{item.name}</span>
                <p className={styles.cardDescriptionText}>{item.description}</p>
              </div>
              <button className="btn btn-light" onClick={onClick(item)}>
                <Icon variant={'link-external'} {...iconDefaultProps} />
              </button>
            </div>
          ))}
        </div>
      </ConceptDetailCard>
    </div>
  );
};

export default EcosystemList;

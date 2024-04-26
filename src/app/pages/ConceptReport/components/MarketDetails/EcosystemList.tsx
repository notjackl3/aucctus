import { FunctionComponent, useCallback, useEffect, useRef, useState } from 'react';
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
  const [isEditing, setEditing] = useState(false);
  const { openModal, isOpen } = useModal();
  const { mutate: deleteItem } = useEcosystemDelete();
  const { mutate: updateItem } = useEcosystemUpdate();
  const ref = useRef<HTMLDivElement>(null);

  const onEditClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    setEditing((prev) => !prev);
    e.preventDefault();
    e.stopPropagation();
  };

  const onContainerClick = useCallback(
    (item: Ecosystem) => (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (isEditing) {
        openModal(EditMarketScanElement, { item, deleteItem, updateItem });
      } else {
        window.open(item.source, '_blank');
      }
      e.preventDefault();
      e.stopPropagation();
    },
    [deleteItem, isEditing, openModal, updateItem]
  );

  useEffect(() => {
    if (!isEditing || !ref.current) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node) && !isOpen) {
        setEditing(false);
      }
    };

    window.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isEditing, isOpen]);

  return (
    <div ref={ref}>
      <ConceptDetailCard
        title={title}
        headerAction={
          <button className={!isEditing ? 'btn btn-light btn-no-border' : 'btn-close'} onClick={onEditClick}>
            {!isEditing ? <Icon variant="edit" /> : null}
          </button>
        }
        isHideFooter
      >
        <div className={styles.cardContent}>
          {data?.map((item) => (
            <div
              key={item.uuid}
              className={`${styles.cardRow} ${isEditing ? styles.editCard : ''}`}
              onClick={onContainerClick(item)}
            >
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
              <Icon variant={isEditing ? 'edit' : 'link-external'} {...iconDefaultProps} />
            </div>
          ))}
        </div>
      </ConceptDetailCard>
    </div>
  );
};

export default EcosystemList;

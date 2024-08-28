import { IAssumption } from '@libs/api/types';
import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';

import styles from './styles/hypothesisDetails.module.scss';

import { Badge, Icon } from '@components';

import EditKeyAssumptionModal from '@components/Modal/KeyAssumtionModal/EditKeyAssumtionModal';
import { useModal } from '@context/ModalContextProvider';

const columnHelper = createColumnHelper<IAssumption>();

export function useAssumptionsColumns() {
  const { openModal } = useModal();

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row?.uuid, {
        id: 'uuid',
        header: () => <span className={styles.details}> Title </span>,
        minSize: 125,
        size: 280,
        cell: (info) => (
          <span className={styles.assumption}>
            <span className={styles.assumptionTitle}>
              {' '}
              {info.row.original.name}{' '}
            </span>
            <span
              className={`${styles.assumptionDescription} ${styles.cellDescription}`}
            >
              {info.row.original.hypothesis}
            </span>
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.riskCategory, {
        id: 'riskCategory',
        cell: (info) => (
          <span className={styles.riskCategory}>
            <Badge.RiskLevel variant={info.getValue()} text={info.getValue()} />
          </span>
        ),
        minSize: 125,
        size: 125,
        header: () => <span>Risk </span>,
      }),
      columnHelper.accessor((row) => row.assumptionsType, {
        id: 'assumptionsType',
        minSize: 150,
        size: 150,
        header: () => <span>Type </span>,
        cell: (info) => (
          <span className={styles.reviewConceptLink}>
            <Badge.Assumption type={info.getValue()} />
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.assumptionsType, {
        id: 'uuid',
        minSize: 10,
        size: 10,
        header: () => <span> </span>,
        cell: (info) => (
          <span className={styles.buttonContainer}>
            <button
              className='btn btn-light btn-no-border'
              onClick={(e) => {
                openModal(EditKeyAssumptionModal, {
                  assumption: info.row.original,
                });
                e.preventDefault();
              }}
            >
              <Icon variant='edit' />
            </button>
          </span>
        ),
      }),
    ],
    [openModal],
  );

  return {
    columns,
  };
}

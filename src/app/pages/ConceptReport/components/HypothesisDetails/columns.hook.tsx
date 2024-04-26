import { createColumnHelper } from '@tanstack/react-table';
import { IAssumption } from '../../../../../libs/api/types';
import { useMemo } from 'react';

import styles from './styles/hypothesisDetails.module.scss';
import GeneralBadge from '../../../../components/Badges/GeneralBadge/GeneralBadge';
import AssumptionBadge from '../../../../components/Badges/AssumptionBadge/AssumptionBadge';

const columnHelper = createColumnHelper<IAssumption>();

export function useAssumptionsColumns() {
  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row?.uuid, {
        id: 'uuid',
        header: () => <span className={styles.details}> Title </span>,
        minSize: 280,
        size: 280,
        cell: (info) => (
          <div className={styles.assumption}>
            <span className={styles.assumptionTitle}> {info?.row?.original?.name} </span>
            <span className={`${styles.assumptionDescription} ${styles.cellDescription}`}>
              {info?.row?.original?.hypothesis}
            </span>
          </div>
        ),
      }),
      columnHelper.accessor((row) => row.riskCategory, {
        id: 'riskCategory',
        cell: (info) => (
          <div className={styles.riskCategory}>
            <GeneralBadge variant={`${info.getValue()}Risk`} badgeText={info.getValue()} />
          </div>
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
          <div className={styles.reviewConceptLink}>
            <AssumptionBadge assumptionType={info.getValue()} />
          </div>
        ),
      }),
    ],
    []
  );

  return {
    columns,
  };
}

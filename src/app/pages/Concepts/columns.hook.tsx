import { createColumnHelper } from '@tanstack/react-table';
import { useMemo } from 'react';
import { IConcept } from '../../../libs/api/types';
import { dateFormatter } from '../../../libs/utils';
import TableCheckBox from '../../components/Tables/TableCheckBox';

import ConceptStatusBubble from '../../components/Badges/ConceptStatus';
import ConceptRowButton from '../../components/Buttons/ConceptGenerateButton';
import ConceptMenu from '../../components/Buttons/ConceptMenu/ConceptMenu';
import Icon from '../../components/Icons/Icon/Icon';
import { useConceptUpdate, useRetryConceptReport } from '../../hooks/query/concepts.hook';

import { useNavigate } from 'react-router-dom';
import { AppPath } from '../../../routes/routes';
import styles from './styles/concepts.module.scss';

const columnHelper = createColumnHelper<IConcept>();

export const useConceptTableColumns = (
  ref: React.RefObject<HTMLDivElement>,
  setOpenPopupMenuId: React.Dispatch<React.SetStateAction<string | undefined>>,
  openPopupMenuId: string | undefined,
) => {
  const navigate = useNavigate();
  const { mutate: updateConcept } = useConceptUpdate();
  const { mutate: retryConceptReport } = useRetryConceptReport();

  const columns = useMemo(
    () => [
      columnHelper.accessor((row) => row.status, {
        id: 'select',
        size: 50,
        header: ({ table }) => (
          <TableCheckBox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: (event) => {
                table.getToggleAllPageRowsSelectedHandler()(event);
              },
            }}
          />
        ),
        cell: ({ row }) => {
          return (
            <TableCheckBox
              {...{
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                indeterminate: row.getIsSomeSelected(),
                onChange: (e) => {
                  e.stopPropagation();
                  row.getToggleSelectedHandler()(e);
                },
                onClick: (e) => {
                  e.stopPropagation();
                },
              }}
            />
          );
        },
      }),
      columnHelper.accessor('title', {
        id: 'title',
        header: () => <span className={styles.details}>Concept</span>,
        size: 190,
        minSize: 190,
        cell: (info) => <div className={styles.company}>{info.getValue()}</div>,
      }),
      columnHelper.accessor((row) => row?.description, {
        id: 'description',
        cell: (info) => (
          <span style={{ flexGrow: 1 }} className={styles.cellDescription}>
            {info.getValue()}
          </span>
        ),
        size: 200,
        minSize: 200,
        header: () => <div style={{ flexGrow: 1 }}>Description</div>,
      }),
      columnHelper.accessor((row) => row.updatedAt, {
        id: 'updatedAt',
        size: 110,
        minSize: 110,
        cell: (info) => dateFormatter(info.getValue()),
        header: () => <span>Last Modified</span>,
      }),
      columnHelper.accessor((row) => row?.status, {
        id: 'status',
        size: 200,
        minSize: 200,
        header: () => <span>Status</span>,
        cell: (info) => (
          <span>
            <ConceptStatusBubble status={info.getValue()} />
          </span>
        ),
      }),
      columnHelper.accessor((row) => row.reportStatus, {
        id: 'reportStatus',
        cell: ({ row }) => (
          <ConceptRowButton
            variant={row.original.reportStatus}
            onClick={(e) => {
              const reportStatus = row.original.reportStatus;
              switch (reportStatus) {
                case 'notStarted':
                  updateConcept({
                    uuid: row.original.uuid,
                    status: 'ideating',
                  });
                  break;
                case 'error':
                  retryConceptReport(row.original.uuid);
                  break;
                case 'complete':
                  navigate(AppPath.ConceptOverview.replace(':id', row.original.uuid));
                  break;
                default:
                  e.stopPropagation();
              }
            }}
          />
        ),
        minSize: 120,
        size: 120,
        header: () => {},
      }),
      columnHelper.accessor((row) => row?.uuid, {
        id: 'uuid',
        minSize: 30,
        size: 30,
        header: () => {},
        cell: (info) => {
          const uuid = info.getValue();
          const { reportStatus, status } = info.row.original;

          return (
            <span className={styles.conceptMenu}>
              <button
                className={styles.button}
                onClick={(e) => {
                  setOpenPopupMenuId((prev) => (uuid !== prev ? uuid : undefined));
                  e.stopPropagation();
                }}
              >
                <Icon variant='dots-vertical' height={24} width={24} stroke='#B4BDD0' />
              </button>
              {uuid === openPopupMenuId ? (
                <span className={styles.popupMenu} ref={ref}>
                  <ConceptMenu uuid={uuid} status={status} reportStatus={reportStatus} />
                </span>
              ) : null}
            </span>
          );
        },
      }),
    ],
    [updateConcept, navigate, retryConceptReport, openPopupMenuId, ref, setOpenPopupMenuId],
  );

  return columns;
};

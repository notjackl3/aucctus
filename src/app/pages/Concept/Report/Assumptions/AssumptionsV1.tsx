// TODO: DEPRECATE - This is the legacy V1 assumptions component.
// Remove this file once all users have migrated to AssumptionsV2.tsx
// Related files to remove: useAssumptionsTable hook, V1 table components

import {
  Badge,
  Card,
  Chart,
  Header,
  Icon,
  Loading,
  Modal,
  Table,
} from '@components';
import { Point } from '@components/Charts/ScatterChart/ScatterChart';
import { useModal } from '@context/ModalContextProvider';
import {
  useAssumptionTestDetails,
  useAssumptionTestStatusOverview,
} from '@hooks/query/assumptions.hook';
import { useAssumptionsTable } from '@hooks/tables/assumptions.hook';
import {
  getAssumptionActiveColorClass,
  getAssumptionHexColor,
} from '@libs/utils/concepts';
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { IConceptReportContext } from '../ConceptReport/ConceptReport';

const AssumptionsV1: React.FC = () => {
  const { concept } = useOutletContext<IConceptReportContext>();
  const { openModal } = useModal();

  const {
    data: assumptionTestStatusOverview,
    isLoading: isStatusOverviewLoading,
  } = useAssumptionTestStatusOverview(concept.uuid);
  const {
    daysRemaining,
    riskiestCategoryStatus,
    riskiestCategory,
    averageDuration,
    daysPast,
  } = assumptionTestStatusOverview?.overview || {};

  const {
    table,
    selectedAssumptionUuid,
    handleRowClick,
    data,
    assumptions,
    isLoading: isAssumptionsLoading,
  } = useAssumptionsTable(concept.uuid);

  const { testDetails = [] } = useAssumptionTestDetails(
    selectedAssumptionUuid || '',
  );

  const isLoading = isStatusOverviewLoading || isAssumptionsLoading;

  const scatterPoints: Point[] = React.useMemo(() => {
    return assumptions.map((item) => ({
      x: item.certainty,
      y: item.importance,
      color: getAssumptionHexColor(item.category),
      activeColor: getAssumptionActiveColorClass(item.category),
      id: item.uuid,
    }));
  }, [assumptions]);

  if (isLoading) {
    return (
      <div className='flex h-full w-full flex-col gap-6'>
        <div className='flex h-full min-h-96 w-full items-center justify-center align-middle'>
          <Loading />
        </div>
      </div>
    );
  }

  // Handle case where loading is finished but no assumptions exist
  if (!isLoading && assumptions.length === 0) {
    return (
      <div className='aucctus-text-secondary flex h-full w-full flex-col items-center justify-center gap-6 p-8'>
        No key assumptions found for this concept.
      </div>
    );
  }

  return (
    <div className='flex h-auto w-full flex-col gap-6'>
      {/* Upper most cards */}
      <div className='flex h-full w-full flex-row flex-wrap gap-6'>
        {/* Assumptions Testing Status & Overview Cards */}
        <div className='flex flex-grow flex-col justify-between gap-6'>
          <Card.AssumptionsTestingStatus
            overview={assumptionTestStatusOverview}
          />
          <div className={'inline-flex items-center justify-between'}>
            <Card.AssumptionOverview
              header='Average Test Duration'
              body={averageDuration ? `${averageDuration} Days` : undefined}
              footer={''}
            />
            <Card.AssumptionOverview
              header='Test Days Remaining'
              body={daysRemaining ? `${daysRemaining} Days` : undefined}
              footer={daysPast ? `${daysPast} Days Consumed` : undefined}
            />
            <Card.AssumptionOverview
              header='Riskiest Category'
              body={
                riskiestCategory ? (
                  <Badge.AssumptionCategory
                    category={riskiestCategory}
                    textProps={{ className: 'text-xl' }}
                  />
                ) : (
                  ''
                )
              }
              footer={
                riskiestCategoryStatus ? (
                  <Badge.ValidationStatus status={riskiestCategoryStatus} />
                ) : (
                  ''
                )
              }
            />
          </div>
        </div>

        {/* Assumptions Testing Priority */}
        <div className='aucctus-border-secondary aucctus-bg-primary inline-flex min-h-[440px] min-w-[470px] flex-shrink-0 flex-col items-start justify-start gap-3 rounded-lg border p-6'>
          <Header.Two text='Assumption Testing Priority' className='text-xl' />
          <Chart.Scatter
            xAxis={{
              upperLabel: 'Certainty',
              lowerLabel: 'Uncertainty',
            }}
            yAxis={{
              upperLabel: 'High Importance',
              lowerLabel: 'Low Importance',
            }}
            data={scatterPoints}
            selectedItem={selectedAssumptionUuid}
          />
        </div>
      </div>
      {/* Assumptions & Testing Table */}
      <div className='aucctus-border-secondary aucctus-bg-primary flex w-full rounded-lg border'>
        {/* Assumptions */}
        <div className='aucctus-border-secondary flex w-full min-w-[400px] flex-grow flex-col items-start justify-start overflow-y-auto border-r'>
          {/* Header */}
          <Header.AssumptionsTable
            text='Assumptions'
            count={data ? data.count : 0}
            handleAdd={() => null}
          />
          <div className='aucctus-border-secondary inline-flex w-full items-center justify-between self-stretch border-b px-3 py-2'>
            <div>{/* This will display active filters */}</div>
            <div className='inline-flex h-3 items-center justify-end gap-2'>
              <button>
                <Icon variant='filter-lines' />
              </button>
              <button>
                <Icon variant='list' />
              </button>
            </div>
          </div>

          <div className='min-h-[675px] w-full'>
            <Table
              selectedRowId={selectedAssumptionUuid}
              table={table}
              handleRowClick={handleRowClick}
              rowProps={{
                className: 'align-top text-left',
              }}
            />
          </div>
          {/* Footer */}
          <div className='aucctus-border-secondary w-full border-t'>
            <Table.Pagination
              page={1}
              numberOfPages={data?.numberOfPages || 0}
              onPageChange={() => null}
              hideNavText
            />
          </div>
        </div>

        {/* Testing */}
        <div className='flex min-w-[470px] flex-shrink-0 flex-col items-start justify-start'>
          {/* Fixed Header */}
          <Header.AssumptionsTable
            text='Tests'
            count={testDetails.length}
            handleAdd={() => null}
          />

          {/* Scrollable Content */}
          <div className='flex min-h-[675px] w-full flex-col items-center gap-3  overflow-y-auto px-4 py-8'>
            {/* This will be a list of cards... */}
            {testDetails.map((test) => (
              <Card.Testing
                key={`test-card-${test.uuid}`}
                type={test.type}
                identifier={test.identifier}
                duration={test.duration}
                description={test.goal}
                status={test.status}
                stage={test.stage}
                handleStartTest={() => {}}
                handleOpenTest={() =>
                  openModal(Modal.TestModal, {
                    conceptUuid: concept.uuid,
                    testUuid: test.testUuid,
                    identifier: test.identifier,
                  })
                }
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssumptionsV1;

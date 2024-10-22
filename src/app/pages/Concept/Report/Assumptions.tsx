import { Badge, Card, Chart, Header, Icon, Modal, Table } from '@components';
import { Point } from '@components/Charts/ScatterChart/ScatterChart';
import { useModal } from '@context/ModalContextProvider';
import {
  useAssumptionTestDetails,
  useAssumptionTestStatusOverview,
  useStartTest,
} from '@hooks/query/assumptions.hook';
import { useAssumptionsTable } from '@hooks/tables/assumptions.hook';
import {
  getAssumptionActiveHexColor,
  getAssumptionHexColor,
} from '@libs/utils/concepts';
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { IConceptReportContext } from './ConceptReport';

const KeyAssumptions: React.FC = () => {
  const { concept } = useOutletContext<IConceptReportContext>();
  const { openModal } = useModal();

  const { data: assumptionTestStatusOverview } =
    useAssumptionTestStatusOverview(concept.uuid);
  const {
    daysRemaining,
    riskiestCategoryStatus,
    riskiestCategory,
    averageDuration,
    daysPast,
  } = assumptionTestStatusOverview?.overview || {};

  const { table, selectedAssumptionUuid, handleRowClick, data, assumptions } =
    useAssumptionsTable(concept.uuid);

  const { testDetails = [] } = useAssumptionTestDetails(
    selectedAssumptionUuid || '',
  );

  const { mutate: startTest } = useStartTest(selectedAssumptionUuid || '');

  const scatterPoints: Point[] = React.useMemo(() => {
    return assumptions.map((item) => ({
      x: item.certainty,
      y: item.importance,
      color: getAssumptionHexColor(item.category),
      activeColor: getAssumptionActiveHexColor(item.category),
      id: item.uuid,
    }));
  }, [assumptions]);

  return (
    <div className='flex h-auto w-full flex-col gap-6'>
      {/* Upper most cards */}
      <div className='flex w-fit h-full flex-row flex-wrap gap-6'>
        {/* Assumptions Testing Status & Overview Cards */}
        <div className='flex flex-col gap-6 justify-between'>
          <Card.AssumptionsTestingStatus
            overview={assumptionTestStatusOverview}
          />
          <div className={'inline-flex items-center justify-between'}>
            <Card.AssumptionOverview
              header="Average Test Duration"
              body={averageDuration ? `${averageDuration} Days` : undefined}
              footer={''}
            />
            <Card.AssumptionOverview
              header="Test Days Remaining"
              body={daysRemaining ? `${daysRemaining} Days` : undefined}
              footer={daysPast ? `${daysPast} Days Consumed` : undefined}
            />
            <Card.AssumptionOverview
              header="Riskiest Category"
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
        <div className='inline-flex min-h-[440px] min-w-[470px] flex-col items-start justify-start gap-3 rounded-lg border border-gray-200 bg-white p-6'>
          <Header.Two text="Assumption Testing Priority" className="text-xl" />
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
      <div className='flex w-fit rounded-lg border border-gray-200 bg-white'>
        {/* Assumptions */}
        <div className='flex w-full min-w-[400px] max-w-[600px] flex-col items-start justify-start overflow-y-auto border-r border-gray-200'>
          {/* Header */}
          <Header.AssumptionsTable
            text='Assumptions'
            count={data ? data.count : 0}
            handleAdd={() => null}
          />
          <div className='inline-flex w-full items-center justify-between self-stretch border-b border-gray-200 px-3 py-2'>

            <div>
              {/* This will display active filters */}
            </div>
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
          <div className='w-full border-t border-gray-200'>
            <Table.Pagination
              page={1}
              numberOfPages={data?.numberOfPages || 0}
              onPageChange={() => null}
              hideNavText
            />
          </div>
        </div>

        {/* Testing */}
        <div className='flex flex-col items-start justify-start'>
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
                handleStartTest={() => startTest(test.uuid)}
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

export default KeyAssumptions;

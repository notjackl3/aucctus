import { Card, Chart, Header, Icon, Table } from '@components';
import { useKeyAssumptionsTable } from '@hooks/tables/key-assumptions.hook';
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { IConceptReportContext } from './ConceptReport';

const KeyAssumptions: React.FC = () => {
  const { concept } = useOutletContext<IConceptReportContext>();

  const { table } = useKeyAssumptionsTable(concept.uuid);

  return (
    <div className='flex h-auto w-full flex-col gap-6'>
      {/* Upper most cards */}
      <div className='flex w-fit flex-row flex-wrap gap-6'>
        {/* Assumptions Testing Status & Overview Cards */}
        <div className='flex flex-col gap-6'>
          <Card.AssumptionsTestingStatus />
          <div className={'inline-flex items-center justify-between'}>
            <Card.AssumptionOverview
              header='Average Test Duration'
              body={undefined}
              footer={''}
            />
            <Card.AssumptionOverview
              header='Test Days Remaining'
              body={undefined}
              footer={''}
            />
            <Card.AssumptionOverview
              header='Riskiest Category'
              body={undefined}
              footer={''}
            />
          </div>
        </div>

        {/* Assumptions Testing Priority */}
        <div className='inline-flex min-h-[440px] min-w-[470px] flex-col items-start justify-start gap-3 rounded-lg border border-gray-200 bg-white p-6'>
          <Header.Two text='Assumption Testing Priority' />
          <Chart.QuadrantChart
            yTopLabel='High Difficulty'
            yBottomLabel='Low Difficulty'
            xRightLabel='High Impact'
            xLeftLabel='Low Impact'
            chartCoordinates={[]}
            selectedCoordinate={''}
          />
        </div>
      </div>

      {/* Assumptions & Testing Table */}
      <div className='flex min-w-fit rounded-lg border border-gray-200 bg-white'>
        {/* Assumptions */}
        <div className='flex w-full min-w-[400px] max-w-[600px] flex-1 flex-col items-start justify-start overflow-y-auto border-r border-gray-200'>
          {/* Header */}
          <Header.AssumptionsTable
            text='Assumptions'
            count={0}
            handleAdd={() => null}
          />
          <div className='inline-flex w-full items-center justify-between self-stretch border-b border-gray-200 px-3 py-2'>
            <div>Coming</div>
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
            <Table table={table} />
          </div>
          {/* Footer */}
          <div className='w-full border-t border-gray-200'>
            <Table.Pagination
              page={1}
              numberOfPages={3}
              onPageChange={() => null}
              hideNavText
            />
          </div>
        </div>

        {/* Testing */}
        <div className='flex min-w-fit max-w-[600px] flex-1 flex-col items-start justify-start'>
          {/* Fixed Header */}
          <Header.AssumptionsTable
            text='Tests'
            count={0}
            handleAdd={() => null}
          />

          {/* Scrollable Content */}
          <div className='flex min-h-[675px] flex-row items-start justify-center overflow-y-auto px-7 py-8'>
            {/* This will be a list of cards... */}
            <Card.Testing
              test='scanningSurveys'
              identifier='RB07'
              duration='8 days'
              description='Create a landing page to drive Formula 1 fans to that would measure conversion of interest.'
              status='partiallyValidated'
              state=''
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeyAssumptions;

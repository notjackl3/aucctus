import { Button, Container, Header, Loading, Table } from '@components';
import { useModal } from '@context/ModalContextProvider';
import { useConceptTestDetails } from '@hooks/query/assumptions.hook';
import { useAssumptionsToTestTable } from '@hooks/tables/assumptions-to-test.hook';
import { useFindingsAndResultsTable } from '@hooks/tables/findings-and-results.hook';
import { useTestStepTable } from '@hooks/tables/test-step-table.hook';
import utils from '@libs/utils';
import React from 'react';
import Footer from './Footer';
import TestModalHeader from './Header';
import { X } from 'lucide-react';
import RotatingIcon from '@components/Icon/RotatingIcon';

interface TestModalProps {
  conceptUuid: string;
  testUuid: string;
  identifier: string;
}

const TestModal: React.FC<TestModalProps> = ({
  conceptUuid,
  testUuid,
  identifier,
}) => {
  const { closeModal } = useModal();
  const [isAssumptionsOpen, setIsAssumptionsOpen] = React.useState(true);
  const [isTestingPlanOpen, setIsTestingPlanOpen] = React.useState(false);
  const [isFindingsAndResultsOpen, setIsFindingsAndResultsOpen] =
    React.useState(false);
  const { testDetails, isLoading } = useConceptTestDetails(
    conceptUuid,
    testUuid,
  );

  const assumptionsToTest = testDetails?.assumptions || [];
  const testSteps = testDetails?.steps || [];
  const findings = testDetails?.findings || [];

  // Expandable Table hooks
  const { table: assumptionsToTestTable } =
    useAssumptionsToTestTable(assumptionsToTest);
  const { table: findingsAndResultsTable } =
    useFindingsAndResultsTable(findings);
  const { table: testStepsTable } = useTestStepTable(testUuid, testSteps);

  const formattedStartDate = testDetails
    ? utils.time.dateFormatter(testDetails.startDate, { dateOnly: true })
    : '--';
  const formattedEndDate = testDetails
    ? utils.time.dateFormatter(testDetails.endDate, { dateOnly: true })
    : '--';

  return (
    <div className='flex max-w-[1100px] flex-col gap-4'>
      <div className='flex flex-row justify-between px-8 pt-8'>
        <div className='aucctus-text-tertiary text-xs font-medium'>
          ID: {identifier}
        </div>
        <Button color='light' noBorder size='sm' onClick={closeModal}>
          <X />
        </Button>
      </div>

      {isLoading || !testDetails ? (
        <div className='flex min-h-[200px] min-w-96 items-center justify-center'>
          <Loading />
        </div>
      ) : (
        <>
          {/* Header */}
          <TestModalHeader
            stage={testDetails.spec.stage}
            type={testDetails.type}
            status={testDetails.status}
            startDate={formattedStartDate}
            endDate={formattedEndDate}
            runTime={testDetails.runTime}
            testDescription={testDetails.description}
            findingsSummary={testDetails.findingsSummary}
            costEstimate={
              testDetails.spec.highLevelCharacteristics.costEstimate
            }
          />

          {/* Assumptions to Test */}
          <section className='flex flex-col'>
            <SectionButton
              text='Assumptions to Test'
              isOpen={isAssumptionsOpen}
              setIsOpen={setIsAssumptionsOpen}
            />
            {/* Assumptions Table */}
            <Container.Collapsible open={isAssumptionsOpen}>
              <Table
                table={assumptionsToTestTable}
                headerProps={{
                  className: 'text-sm aucctus-text-tertiary',
                }}
              />
            </Container.Collapsible>
          </section>

          {/* Testing Plan */}
          <section className='flex flex-col'>
            <SectionButton
              text='Testing Plan'
              isOpen={isTestingPlanOpen}
              setIsOpen={setIsTestingPlanOpen}
            />
            <Container.Collapsible open={isTestingPlanOpen}>
              <Table
                table={testStepsTable}
                headerProps={{
                  className: 'text-sm aucctus-text-tertiary',
                }}
              />
            </Container.Collapsible>
          </section>

          {/* Findings and Results */}
          <section className='flex flex-col'>
            <SectionButton
              text='Findings and Results'
              isOpen={isFindingsAndResultsOpen}
              setIsOpen={setIsFindingsAndResultsOpen}
            />
            <Container.Collapsible open={isFindingsAndResultsOpen}>
              <Table
                table={findingsAndResultsTable}
                emptyTableText='Coming Soon'
                headerProps={{
                  className: 'text-sm aucctus-text-tertiary',
                }}
              />
            </Container.Collapsible>
          </section>

          <Footer status={testDetails.status} />
        </>
      )}
    </div>
  );
};

const SectionButton: React.FC<{
  text: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}> = ({ text, isOpen, setIsOpen }) => {
  return (
    <button
      className='aucctus-border-secondarysecondary flex flex-row items-center gap-2 border-b px-8 pb-4'
      onClick={() => setIsOpen(!isOpen)}
    >
      <Header.Two text={text} className='text-xl' />
      <RotatingIcon isUp={isOpen} height={24} width={24} />
    </button>
  );
};

export default TestModal;

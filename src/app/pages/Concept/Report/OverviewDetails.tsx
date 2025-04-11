import { Card, Header, Text, Loading } from '@components';
import { useEditOverview } from '@hooks/concepts/editable.hook';
import { useAssumptions } from '@hooks/query/assumptions.hook';
import { useConceptOverview } from '@hooks/query/concepts.hook';
import { AppPath } from '@routes/routes';
import { FunctionComponent, useMemo } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { IConceptReportContext } from './ConceptReport';

const OverviewDetails: FunctionComponent = () => {
  const { id: conceptId = '' } = useParams();
  const { navigateToTab } = useOutletContext<IConceptReportContext>();
  const { overview, isLoading: isOverviewLoading } =
    useConceptOverview(conceptId);
  const { assumptions, isLoading: isAssumptionsLoading } =
    useAssumptions(conceptId);
  const { valueProposition, problemStatement, text } = useEditOverview();

  const isLoading = isOverviewLoading || isAssumptionsLoading;

  const firstCustomerPersona = useMemo(() => {
    if (!overview || !overview.persona) {
      return undefined;
    }
    return overview.persona;
  }, [overview]);

  if (isLoading) {
    return (
      <div className='flex h-full w-full flex-col gap-6'>
        <div className='flex h-full min-h-96 w-full items-center justify-center align-middle'>
          <Loading />
        </div>
      </div>
    );
  }

  // Handle case where loading is finished but no overview data exists
  if (!isLoading && !overview) {
    return (
      <div className='aucctus-text-secondary flex h-full w-full flex-col items-center justify-center gap-6 p-8'>
        Overview data is not available for this concept.
      </div>
    );
  }

  return (
    <div className='flex flex-col items-start'>
      <section className='inline-flex items-start justify-start gap-12'>
        {/* Left Section */}
        <div className='inline-flex shrink grow basis-0 flex-col items-start justify-start gap-8 self-stretch'>
          <div className='inline-flex flex-col items-start justify-start gap-5'>
            <Header.Three text='Value Proposition' />
            <Text.EditModeSwitcher
              pClassName='aucctus-text-tertiary aucctus-text-xl-medium'
              value={valueProposition.value}
              label=''
              name='valueProposition'
              maxLength={valueProposition.validation.maxLength}
              onChange={valueProposition.handleChange}
              handleSave={valueProposition.handleSave}
              handleCancel={valueProposition.handleCancel}
            />
          </div>

          {overview?.problemStatement ? (
            <div className='inline-flex flex-col items-start justify-start gap-5'>
              <Header.Three text='Problem Statement' />
              <Text.EditModeSwitcher
                pClassName='aucctus-text-tertiary aucctus-text-xl-medium'
                value={problemStatement.value}
                label=''
                name='description'
                maxLength={problemStatement.validation.maxLength}
                onChange={problemStatement.handleChange}
                handleSave={problemStatement.handleSave}
                handleCancel={problemStatement.handleCancel}
              />
            </div>
          ) : null}
        </div>
        {/* Right Section */}
        <div className='inline-flex shrink grow basis-0 flex-col items-start justify-start gap-8 self-stretch'>
          {/* Overview  */}
          <div className='inline-flex flex-col items-start justify-start gap-5'>
            <Header.Three text='Overview' />
            <Text.EditModeSwitcher
              pClassName='self-stretch aucctus-text-tertiary aucctus-text-md'
              value={text.value}
              label=''
              name='description'
              maxLength={text.validation.maxLength}
              onChange={text.handleChange}
              handleSave={text.handleSave}
              handleCancel={text.handleCancel}
            />
          </div>
        </div>
      </section>

      <section
        className={`inline-flex flex-wrap items-center justify-start gap-6 pt-8`}
      >
        <Card.CustomerProfiles
          profile={firstCustomerPersona}
          onViewProfilesClick={() =>
            navigateToTab(AppPath.ConceptCustomerProfile)
          }
        />

        <Card.FinancialProjects
          projection={overview?.financialProjection}
          onViewClick={() => navigateToTab(AppPath.ConceptFinancialProjection)}
        />

        <Card.KeyAssumptions
          assumptions={assumptions || []}
          onViewClick={() => navigateToTab(AppPath.ConceptKeyAssumptions)}
        />
      </section>
    </div>
  );
};

export default OverviewDetails;

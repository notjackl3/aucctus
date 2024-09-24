import { Card, Container, Header, Text } from '@components';
import { useEditConcept, useEditOverview } from '@hooks/concepts/editable.hook';
import { useAssumptions } from '@hooks/query/assumptions.hook';
import { useConceptOverview } from '@hooks/query/concepts.hook';
import { AppPath } from '@routes/routes';
import { FunctionComponent, useMemo } from 'react';
import { useOutletContext, useParams } from 'react-router-dom';
import { IConceptReportContext } from '../ConceptReport';

const OverviewDetails: FunctionComponent = () => {
  const { id: conceptId = '' } = useParams();
  const { navigateToTab } = useOutletContext<IConceptReportContext>();
  const { overview } = useConceptOverview(conceptId);
  const { assumptions } = useAssumptions(conceptId);
  const { valueProposition, problemStatement } = useEditOverview();
  const descriptionEdit = useEditConcept();

  const firstCustomerPersona = useMemo(() => {
    if (!overview || !overview.persona) {
      return undefined;
    }
    return overview.persona;
  }, [overview]);

  return (
    <div className='flex flex-col items-start'>
      <section className='inline-flex items-start justify-start gap-12'>
        {/* Left Section */}
        <div className='inline-flex shrink grow basis-0 flex-col items-start justify-start gap-8 self-stretch'>
          <div className='inline-flex flex-col items-start justify-start gap-5'>
            <Header.Three text='Value Proposition' />
            <Text.EditModeSwitcher
              pClassName='text-gray-500 text-2xl font-medium'
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
                pClassName='text-gray-500 text-2xl font-medium'
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
              pClassName='self-stretch text-gray-500 text-base font-normal leading-normal'
              value={descriptionEdit.value}
              label=''
              name='description'
              maxLength={descriptionEdit.validation.maxLength}
              onChange={descriptionEdit.handleChange}
              handleSave={descriptionEdit.handleSave}
              handleCancel={descriptionEdit.handleCancel}
            />
          </div>

          {/* Lists of Trends & Drives and Industries */}
          <div className='inline-flex items-start justify-between gap-3'>
            <Container.List
              title='Trends & Drivers'
              items={overview?.trendsAndDrivers || []}
            />
            <Container.List
              title='Industries'
              items={overview?.industries || []}
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
            navigateToTab(AppPath.ConceptFinancialProjection)
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

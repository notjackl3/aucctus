import { Card, Header, Loading, Text } from '@components';
import { useEditConcept } from '@hooks/concepts/editable.hook';
import { useFilteredAssumptions } from '@hooks/query/assumptions.hook';
import { useConceptCustomerProfiles } from '@hooks/query/concepts.hook';
import { AppPath } from '@routes/routes';
import { FunctionComponent, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { IConceptReportContext } from './ConceptReport/ConceptReport';
import useStore from '@stores/store';

const OverviewDetails: FunctionComponent = () => {
  const activeConceptUuid = useStore(
    (state) => state.conceptReport.conceptUuid ?? '',
  );
  const { navigateToTab, concept } = useOutletContext<IConceptReportContext>();
  const { profiles, isLoading: isCustomerProfilesLoading } =
    useConceptCustomerProfiles(activeConceptUuid);

  const assumptionsFilters = useMemo(
    () => ({
      category: 'desirability' as const,
      page: 1,
      page_size: 20,
    }),
    [],
  );

  const { assumptions: assumptionsV2, isLoading: isAssumptionsLoading } =
    useFilteredAssumptions(concept?.identifier || '', assumptionsFilters);
  const { valueProposition, problemStatement, overview } = useEditConcept();

  // Convert V2 assumptions to V1 format for compatibility with existing Card component
  const assumptions = useMemo(() => {
    return (
      assumptionsV2?.map((assumption) => ({
        ...assumption,
        name: assumption.statement,
        text: assumption.statement,
        importanceRationale: '',
        certaintyRationale: '',
        status: 'notStarted' as const,
        testProgress: [],
        version: 1,
      })) || []
    );
  }, [assumptionsV2]);

  const isLoading = isAssumptionsLoading || isCustomerProfilesLoading;

  const firstCustomerPersona = useMemo(() => {
    if (!profiles || profiles.length === 0) {
      return undefined;
    }
    return profiles[0];
  }, [profiles]);

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
  if (!isLoading && !concept) {
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

          {concept?.problemStatement ? (
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
              value={overview.value}
              label=''
              name='overview'
              maxLength={overview.validation.maxLength}
              onChange={overview.handleChange}
              handleSave={overview.handleSave}
              handleCancel={overview.handleCancel}
            />
          </div>
        </div>
      </section>

      <section className='flex w-full gap-6 pt-8'>
        <div className='w-full flex-1 [&>div]:!w-full'>
          <Card.CustomerProfiles
            profile={firstCustomerPersona}
            onViewProfilesClick={() =>
              navigateToTab(AppPath.ConceptCustomerProfile)
            }
          />
        </div>

        <div className='w-full flex-1 [&>div]:!w-full'>
          <Card.KeyAssumptions
            assumptions={assumptions || []}
            onViewClick={() => navigateToTab(AppPath.ConceptKeyAssumptions)}
          />
        </div>
      </section>
    </div>
  );
};

export default OverviewDetails;

import { Card, Header, Text, UnifiedLoadingState } from '@components';
import { useEditConcept } from '@hooks/concepts/editable.hook';
import { useUnifiedLoading } from '@hooks/concepts/unified-loading.hook';
import { useDebugMode } from '@hooks/debug-mode.hook';
import { useConceptCustomerProfiles } from '@hooks/query/concepts.hook';
import { AppPath } from '@routes/routes';
import useStore from '@stores/store';
import { FunctionComponent, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { IConceptReportContext } from './ConceptReport/ConceptReport';

const OverviewDetails: FunctionComponent = () => {
  const activeConceptUuid = useStore(
    (state) => state.conceptReport.conceptUuid ?? '',
  );
  const { navigateToTab, concept } = useOutletContext<IConceptReportContext>();
  const isDebugModeEnabled = useDebugMode();

  const { profiles, isLoading: isCustomerProfilesLoading } =
    useConceptCustomerProfiles(activeConceptUuid);

  const { valueProposition, problemStatement, overview } = useEditConcept();

  // Use unified loading state
  const { isLoading } = useUnifiedLoading({
    currentRoute: AppPath.ConceptOverview,
    concept,
    additionalLoadingStates: [isCustomerProfilesLoading],
  });

  const firstCustomerPersona = useMemo(() => {
    if (!profiles || profiles.length === 0) {
      return undefined;
    }
    return profiles[0];
  }, [profiles]);

  // Show unified loading state
  if (isLoading) {
    return <UnifiedLoadingState />;
  }

  // Handle case where concept is not available but we're not loading
  if (!concept) {
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
          <Card.AssumptionsCardWrapper
            onViewClick={() => navigateToTab(AppPath.ConceptKeyAssumptions)}
          />
        </div>
      </section>
      <section className='flex w-full gap-6 pt-8'>
        {concept?.conceptImageUrl && isDebugModeEnabled && (
          <img
            src={concept.conceptImageUrl}
            alt='Concept Image'
            className='h-64 w-64 object-cover'
          />
        )}
      </section>
    </div>
  );
};

export default OverviewDetails;

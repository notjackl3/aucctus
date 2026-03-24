import { ConceptReportSkeletons } from '@components';
import { useConceptCustomerProfileConversationList } from '@hooks/query/concepts.hook';
import { ICustomerProfile } from '@libs/api/types';
import { CustomerProfileConversationEvent } from '@libs/events/CustomerProfileConversationEvent';
import { cn } from '@libs/utils/react';
import { ICustomerProfileConversation } from '@stores/customer_profile_conversations/store';
import useStore from '@stores/store';
import {
  FunctionComponent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import CustomerAlternatives from './CustomerAlternatives';
import CustomerConversation from './CustomerConversation';
import CustomerJobs from './CustomerJobs';
import CustomerKeyFacts from './CustomerKeyFacts';
import CustomerMotivationsAndBehaviours from './CustomerMotivationsAndBehaviours';
import CustomerOverview from './CustomerOverview';
import CustomerPains from './CustomerPains';
import CustomerSocialValues from './CustomerSocialValues';
import PersonaQuotesCarousel from './PersonaQuotesCarousel';
import UserJourneyFlow from './UserJourneyFlow';
import WorkdayJourney from './WorkdayJourney';
import RealWorldSignalList from './signals/RealWorldSignalList';

const {
  ProfileOverviewSkeleton,
  ProfileConversationSkeleton,
  JobsToBeDoneSkeleton,
  SkeletonBlock,
} = ConceptReportSkeletons;

export interface ICustomerDetailsProps {
  profile: ICustomerProfile;
  className?: string;
  showSkeletons?: boolean;
  featureVersion?: string;
  isReadOnly?: boolean;
}

const CustomerDetails: FunctionComponent<ICustomerDetailsProps> = ({
  profile,
  className = '',
  showSkeletons = false,
  featureVersion = 'v2',
  isReadOnly = false,
}) => {
  const isV1 = featureVersion === 'v1';
  const overviewRef = useRef<HTMLDivElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);
  const [conversations, setConversations] = useState<
    ICustomerProfileConversation[]
  >([]);
  const [overviewExpanded, setOverviewExpanded] = useState(false);
  const { setCustomerProfileUuid } = useStore(
    (state) => state.customerProfileConversations,
  );
  const { data: conversationResults, refetch } =
    useConceptCustomerProfileConversationList(isReadOnly ? '' : profile.uuid);

  // Reset overview expanded state on profile change
  useEffect(() => {
    setOverviewExpanded(false);
  }, [profile.uuid]);

  useEffect(() => {
    if (conversationResults) {
      setConversations(
        conversationResults.results.map((conversation) => ({
          uuid: conversation.uuid,
          createdAt: conversation.createdAt,
        })),
      );
    }
  }, [conversationResults]);

  // Refetch conversation list when profile.uuid changes
  useEffect(() => {
    if (isReadOnly) return;
    refetch();
  }, [profile.uuid, refetch, isReadOnly]);

  // Set customer profile UUID and handle new conversations
  useEffect(() => {
    if (isReadOnly) return;
    setCustomerProfileUuid(profile.uuid);

    // Add event listener for the customer-profile-new-conversation event
    const handleHandshake = (event: CustomerProfileConversationEvent) => {
      const { sessionId } = event.detail;
      // Add new conversation to the beginning so it becomes the active conversation
      setConversations([
        {
          uuid: sessionId,
          createdAt: new Date().toISOString(),
        },
        ...(conversations || []),
      ]);
    };

    // Add the event listener with proper typing
    window.addEventListener(
      CustomerProfileConversationEvent.eventName,
      handleHandshake,
    );

    return () => {
      setCustomerProfileUuid('');
      window.removeEventListener(
        CustomerProfileConversationEvent.eventName,
        handleHandshake,
      );
    };
  }, [
    profile,
    profile.uuid,
    setCustomerProfileUuid,
    conversations,
    isReadOnly,
  ]);

  const renderSupportSkeletonCard = useCallback(
    () => (
      <div className='aucctus-bg-primary aucctus-border-secondary flex flex-1 flex-col gap-3 rounded-lg border p-4 shadow-sm'>
        <SkeletonBlock className='h-5 w-40' />
        <SkeletonBlock className='h-3 w-28' />
        <SkeletonBlock className='h-4 w-full' />
        <SkeletonBlock className='h-4 w-3/4' />
        <SkeletonBlock className='h-4 w-2/3' />
      </div>
    ),
    [],
  );

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col items-start gap-6 self-stretch',
        className,
      )}
    >
      {/* Unified card: Overview + Conversation */}
      {showSkeletons ? (
        <div className='flex w-full flex-row gap-4'>
          <ProfileOverviewSkeleton />
          <ProfileConversationSkeleton />
        </div>
      ) : (
        <div
          data-section-id='customer_profiles'
          className='aucctus-border-primary aucctus-bg-primary w-full overflow-hidden rounded-xl border shadow-sm'
        >
          <div
            className={cn('grid grid-cols-1', !isReadOnly && 'xl:grid-cols-2')}
          >
            {/* Left - persona overview */}
            <div
              className={cn(
                'aucctus-border-secondary',
                !isReadOnly && 'xl:border-r',
              )}
            >
              <CustomerOverview
                ref={overviewRef}
                profile={profile}
                overviewExpanded={overviewExpanded}
                setOverviewExpanded={setOverviewExpanded}
              />
            </div>
            {/* Right - chat (hidden in read-only mode) */}
            {!isReadOnly && (
              <div className='aucctus-border-secondary h-[480px] border-t xl:border-t-0'>
                <CustomerConversation
                  ref={conversationRef}
                  profile={profile}
                  conversations={conversations}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quotes Carousel - full width, conditional */}
      {!showSkeletons && profile.quotes && profile.quotes.length > 0 && (
        <PersonaQuotesCarousel
          quotes={profile.quotes}
          profileId={profile.uuid}
        />
      )}

      {/* Widget section - responsive grid */}
      <div className='grid w-full grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
        {showSkeletons ? (
          <JobsToBeDoneSkeleton />
        ) : (
          <div data-section-id='customer_jobs' className='h-full'>
            <CustomerJobs
              customerProfileUuid={profile.uuid}
              jobs={profile.jobs}
            />
          </div>
        )}
        {showSkeletons ? (
          renderSupportSkeletonCard()
        ) : (
          <div data-section-id='customer_pains' className='h-full'>
            <CustomerPains
              customerProfileUuid={profile.uuid}
              pains={profile.pains}
            />
          </div>
        )}
        {!showSkeletons &&
          profile.socialValues &&
          profile.socialValues.length > 0 && (
            <CustomerSocialValues
              customerProfileUuid={profile.uuid}
              socialValues={profile.socialValues}
            />
          )}
        {!showSkeletons &&
          ((profile.motivations && profile.motivations.length > 0) ||
            (profile.behaviours && profile.behaviours.length > 0)) && (
            <CustomerMotivationsAndBehaviours
              customerProfileUuid={profile.uuid}
              motivations={profile.motivations}
              behaviours={profile.behaviours}
            />
          )}
        {!showSkeletons && profile.keyFacts && profile.keyFacts.length > 0 && (
          <CustomerKeyFacts
            customerProfileUuid={profile.uuid}
            keyFacts={profile.keyFacts}
          />
        )}
        {showSkeletons ? (
          renderSupportSkeletonCard()
        ) : (
          <div data-section-id='customer_alternatives' className='h-full'>
            <CustomerAlternatives customerProfileUuid={profile.uuid} />
          </div>
        )}
      </div>

      {/* Journey */}
      <div
        data-section-id='customer_journey_steps'
        className='flex w-full flex-row gap-4'
      >
        {showSkeletons ? (
          renderSupportSkeletonCard()
        ) : isV1 ? (
          <UserJourneyFlow
            customerProfileUuid={profile.uuid}
            journey={profile.journey}
          />
        ) : (
          <WorkdayJourney
            customerProfileUuid={profile.uuid}
            journey={profile.journey}
          />
        )}
      </div>

      {/* Real World Signals - v1 only, hidden in read-only (shared) reports */}
      {isV1 &&
        !showSkeletons &&
        !isReadOnly &&
        FEATURE_CUSTOMER_PROFILE_REAL_WORLD_SIGNALS && (
          <div
            data-section-id='customer_real_world_signals'
            className='flex w-full flex-row gap-4'
          >
            <RealWorldSignalList profileUuid={profile.uuid} />
          </div>
        )}
    </div>
  );
};

export default CustomerDetails;

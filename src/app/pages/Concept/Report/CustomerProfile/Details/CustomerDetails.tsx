import { ConceptReportSkeletons } from '@components';
import { useEditCustomerProfile } from '@hooks/concepts/editable.hook';
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
import CustomerConversation from './CustomerConversation';
import CustomerJobs from './CustomerJobs';
import CustomerOverview from './CustomerOverview';
import CustomerPains from './CustomerPains';
import RealWorldSignalList from './signals/RealWorldSignalList';
import CustomerAlternatives from './CustomerAlternatives';
import UserJourneyFlow from './UserJourneyFlow';

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
}

const CustomerDetails: FunctionComponent<ICustomerDetailsProps> = ({
  profile,
  className = '',
  showSkeletons = false,
}) => {
  const { description, isLoading } = useEditCustomerProfile(profile.uuid);
  const overviewRef = useRef<HTMLDivElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);
  const jobsRef = useRef<HTMLDivElement>(null);
  const painsRef = useRef<HTMLDivElement>(null);
  const alternativesRef = useRef<HTMLDivElement>(null);
  const [conversations, setConversations] = useState<
    ICustomerProfileConversation[]
  >([]);
  const { setCustomerProfileUuid } = useStore(
    (state) => state.customerProfileConversations,
  );
  const { data: conversationResults, refetch } =
    useConceptCustomerProfileConversationList(profile.uuid);

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
    refetch();
  }, [profile.uuid, refetch]);

  // Set customer profile UUID and handle new conversations
  useEffect(() => {
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
  }, [profile, profile.uuid, setCustomerProfileUuid, conversations]);

  // Synchronize conversation height with overview height
  useEffect(() => {
    const overviewElement = overviewRef.current;
    const conversationElement = conversationRef.current;

    if (overviewElement && conversationElement && !isLoading) {
      const updateHeight = () => {
        if (overviewElement) {
          conversationElement.style.maxHeight = `${overviewElement.offsetHeight}px`;
        }
      };

      // Create a ResizeObserver to detect changes in the overview component
      const resizeObserver = new ResizeObserver(updateHeight);
      resizeObserver.observe(overviewElement);

      // Also keep the window resize listener for other layout changes
      window.addEventListener('resize', updateHeight);

      return () => {
        if (overviewElement) {
          resizeObserver.unobserve(overviewElement);
        }
        resizeObserver.disconnect();
        window.removeEventListener('resize', updateHeight);
      };
    }
  }, [isLoading]);

  // Synchronize the heights of Jobs, Pains, and Alternatives cards
  // Uses a flag to prevent infinite resize loops
  const syncCardsHeight = useCallback(() => {
    const jobsElement = jobsRef.current;
    const painsElement = painsRef.current;
    const alternativesElement = alternativesRef.current;

    if (!jobsElement || !painsElement || !alternativesElement) return;

    // First, reset all heights to auto to get natural heights
    jobsElement.style.minHeight = 'auto';
    painsElement.style.minHeight = 'auto';
    alternativesElement.style.minHeight = 'auto';

    // Force a reflow to get accurate measurements
    void jobsElement.offsetHeight;

    // Get the natural heights of all three cards
    const jobsHeight = jobsElement.offsetHeight;
    const painsHeight = painsElement.offsetHeight;
    const alternativesHeight = alternativesElement.offsetHeight;

    // Find the maximum height
    const maxHeight = Math.max(jobsHeight, painsHeight, alternativesHeight);

    // Apply the max height to all cards
    jobsElement.style.minHeight = `${maxHeight}px`;
    painsElement.style.minHeight = `${maxHeight}px`;
    alternativesElement.style.minHeight = `${maxHeight}px`;
  }, []);

  useEffect(() => {
    const jobsElement = jobsRef.current;
    const painsElement = painsRef.current;
    const alternativesElement = alternativesRef.current;

    if (!jobsElement || !painsElement || !alternativesElement || isLoading) {
      return;
    }

    // Initial sync
    // Use setTimeout to let the content render first
    const timeoutId = setTimeout(syncCardsHeight, 100);

    // Create a single ResizeObserver for all three cards
    let isUpdating = false;
    const resizeObserver = new ResizeObserver(() => {
      // Prevent recursive updates
      if (isUpdating) return;
      isUpdating = true;

      // Use requestAnimationFrame to batch updates
      requestAnimationFrame(() => {
        syncCardsHeight();
        // Reset the flag after a short delay to allow for settling
        setTimeout(() => {
          isUpdating = false;
        }, 50);
      });
    });

    resizeObserver.observe(jobsElement);
    resizeObserver.observe(painsElement);
    resizeObserver.observe(alternativesElement);

    // Also listen for window resize
    window.addEventListener('resize', syncCardsHeight);

    return () => {
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', syncCardsHeight);
    };
  }, [isLoading, syncCardsHeight]);

  const shouldShowSkeleton = showSkeletons || isLoading;

  const renderSupportSkeletonCard = () => (
    <div className='aucctus-bg-primary aucctus-border-secondary flex flex-1 flex-col gap-3 rounded-lg border p-4 shadow-sm'>
      <SkeletonBlock className='h-5 w-40' />
      <SkeletonBlock className='h-3 w-28' />
      <SkeletonBlock className='h-4 w-full' />
      <SkeletonBlock className='h-4 w-3/4' />
      <SkeletonBlock className='h-4 w-2/3' />
    </div>
  );

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col items-start gap-6 self-stretch',
        className,
      )}
    >
      {shouldShowSkeleton ? (
        <div className='flex w-full flex-row gap-4'>
          <ProfileOverviewSkeleton />
          <ProfileConversationSkeleton />
        </div>
      ) : (
        <div className='flex w-full flex-row gap-4'>
          <CustomerOverview
            ref={overviewRef}
            profile={profile}
            description={description}
          />
          <CustomerConversation
            ref={conversationRef}
            profile={profile}
            conversations={conversations}
          />
        </div>
      )}

      <div className='flex w-full flex-row gap-4'>
        {shouldShowSkeleton ? (
          <JobsToBeDoneSkeleton />
        ) : (
          <div
            ref={jobsRef}
            className='flex min-w-0 flex-1 [&>*]:h-full [&>*]:w-full'
          >
            <CustomerJobs
              customerProfileUuid={profile.uuid}
              jobs={profile.jobs}
            />
          </div>
        )}
        {shouldShowSkeleton ? (
          renderSupportSkeletonCard()
        ) : (
          <div
            ref={painsRef}
            className='flex min-w-0 flex-1 [&>*]:h-full [&>*]:w-full'
          >
            <CustomerPains
              customerProfileUuid={profile.uuid}
              pains={profile.pains}
            />
          </div>
        )}
        {shouldShowSkeleton ? (
          renderSupportSkeletonCard()
        ) : (
          <div
            ref={alternativesRef}
            className='flex min-w-0 flex-1 [&>*]:h-full [&>*]:w-full'
          >
            <CustomerAlternatives customerProfileUuid={profile.uuid} />
          </div>
        )}
      </div>

      <div className='flex w-full flex-row gap-4'>
        {shouldShowSkeleton ? (
          renderSupportSkeletonCard()
        ) : (
          <UserJourneyFlow
            customerProfileUuid={profile.uuid}
            journey={profile.journey}
            productName='High Fibre Cheese Bites'
          />
        )}
      </div>
      {FEATURE_CUSTOMER_PROFILE_REAL_WORLD_SIGNALS && (
        <div className='flex w-full flex-row gap-4'>
          {shouldShowSkeleton ? (
            renderSupportSkeletonCard()
          ) : (
            <RealWorldSignalList profileUuid={profile.uuid} />
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;

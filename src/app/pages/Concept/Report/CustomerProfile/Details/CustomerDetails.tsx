import { Loading } from '@components';
import { useEditCustomerProfile } from '@hooks/concepts/editable.hook';
import { useConceptCustomerProfileConversationList } from '@hooks/query/concepts.hook';
import { ICustomerProfile } from '@libs/api/types';
import { CustomerProfileConversationEvent } from '@libs/events/CustomerProfileConversationEvent';
import { cn } from '@libs/utils/react';
import { ICustomerProfileConversation } from '@stores/customer_profile_conversations/store';
import useStore from '@stores/store';
import { FunctionComponent, useEffect, useRef, useState } from 'react';
import CustomerConversation from './CustomerConversation';
import CustomerJobs from './CustomerJobs';
import CustomerOverview from './CustomerOverview';
import CustomerPains from './CustomerPains';
import RealWorldSignalList from './signals/RealWorldSignalList';
import CustomerAlternatives from './CustomerAlternatives';
import UserJourneyFlow from './UserJourneyFlow';

export interface ICustomerDetailsProps {
  profile: ICustomerProfile;
  className?: string;
}

const CustomerDetails: FunctionComponent<ICustomerDetailsProps> = ({
  profile,
  className = '',
}) => {
  const { description, isLoading } = useEditCustomerProfile(profile.uuid);
  const overviewRef = useRef<HTMLDivElement>(null);
  const conversationRef = useRef<HTMLDivElement>(null);
  const [conversations, setConversations] = useState<
    ICustomerProfileConversation[]
  >([]);
  const { setCustomerProfileUuid } = useStore(
    (state) => state.customerProfileConversations,
  );
  const { data: conversationResults } =
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

  // Set customer profile UUID and handle new conversations
  useEffect(() => {
    setCustomerProfileUuid(profile.uuid);

    // Add event listener for the customer-profile-new-conversation event
    const handleHandshake = (event: CustomerProfileConversationEvent) => {
      const { sessionId } = event.detail;
      setConversations([
        ...(conversations || []),
        {
          uuid: sessionId,
          createdAt: new Date().toISOString(),
        },
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

  return (
    <div
      className={cn(
        'flex h-full w-full flex-col items-start gap-6 self-stretch',
        className,
      )}
    >
      {isLoading ? (
        <div className='flex flex-1 items-center justify-center'>
          <Loading />
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
        <CustomerJobs
          customerProfileUuid={profile.uuid}
          jobs={profile.jobs}
          insight={profile.jobsToBeDoneInsight}
        />
        <CustomerPains
          customerProfileUuid={profile.uuid}
          pains={profile.pains}
          insight={profile.painsInsight}
        />
        <CustomerAlternatives
          customerProfileUuid={profile.uuid}
          insight={profile.alternativesInsight}
        />
      </div>

      <div className='flex w-full flex-row gap-4'>
        <UserJourneyFlow
          customerProfileUuid={profile.uuid}
          journey={profile.journey}
          productName='High Fibre Cheese Bites'
          insight={profile.journeyInsight}
        />
      </div>
      {FEATURE_CUSTOMER_PROFILE_REAL_WORLD_SIGNALS && (
        <div className='flex w-full flex-row gap-4'>
          <RealWorldSignalList profileUuid={profile.uuid} />
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;

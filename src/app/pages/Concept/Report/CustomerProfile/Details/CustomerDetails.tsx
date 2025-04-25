import { Card, Loading } from '@components';
import { useEditCustomerProfile } from '@hooks/concepts/editable.hook';
import { ICustomerProfile } from '@libs/api/types';
import useStore from '@stores/store';
import { FunctionComponent, useEffect, useRef } from 'react';
import { cn } from '@libs/utils/react';
import CustomerOverview from './CustomerOverview';
import CustomerConversation from './CustomerConversation';

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

  const setCustomerProfileUuid = useStore(
    (state) => state.customerProfileConversations.setCustomerProfileUuid,
  );

  useEffect(() => {
    setCustomerProfileUuid(profile.uuid);

    return () => {
      setCustomerProfileUuid('');
    };
  }, [profile.uuid, setCustomerProfileUuid]);

  // Measure the height of CustomerOverview after render
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
        <div className='flex flex-row gap-4'>
          <CustomerOverview
            ref={overviewRef}
            profile={profile}
            description={description}
          />
          <CustomerConversation
            ref={conversationRef}
            profile={profile}
          />
        </div>
      )}

      <div className='flex flex-wrap gap-4'>
        <Card.CustomerProfileContextList
          profileUuid={profile.uuid}
          title={'Jobs to be Done'}
          icon={'clipboard'}
          field={'jobs'}
          data={profile.jobs.map((job) => job.description)}
        />
        <Card.CustomerProfileContextList
          profileUuid={profile.uuid}
          title={'Pains'}
          icon={'user-group'}
          field={'pains'}
          data={profile.pains.map((pain) => pain.description)}
        />
        <Card.CustomerProfileContextList
          profileUuid={profile.uuid}
          title={'Quotes'}
          icon={'message-circle'}
          field={'quotes'}
          data={profile.quotes}
        />
      </div>
    </div>
  );
};

export default CustomerDetails;

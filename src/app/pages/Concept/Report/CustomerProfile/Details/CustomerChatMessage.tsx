import defaultAvatar from '@assets/img/avatar.png';
import Avatar from '@components/Avatar';
import { ICustomerProfile } from '@libs/api/types';
import { cn } from '@libs/utils/react';
import { CustomerProfileMessage } from '@stores/customer_profile_conversations/store';
import useStore from '@stores/store';
import React from 'react';

interface CustomerProfileChatMessage {
  agentId: string;
  uuid: string;
  role: 'user' | 'assistant';
  content: string;
}

interface CustomerProfileChatMessageProps {
  profile: ICustomerProfile;
  message: CustomerProfileMessage;
}

/**
 * MessageRenderer - Renders different message types in the AI editing conversation
 * based on the role (user or assistant).
 */
const CustomerProfileChatMessage: React.FC<CustomerProfileChatMessageProps> = ({
  profile,
  message,
}) => {
  const { user } = useStore((state) => state.auth);

  if (message.role === 'user') {
    return (
      <div className='mb-2 flex flex-1 animate-expand flex-row'>
        <div className='flex flex-1' />
        <div className='aucctus-text-primary aucctus-bg-quaternary mr-4 h-fit max-w-[70%] rounded-lg p-4'>
          {message.content}
        </div>
        <Avatar
          firstName={user?.firstName || ''}
          lastName={user?.lastName || ''}
          src={user?.profileImage}
          hideImage={!!user?.profileImage}
          className={cn(
            'aucctus-border-primary h-6 w-6 rounded-full border transition-all duration-300',
          )}
        />
      </div>
    );
  }

  return (
    <div className='mb-2 flex flex-1 animate-expand flex-row'>
      <Avatar
        firstName={profile.name}
        lastName={profile.name}
        src={profile?.avatarUrl || defaultAvatar}
        className={cn(
          'aucctus-border-primary h-6 w-6 rounded-full border transition-all duration-300',
        )}
      />
      <div className='aucctus-text-primary aucctus-bg-secondary ml-4 h-fit max-w-[70%] rounded-lg p-4'>
        {message.content}
      </div>
      <div className='flex flex-1' />
    </div>
  );
};

export default CustomerProfileChatMessage;

import defaultAvatar from '@assets/img/avatar.png';
import React from 'react';
import { CustomerProfileMessage } from '@libs/api/types';
import { ICustomerProfile } from '@libs/api/types';
import useStore from '@stores/store';
import Avatar from '@components/Avatar';
import { cn } from '@libs/utils/react';

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
          className={cn('h-6 w-6 transition-all duration-300')}
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
      />
      <div className='aucctus-text-primary aucctus-bg-secondary ml-4 h-fit max-w-[70%] rounded-lg p-4'>
        {message.content}
      </div>
      <div className='flex flex-1' />
    </div>
  );
};

export default CustomerProfileChatMessage;

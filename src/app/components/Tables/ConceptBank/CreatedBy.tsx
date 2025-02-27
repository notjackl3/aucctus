import { Avatar, Tooltip } from '@components';
import { IUser } from '@libs/api/types';
import React from 'react';

interface ICreatedByProps {
  user: IUser;
}

const CreatedBy: React.FC<ICreatedByProps> = ({ user }) => {
  return (
    <span className='flex flex-row items-center justify-start gap-3 align-middle'>
      <Tooltip tip={`${user.firstName} ${user.lastName}`}>
        <span className='flex'>
          <Avatar
            firstName={user.firstName}
            lastName={user.lastName}
            src={user.profileImage}
            hideImage={!!user.profileImage}
          />
        </span>
      </Tooltip>
      {/* 
      // Temp Disable
      <span className='flex flex-col lg:hidden '>
        <span className='truncate text-base font-medium leading-tight aucctus-text-tertiary'>
          {user.firstName} {user.lastName}
        </span>
        <span className='truncate text-sm font-normal leading-tight aucctus-text-tertiary'>{user.email}</span>
      </span> */}
    </span>
  );
};

export default CreatedBy;

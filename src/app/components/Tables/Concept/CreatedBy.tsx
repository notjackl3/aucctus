import { Avatar } from '@components';
import { IUser } from '@libs/api/types';
import React from 'react';

interface ICreatedByProps {
  user: IUser;
}

const CreatedBy: React.FC<ICreatedByProps> = ({ user }) => {
  return (
    <span className='flex flex-row items-center justify-start gap-3 align-middle'>
      <Avatar
        firstName={user.firstName}
        lastName={user.lastName}
        src={user.profileImage}
        hideImage={!!user.profileImage}
      />
      <span className='flex flex-col'>
        <span className='truncate text-base font-medium leading-tight text-slate-500'>
          {user.firstName} {user.lastName}
        </span>
        <span className='truncate text-sm font-normal leading-tight text-slate-500'>{user.email}</span>
      </span>
    </span>
  );
};

export default CreatedBy;

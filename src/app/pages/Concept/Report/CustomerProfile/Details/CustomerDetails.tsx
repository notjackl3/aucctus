import defaultAvatar from '@assets/img/avatar.png';
import { Card } from '@components';
import EditModeSwitcher from '@components/Text/EditModeSwitcher/EditModeSwitcher';
import { useEditCustomerProfile } from '@hooks/concepts/editable.hook';
import { ICustomerProfile } from '@libs/api/types';
import { FunctionComponent } from 'react';

export interface ICustomerDetailsProps {
  profile: ICustomerProfile;
}

const CustomerDetails: FunctionComponent<ICustomerDetailsProps> = ({
  profile,
}) => {
  const { description } = useEditCustomerProfile(profile.uuid);

  return (
    <div className='flex h-full w-full flex-col items-start gap-6 self-stretch'>
      <div className='mt-8 flex min-h-12 w-full items-center justify-start gap-4'>
        <img
          className='flex h-[5.5rem] w-[5.5rem] items-center justify-center rounded-full border border-white'
          alt='avatar'
          src={defaultAvatar}
        />
        <div className='flex flex-col items-start'>
          <span className='aucctus-text-secondary mb-2 font-[inherit] text-lg font-normal'>
            {profile?.nickname}
          </span>
          <span className='aucctus-text-brand-secondary aucctus-header-sm-semibold'>
            {profile?.name}
          </span>
        </div>
      </div>

      <div className='mt-4 flex w-full flex-row flex-wrap items-start justify-start gap-8'>
        <div className='flex w-[40rem] flex-col'>
          <div className='flex w-full flex-col items-start gap-0'>
            <h2 className='aucctus-text-brand-secondary aucctus-text-lg-bold'>
              Overview
            </h2>
            <EditModeSwitcher
              containerClassName='aucctus-text-secondary aucctus-text-md !cursor-pencil'
              name='description'
              value={description.value}
              onChange={description.handleChange}
              handleSave={description.handleSave}
              handleCancel={description.handleCancel}
            />
          </div>
        </div>
        <div className='flex max-w-[30%] flex-col justify-start'>
          <div className='flex items-start gap-4 self-stretch'>
            <Card.Demographics profile={profile} canEdit={true} />
          </div>
        </div>
      </div>

      <div className='flex flex-wrap gap-4'>
        <Card.CustomerProfileContextList
          profileUuid={profile.uuid}
          title={'Jobs to be Done'}
          icon={'clipboard'}
          field={'jobs'}
          data={profile.jobs}
        />
        <Card.CustomerProfileContextList
          profileUuid={profile.uuid}
          title={'Pains'}
          icon={'user-group'}
          field={'pains'}
          data={profile.pains}
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

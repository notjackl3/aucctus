import { FunctionComponent } from 'react';

import { Icon } from '@components';
import EditCustomerProfileDemographics from '@components/Modal/CustomerProfile/EditCustomerProfileDemographics';
import { useModal } from '@context/ModalContextProvider';
import { ICustomerProfile } from '@libs/api/types';

const iconDefaultProps = {
  height: 20,
  width: 20,
  stroke: '#2B3674',
};

interface IDemographicsProps {
  profile: ICustomerProfile;
  canEdit?: boolean;
}

const Demographics: FunctionComponent<IDemographicsProps> = ({
  profile,
  canEdit = false,
}) => {
  const { openModal } = useModal();

  return (
    <div
      className={`flex flex-1 flex-col items-start gap-7 rounded-lg hover:bg-white ${
        canEdit ? 'cursor-pencil' : ''
      }`}
      onClick={() => {
        if (canEdit) {
          openModal(EditCustomerProfileDemographics, {
            profile,
          });
        }
      }}
    >
      <div className='flex flex-col items-start gap-1 self-stretch'>
        <div className='flex flex-col gap-2 self-stretch'>
          <span className='inline-flex items-start gap-4'>
            <Icon
              variant='globe'
              {...iconDefaultProps}
              className='h-6 w-6 stroke-primary-600'
            />
            <p className='aucctus-text-brand-tertiary aucctus-text-sm-bold flex-1'>
              Geographic Location:
            </p>
            <p className='aucctus-text-brand-tertiary aucctus-text-sm-medium flex-1'>
              {profile.geoLocation}
            </p>
          </span>
          <span className='inline-flex items-start gap-4'>
            <Icon
              variant='umbrella'
              {...iconDefaultProps}
              className='h-6 w-6 stroke-primary-600'
            />
            <p className='aucctus-text-brand-tertiary aucctus-text-sm-bold flex-1'>
              Age Range:
            </p>
            <p className='aucctus-text-brand-tertiary aucctus-text-sm-medium flex-1'>
              {profile.ageRange}
            </p>
          </span>
          <span className='inline-flex items-start gap-4'>
            <Icon
              variant='user-group'
              {...iconDefaultProps}
              className='h-6 w-6 stroke-primary-600'
            />
            <p className='aucctus-text-brand-tertiary aucctus-text-sm-bold flex-1'>
              Family Size:
            </p>
            <p className='aucctus-text-brand-tertiary aucctus-text-sm-medium flex-1'>
              {profile.familySize}
            </p>
          </span>
          <span className='inline-flex items-start gap-4'>
            <Icon
              variant='piggy-bank'
              {...iconDefaultProps}
              className='h-6 w-6 stroke-primary-600'
            />
            <p className='aucctus-text-brand-tertiary aucctus-text-sm-bold flex-1'>
              Average Income:
            </p>
            <p className='aucctus-text-brand-tertiary aucctus-text-sm-medium flex-1'>
              {profile.incomeRange}
            </p>
          </span>
        </div>
      </div>
    </div>
  );
};

export default Demographics;

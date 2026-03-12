import React from 'react';
import Banner from '@components/Banner/Banner';

interface ProfileStaleTestBannerProps {
  onRegenerate: () => void;
  isLoading?: boolean;
}

const ProfileStaleTestBanner: React.FC<ProfileStaleTestBannerProps> = ({
  onRegenerate,
  isLoading = false,
}) => {
  return (
    <Banner
      variant='warning'
      title='Customer profiles have changed'
      description='Some profiles linked to this test were updated or removed. Review the test participants and regenerate if needed before running synthetic execution.'
      iconVariant='alert-triangle'
      buttonText={isLoading ? 'Regenerating...' : 'Regenerate Test'}
      onAction={onRegenerate}
      isLoading={isLoading}
      className='mb-4'
    />
  );
};

export default ProfileStaleTestBanner;

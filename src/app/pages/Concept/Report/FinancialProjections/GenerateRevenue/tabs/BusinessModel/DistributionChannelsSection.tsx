import React from 'react';
import { IDistributionChannelV2 } from '@libs/api/types/concept/financialProjectionV2';
import { Workflow } from 'lucide-react';
interface DistributionChannelsSectionProps {
  distributionChannels?: IDistributionChannelV2[];
}

const DistributionChannelsSection: React.FC<
  DistributionChannelsSectionProps
> = ({ distributionChannels }) => {
  // Transform backend data if available
  let channels: IDistributionChannelV2[] = [];
  let primary: IDistributionChannelV2 | undefined;

  if (distributionChannels && distributionChannels.length > 0) {
    // Convert backend distribution channels to our format
    channels = distributionChannels.filter(
      (channel) => channel.channelType === 'alternative',
    );
    primary = distributionChannels.find(
      (channel) => channel.channelType === 'primary',
    );
  }

  return (
    <div className='aucctus-bg-primary aucctus-border-primary rounded-lg border p-6 shadow-sm'>
      <div className='mb-4 space-y-1'>
        <h3 className='aucctus-text-sm-medium aucctus-text-tertiary mb-2'>
          Channels
        </h3>
        <span className='flex flex-row items-center gap-1'>
          <Workflow className='aucctus-stroke-brand-secondary mr-1 h-5 w-5 flex-shrink-0' />
          <h3 className='aucctus-text-lg-bold aucctus-text-primary'>
            Distribution Channels
          </h3>
        </span>
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
        {/* Primary Channel */}
        {primary && (
          <div className='aucctus-bg-brand-primary-alt aucctus-border-brand rounded-lg border px-4 pb-2 pt-4'>
            <div className='aucctus-text-xs aucctus-text-brand-tertiary mb-1'>
              Primary Channel
            </div>
            <h3 className='aucctus-text-sm-medium aucctus-text-primary mb-1'>
              {primary.title}
            </h3>
            <p className='aucctus-text-xs aucctus-text-tertiary mb-3'>
              {primary.description}
            </p>
          </div>
        )}

        {/* Alternative Channels */}
        {channels.map((channel, index) => (
          <div
            key={index}
            className='aucctus-bg-secondary-extra-subtle aucctus-border-secondary rounded-lg border p-4'
          >
            <div className='aucctus-text-xs aucctus-text-tertiary mb-1'>
              Alternative Channel
            </div>
            <h3 className='aucctus-text-sm-medium aucctus-text-primary mb-1'>
              {channel.title}
            </h3>
            <p className='aucctus-text-xs aucctus-text-tertiary mb-3'>
              {channel.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DistributionChannelsSection;

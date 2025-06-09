import React from 'react';
import { Badge, Icon } from '@components';
import { IBusinessModelV2 } from '@libs/api/types/concept/financialProjectionV2';

const BusinessModelSubtypeIconMap: Record<string, IconVariant> = {
  // Revenue Models
  'Direct-to-Consumer Model': 'target',
  'Subscription Box Model': 'repeat-02',
  'Usage-Based Model': 'barchart',
  'Freemium Access Model': 'key',
  'Pay-per-Use Model': 'currency-dollar',
  'Tiered Membership Model': 'users-03',

  // Marketplace & Digital Models
  'Digital Marketplace Model': 'globe',
  'Affiliate Sales Model': 'link',
  'SaaS Licensing Model': 'cube',
  'API Access Model': 'link-source',

  // Enterprise & B2B Models
  'Enterprise Sales Model': 'building',
  'Platform Licensing Model': 'cube',
  'Data-as-a-Service Model': 'dataflow-04',
  'Hardware-as-a-Service Model': 'gear',
  'White-Label Resale Model': 'briefcase',

  // Partnership & Channel Models
  'Partner-Driven Sales Model': 'user-group',
  'Direct Sales Model': 'target',
  'Retail Distribution Model': 'building-02',
  'Channel Partnership Model': 'link-01',
  'Bundled Services Model': 'cube',
  'Referral Network Model': 'user-group',

  // Manufacturing & Licensing Models
  'Embedded Product Model': 'cube',
  'Manufacturer-to-Retail Model': 'route',
  'Brand Licensing Model': 'briefcase',

  // Operational & Internal Models
  'Process Efficiency Model': 'gear',
  'Shared Service Model': 'users-03',
  'Workforce Enablement Model': 'users-edit',
  'Cost Avoidance Model': 'shield-dollar',
  'Asset Utilization Model': 'pie-chart',
  'Compliance Automation Model': 'gear',
  'Internal Chargeback Model': 'currency-dollar',
};

interface BusinessModelCardProps {
  businessModelData?: IBusinessModelV2;
}

const BusinessModelCard: React.FC<BusinessModelCardProps> = ({
  businessModelData,
}) => {
  return (
    <div className='aucctus-bg-primary aucctus-border-primary rounded-lg border p-6 shadow-sm'>
      <span className='flex flex-1 flex-row items-center gap-2'>
        <h3 className='aucctus-text-sm-medium aucctus-text-tertiary mb-2'>
          Business Model
        </h3>
        <span className='flex flex-1' />
        <Badge.Default
          value={businessModelData?.type || ''}
          classNameBadge='aucctus-border-primary aucctus-bg-secondary border rounded-full items-center justify-center'
          classNameLabel='aucctus-text-secondary'
        />
      </span>
      <div className='mb-2 flex flex-1 flex-row items-center gap-2'>
        {businessModelData?.subtype && (
          <>
            <Icon
              variant={BusinessModelSubtypeIconMap[businessModelData.subtype]}
              className='aucctus-stroke-brand-primary mr-1 h-6 w-6'
            />
            <div className='aucctus-text-lg-medium aucctus-text-secondary'>
              {businessModelData.subtype}
            </div>
          </>
        )}
      </div>
      <p className='aucctus-text-sm aucctus-text-tertiary'>
        {businessModelData?.description}
      </p>

      {/* Primary Value Driver Section */}
      <div className='aucctus-border-tertiary mt-4 border-t pt-3'>
        <div className='mb-2 flex items-center gap-2'>
          <Icon
            variant='trendup'
            className='aucctus-stroke-secondary h-4 w-4'
          />
          <h4 className='aucctus-text-sm-medium aucctus-text-secondary'>
            Primary Value Driver
          </h4>
        </div>
        <div className='aucctus-bg-success-secondary flex items-center gap-2 rounded-md bg-opacity-25 px-3 py-2'>
          <Icon
            variant='currency-dollar'
            className='aucctus-stroke-success-primary h-4 w-4'
          />
          <p className='aucctus-text-xs aucctus-text-success-primary'>
            Generate Revenue
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusinessModelCard;

import React from 'react';
import { ITargetSavingsAreaV2 } from '@libs/api/types/concept/financialProjectionV2';

interface TargetSavingsAreasSectionProps {
  targetSavingsAreas?: ITargetSavingsAreaV2[];
}

const TargetSavingsAreasSection: React.FC<TargetSavingsAreasSectionProps> = ({
  targetSavingsAreas,
}) => {
  // Transform backend data if available
  let areas: ITargetSavingsAreaV2[] = [];
  let primary: ITargetSavingsAreaV2 | undefined;

  if (targetSavingsAreas && targetSavingsAreas.length > 0) {
    // Convert backend target savings areas to our format
    areas = targetSavingsAreas.filter(
      (area) => area.areaType === 'alternative',
    );
    primary = targetSavingsAreas.find((area) => area.areaType === 'primary');
  }

  return (
    <div className='aucctus-bg-primary aucctus-border-primary rounded-lg border p-6 shadow-sm'>
      <div className='mb-4 space-y-1'>
        <h3 className='aucctus-text-lg-medium aucctus-text-tertiary mb-4'>
          Target Savings Areas
        </h3>
      </div>

      <div className='grid grid-cols-1 gap-4 lg:grid-cols-3'>
        {/* Primary Area */}
        {primary && (
          <div className='aucctus-bg-brand-primary-alt aucctus-border-brand rounded-lg border px-4 pb-2 pt-4'>
            <div className='aucctus-text-xs aucctus-text-brand-tertiary mb-1'>
              Primary Area
            </div>
            <h3 className='aucctus-text-sm-medium aucctus-text-primary mb-1'>
              {primary.title}
            </h3>
            <p className='aucctus-text-xs aucctus-text-tertiary mb-3'>
              {primary.description}
            </p>
          </div>
        )}

        {/* Alternative Areas */}
        {areas.map((area, index) => (
          <div
            key={index}
            className='aucctus-bg-secondary-extra-subtle aucctus-border-secondary rounded-lg border p-4'
          >
            <div className='aucctus-text-xs aucctus-text-tertiary mb-1'>
              Alternative Area
            </div>
            <h3 className='aucctus-text-sm-medium aucctus-text-primary mb-1'>
              {area.title}
            </h3>
            <p className='aucctus-text-xs aucctus-text-tertiary mb-3'>
              {area.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TargetSavingsAreasSection;

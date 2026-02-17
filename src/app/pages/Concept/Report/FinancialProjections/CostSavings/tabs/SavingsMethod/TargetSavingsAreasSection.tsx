import React from 'react';
import { ITargetSavingsAreaV2 } from '@libs/api/types/concept/financialProjectionV2';
import { Briefcase } from 'lucide-react';
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
        <h3 className='aucctus-text-sm-medium aucctus-text-tertiary mb-2'>
          Savings Scope
        </h3>
        <span className='flex flex-row items-center gap-1'>
          <Briefcase className='aucctus-stroke-brand-secondary mr-1 h-5 w-5 flex-shrink-0' />
          <h3 className='aucctus-text-lg-bold aucctus-text-primary'>
            Target Impact Areas
          </h3>
        </span>
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

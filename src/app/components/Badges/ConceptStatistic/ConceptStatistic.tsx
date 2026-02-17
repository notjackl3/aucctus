import { FunctionComponent } from 'react';

import { ConceptStatusIconColor } from '../../../../libs/utils/concepts';
import { cn } from '@libs/utils/react';
import { DynamicIcon } from '@libs/utils/iconMap';

export interface IConceptStatisticProps {
  icon: string;
  iconColor: ConceptStatusIconColor;
  infoTitle: string;
  infoValue: string;
  infoSubValue?: string;
  variant?: 'opportunity';
}

const defaultIconProps = {
  height: 24,
  width: 24,
  className: 'stroke-primary-900',
};

const ConceptStatistic: FunctionComponent<IConceptStatisticProps> = ({
  infoTitle,
  infoValue,
  infoSubValue,
  iconColor,
  icon,
  variant,
}) => {
  const getAdditionalStatisticStyle = (
    variant: IConceptStatisticProps['variant'],
  ) => {
    switch (variant) {
      case 'opportunity':
        return 'bg-white rounded-lg p-4 shadow-md';
      default:
        return '';
    }
  };

  const additionalStyle = getAdditionalStatisticStyle(variant);

  return (
    <div className={`flex items-center gap-3 ${additionalStyle}`}>
      <span
        className={cn(
          'aucctus-border-tertiary flex items-center justify-center rounded-full border p-2',
          {
            'bg-blue-25': iconColor === 'lightBlue',
            'bg-blue-50': iconColor === 'blue',
            'bg-purple-100': iconColor === 'purple',
            'aucctus-bg-brand-tertiary': ![
              'lightBlue',
              'blue',
              'purple',
            ].includes(iconColor),
          },
        )}
      >
        <DynamicIcon variant={icon} {...defaultIconProps} />
      </span>
      <div className='flex flex-col'>
        <div className='aucctus-text-sm aucctus-text-tertiary'>{infoTitle}</div>
        <div className='flex items-center gap-2'>
          <div className='aucctus-text-md-medium aucctus-text-primary'>
            {infoValue}
          </div>
          {infoSubValue && (
            <div className='aucctus-text-sm aucctus-text-tertiary'>
              {infoSubValue}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConceptStatistic;

import { FunctionComponent } from 'react';
import { CircleHelp } from 'lucide-react';
import { ComponentTooltip } from '@components';

export interface RowInfoProps {
  label: string;
  sublabel?: string;
  render: React.ReactNode;
  tooltipContent?: string;
}

const RowInfo: FunctionComponent<RowInfoProps> = ({
  label,
  sublabel,
  render,
  tooltipContent,
}) => {
  return (
    <div className='aucctus-border-primary box-border flex items-start gap-6 self-stretch border-b py-4 last:border-b-0'>
      <div className='flex w-60 flex-col'>
        {label && (
          <div className='aucctus-text-sm-semibold aucctus-text-brand-secondary flex justify-start gap-2 self-stretch'>
            {label}
            {tooltipContent && (
              <ComponentTooltip tip={tooltipContent}>
                <CircleHelp className='aucctus-stroke-tertiary h-4 w-4' />
              </ComponentTooltip>
            )}
          </div>
        )}
        {sublabel && (
          <div className='aucctus-text-sm aucctus-text-secondary flex'>
            {sublabel}
          </div>
        )}
      </div>
      {render}
    </div>
  );
};

export default RowInfo;

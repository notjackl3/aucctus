import { FunctionComponent } from 'react';
import Icon from './Icon/Icon';

const defaultIconProps = {
  stroke: '#000',
  width: 24,
  height: 24,
};

export interface IFeatureIconProps {
  icon: IconVariant;
  color: 'purple' | 'green' | 'yellow';
}

const colorStyle = {
  purple: 'bg-indigo-100 border-violet-50',
  green: 'bg-emerald-100 border-emerald-50',
  yellow: '',
};

const stroke = {
  purple: '#4318ff',
  green: '#039855',
  yellow: '#edb845',
};

const FeatureIcon: FunctionComponent<IFeatureIconProps> = ({ icon, color }) => {
  return (
    <div
      className={`inline-flex h-14 w-14 items-center justify-center gap-2.5 rounded-full border-8 p-3.5 ${colorStyle[color]}`}
    >
      <div className='relative h-7 w-7'>
        <Icon variant={icon} {...defaultIconProps} stroke={stroke[color]} />
      </div>
    </div>
  );
};

export default FeatureIcon;

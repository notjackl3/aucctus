import { FunctionComponent } from 'react';

import Icon from '../Icons/Icon/Icon';

const defaultIconProps = {
  width: 16,
  height: 16,
};

export interface ISimpleProps {
  text: string;
  showBullet?: boolean;
  icon?: IconVariant;
  bulletClass?: string;
}

const Simple: FunctionComponent<ISimpleProps> = ({ text, icon, showBullet, bulletClass = 'red-500' }) => {
  return (
    <div className={`flex items-center gap-2 rounded-2xl bg-neutral-50 py-[0.2rem] pl-[0.4rem] pr-2`}>
      {showBullet ? <span className={`text-center text-base ${bulletClass}`}>●</span> : null}
      {icon ? <Icon variant={icon} {...defaultIconProps} /> : null}
      <span className={'whitespace-nowrap text-center text-base font-medium capitalize not-italic leading-6'}>
        {text}
      </span>
    </div>
  );
};

export default Simple;

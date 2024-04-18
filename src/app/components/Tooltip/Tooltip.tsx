import { FunctionComponent } from 'react';
import styles from './styles/tooltip.module.scss';
import { useState } from 'react';
import Icon from '../Icon';

interface TooltipProps {
  content: string;
}

const defaultIconProps = {
  stroke: '#98A2B3',
  width: 16,
  height: 16,
};

const Tooltip: FunctionComponent<TooltipProps> = ({ content }) => {
  const [isActive, setActive] = useState(false);

  const showTip = () => {
    setActive(true);
  };

  const hideTip = () => {
    setActive(false);
  };

  return (
    content && (
      <div className={styles.tooltip} onMouseEnter={showTip} onMouseLeave={hideTip}>
        <Icon variant="helpCircle" {...defaultIconProps} />
        {isActive && (
          <div className={`${styles.tooltipTip} ${styles.top}`}>
            <span>{content}</span>
          </div>
        )}
      </div>
    )
  );
};

export default Tooltip;

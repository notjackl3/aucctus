import { FunctionComponent, useCallback, useRef } from 'react';
import styles from './tool-tip.module.scss';
import { useState } from 'react';

interface TooltipProps {
  tip: string;
  children: React.ReactNode;
}

const Tooltip: FunctionComponent<TooltipProps> = ({ tip, children }) => {
  const [isActive, setActive] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
      if (ref.current) {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - ref.current.clientWidth / 2;
        const y = e.clientY - rect.top - ref.current.clientHeight * 2.8;
        ref.current.style.transform = `translate(${x}px, ${y}px)`;
      }
    },
    [],
  );

  return (
    <div
      className={styles.container}
      onMouseEnter={() => setActive(!!tip)}
      onMouseLeave={() => setActive(false)}
      onMouseMove={handleMouseMove}
    >
      {children}
      <div
        ref={ref}
        className={`${styles.tooltip} ${styles.top} ${!isActive ? styles.inActive : ''}`}
      >
        <span>{tip}</span>
      </div>
    </div>
  );
};

export default Tooltip;

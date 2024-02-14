import React, { FunctionComponent } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { usePrevious, useMeasure } from '../hooks';

interface CollapsibleProps {
  toggle: boolean;
  children: React.ReactNode;
  width?: number | string;
}

const Collapsible: FunctionComponent<CollapsibleProps> = ({ toggle = false, children, width }) => {
  // @ts-ignore
  const [bind, { height: viewHeight }] = useMeasure<HTMLDivElement>();
  const previous = usePrevious(toggle);

  const spring = useSpring({
    from: { height: 0, opacity: 0 },
    to: { height: toggle ? viewHeight : 0, opacity: toggle ? 1 : 0 },
  });

  return (
    <animated.div
      aria-expanded={toggle}
      style={{
        width: width,
        position: 'relative',
        opacity: spring.opacity,
        height: toggle && previous === toggle ? 'auto' : spring.height,
        zIndex: toggle ? 0 : -100,
      }}
    >
      {/* @ts-ignore */}
      <animated.div {...bind}>{children}</animated.div>
    </animated.div>
  );
};

export default Collapsible;

import { animated, useSpring } from '@react-spring/web';
import React from 'react';
import { useMeasure } from 'react-use';

interface CollapsibleProp extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  open?: boolean;
}

const Collapsible: React.FC<CollapsibleProp> = ({
  children,
  open = false,
  ...props
}) => {
  const [ref, { height }] = useMeasure<HTMLDivElement>();

  const animProps = useSpring({
    height: open ? height : 0,
    opacity: open ? 1 : 0,
    overflow: 'hidden',
    config: { tension: 300, friction: 20 },
  });

  return (
    <animated.div {...props} style={animProps}>
      <div ref={ref}>{children}</div>
    </animated.div>
  );
};

export default React.memo(Collapsible);

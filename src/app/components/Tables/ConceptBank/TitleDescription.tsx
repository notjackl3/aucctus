import { animated, useSpring } from '@react-spring/web';
import classNames from 'classnames';
import React from 'react';

interface TitleDescriptionProps {
  title: string;
  description: string;
}

const MAX_DESCRIPTION_WIDTH = 60;

const TitleDescription: React.FC<TitleDescriptionProps> = ({
  title,
  description,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);
  const [memoizedHeight, setMemoizedHeight] = React.useState(0);
  const [isTruncated, setIsTruncated] = React.useState(false);

  const fullTextRef = React.useRef<HTMLSpanElement>(null);

  React.useLayoutEffect(() => {
    if (fullTextRef.current) {
      const fullHeight = fullTextRef.current.clientHeight;

      setMemoizedHeight(fullHeight + 60);

      // Check if the text is truncated
      setIsTruncated(fullHeight >= MAX_DESCRIPTION_WIDTH);
    }
  }, [description]);

  const animatedStyles = useSpring({
    config: { tension: 300, friction: 25 },
    maxHeight: isHovered ? memoizedHeight : undefined, // Adjust these values as needed
    opacity: isHovered && isTruncated ? 1 : 0,
  });

  return (
    <span
      className='relative flex h-24 flex-col justify-start gap-2 align-middle'
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span className='text-base font-medium text-indigo-900'>{title}</span>
      <span className='relative max-h-[60px]'>
        <span
          className={`line-clamp-3 text-base font-medium leading-tight text-slate-500`}
        >
          {description}
        </span>
        <animated.span
          style={{
            position: 'absolute',
            top: 0,
            maxHeight: animatedStyles.maxHeight,
            opacity: animatedStyles.opacity,
          }}
          ref={fullTextRef}
          className={classNames(
            `z-10 rounded-md bg-white text-base font-medium leading-tight text-slate-500 shadow-lg`,
            { 'p-2': isHovered },
          )}
        >
          {description}
        </animated.span>
      </span>
    </span>
  );
};

export default TitleDescription;

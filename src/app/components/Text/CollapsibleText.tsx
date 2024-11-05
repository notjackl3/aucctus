import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import { animated, useSpring } from '@react-spring/web';
import React from 'react';

interface TitleDescriptionProps {
  title: string;
  titleClassName?: string;
  description: string;
  // Note: trying to set the position of the description will not work as this is being enforced to a relative position to ensure the animation works properly
  descriptionClassName?: string;
  maxDescriptionHeight?: number;
}

// const MAX_DESCRIPTION_HEIGHT = 60;

const CollapsibleText: React.FC<TitleDescriptionProps> = ({
  title,
  titleClassName,
  description,
  descriptionClassName,
  maxDescriptionHeight = 60,
}) => {
  const [open, setOpen] = React.useState(false);
  const [isTruncated, setIsTruncated] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);

  const textRef = React.useRef<HTMLSpanElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(event.target as Node)
    ) {
      setOpen(false);
    }
  };

  const checkIfTruncated = () => {
    if (textRef.current) {
      setIsTruncated(
        textRef.current.scrollHeight > textRef.current.clientHeight,
      );
    }
  };

  React.useLayoutEffect(() => {
    checkIfTruncated();
  }, [description]);

  React.useEffect(() => {
    const handleResize = () => {
      checkIfTruncated();
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const animatedStyles = useSpring({
    height: open ? textRef.current?.scrollHeight : maxDescriptionHeight,
    config: { tension: 300, friction: 25 },
  });

  return (
    <span
      ref={containerRef}
      className='flex h-full min-h-full flex-col items-start justify-start gap-2 bg-inherit text-start align-top'
      onClick={() => isTruncated && setOpen((prev) => !prev)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        className={cn('text-base font-medium text-indigo-900', titleClassName)}
      >
        {title}
      </span>
      <animated.span
        ref={textRef}
        className={cn(
          'text-sm font-medium leading-tight text-slate-500',
          {
            'line-clamp-3': !open,
            'cursor-pointer': isTruncated,
          },
          descriptionClassName,
          // This is to ensure relative is set and takes priority
          'relative',
        )}
        style={animatedStyles}
      >
        {description}
        {!open && isTruncated && (
          <>
            <span className='pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-inherit to-transparent'></span>
            <span className='absolute top-[50%] flex w-full justify-center'>
              {isHovered && (
                <button className='btn btn-light btn-xs'>
                  See More <Icon variant='arrowdown' />
                </button>
              )}
            </span>
          </>
        )}
      </animated.span>
    </span>
  );
};

export default CollapsibleText;

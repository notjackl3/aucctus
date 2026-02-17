import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import { motion } from 'framer-motion';
import React from 'react';

interface TitleDescriptionProps {
  title: string;
  titleClassName?: string;
  description: string;
  // Note: trying to set the position of the description will not work as this is being enforced to ensure the animation works properly
  descriptionClassName?: string;
  maxDescriptionHeight?: number;
  truncationClassName?: string;
}

// const MAX_DESCRIPTION_HEIGHT = 60;

const CollapsibleText: React.FC<TitleDescriptionProps> = ({
  title,
  titleClassName,
  description,
  descriptionClassName,
  maxDescriptionHeight = 'auto',
  truncationClassName = 'line-clamp-3',
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

  return (
    <span
      ref={containerRef}
      className='flex h-full min-h-full flex-col items-start justify-center gap-2 bg-inherit text-start align-middle'
      onClick={() => isTruncated && setOpen((prev) => !prev)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        className={cn(
          'aucctus-text-primary aucctus-text-sm self-start',
          titleClassName,
        )}
      >
        {title}
      </span>
      <motion.span
        ref={textRef}
        className={cn(
          'aucctus-text-tertiary aucctus-text-sm self-start leading-tight',
          // Add word breaking and overflow handling to prevent horizontal overflow
          'hyphens-auto break-words',
          {
            [truncationClassName]: !open,
            'cursor-pointer': isTruncated,
          },
          descriptionClassName,
          // This is to ensure relative is set and takes priority
          'relative',
        )}
        initial={false}
        animate={{
          height: open
            ? (textRef.current?.scrollHeight ?? 'auto')
            : maxDescriptionHeight,
        }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        style={{
          // Additional CSS properties for better text wrapping
          overflowWrap: 'anywhere',
          wordBreak: 'break-word',
        }}
      >
        {description}
        {!open && isTruncated && (
          <>
            <span className='pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-inherit to-transparent'></span>
            <span className='absolute inset-x-0 bottom-0 flex w-full justify-center'>
              {isHovered && (
                <button className='btn btn-light btn-xs mb-1'>
                  See More <Icon variant='arrowdown' />
                </button>
              )}
            </span>
          </>
        )}
      </motion.span>
    </span>
  );
};

export default CollapsibleText;

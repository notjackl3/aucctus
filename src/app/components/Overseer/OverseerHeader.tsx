import { Icon } from '@components';
import React from 'react';

interface OverseerHeaderProps {
  onClose: () => void;
  onDragStart?: (e: React.MouseEvent) => void;
}

/**
 * Header component for the Overseer popup
 * Displays the title, subtitle, and close button with refined styling
 */
const OverseerHeader: React.FC<OverseerHeaderProps> = ({
  onClose,
  onDragStart,
}) => {
  return (
    <div
      className='flex cursor-grab items-center justify-between border-b border-white/10 px-5 py-4 active:cursor-grabbing'
      onMouseDown={onDragStart}
    >
      <div className='flex items-center gap-4'>
        <div className='flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/5 shadow-lg shadow-black/20 backdrop-blur-md'>
          <Icon
            variant='sparkles'
            width={20}
            height={20}
            className='aucctus-stroke-white opacity-90'
          />
        </div>
        <div className='flex flex-col gap-0.5'>
          <h4 className='aucctus-text-md-semibold leading-tight tracking-tight text-white'>
            Overseer
          </h4>
          <span className='aucctus-text-2xs-bold uppercase leading-none tracking-[0.25em] text-white/30'>
            AI Context Analysis
          </span>
        </div>
      </div>
      <button
        onClick={onClose}
        onMouseDown={(e) => e.stopPropagation()}
        className='group flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-all duration-200 hover:border-white/20 hover:bg-white/10'
        aria-label='Close Overseer'
      >
        <Icon
          variant='closeX'
          width={16}
          height={16}
          className='stroke-white/40 transition-colors group-hover:stroke-white'
        />
      </button>
    </div>
  );
};

export default OverseerHeader;

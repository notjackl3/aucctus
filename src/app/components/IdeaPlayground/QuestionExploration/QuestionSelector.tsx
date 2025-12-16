import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Icon } from '@components';
import { Question } from '../types';

interface QuestionSelectorProps {
  question: Question;
  index: number;
  isActive: boolean;
  isAnswered: boolean;
  isDeleting?: boolean;
  onSelect: () => void;
  onRemove?: () => void;
}

/**
 * Glassmorphic confirmation tooltip that appears above the delete button
 */
const DeleteConfirmTooltip: React.FC<{
  targetRef: React.RefObject<HTMLButtonElement>;
  onClose: () => void;
}> = ({ targetRef, onClose }) => {
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const updatePosition = () => {
      if (targetRef.current) {
        const rect = targetRef.current.getBoundingClientRect();
        setPosition({
          // Position directly above the button center
          top: rect.top - 6,
          left: rect.left + rect.width / 2,
        });
      }
    };

    updatePosition();
    // Update position on scroll/resize
    window.addEventListener('scroll', updatePosition, true);
    window.addEventListener('resize', updatePosition);
    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [targetRef]);

  // Close tooltip after 3 seconds if user doesn't interact
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Close tooltip when clicking anywhere outside the delete button
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (targetRef.current && !targetRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    // Use setTimeout to avoid the current click event triggering this
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [targetRef, onClose]);

  return createPortal(
    <div
      className='pointer-events-none fixed z-[9999]'
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div
        className='relative -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-lg border border-white/30 bg-black/80 px-3 py-2 text-center shadow-xl backdrop-blur-xl'
        style={{
          animation: 'tooltipFadeIn 0.2s ease-out forwards',
          opacity: 0,
        }}
      >
        <div className='text-xs font-medium text-white'>
          Are you sure? This is irreversible.
        </div>
        <div className='mt-1 text-[10px] text-white/60'>
          Click again to delete
        </div>
        {/* Tooltip arrow pointing down */}
        <div className='absolute -bottom-1 left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border-b border-r border-white/30 bg-black/80' />
      </div>

      {/* Inject animation keyframes */}
      <style>{`
        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(calc(-100% + 4px));
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(-100%);
          }
        }
      `}</style>
    </div>,
    document.body,
  );
};

const QuestionSelector: React.FC<QuestionSelectorProps> = ({
  question,
  index,
  isActive,
  isAnswered,
  isDeleting = false,
  onSelect,
  onRemove,
}) => {
  // A question is considered custom if it's a local temp question OR has isCustomQuestion from API
  const isCustomQuestion =
    question.id.startsWith('custom-') || question.isCustomQuestion;

  // State for showing confirmation tooltip
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const deleteButtonRef = useRef<HTMLButtonElement>(null);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (showDeleteConfirm) {
      // Second click - confirm deletion
      onRemove?.();
      setShowDeleteConfirm(false);
    } else {
      // First click - show confirmation
      setShowDeleteConfirm(true);
    }
  };

  const handleDeleteMouseLeave = () => {
    // Don't immediately close - let the tooltip timeout handle it
    // This gives user time to see the message
  };

  const handleCloseTooltip = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className='relative'>
      {/* Confirmation Tooltip - rendered via portal */}
      {showDeleteConfirm && !isDeleting && (
        <DeleteConfirmTooltip
          targetRef={deleteButtonRef}
          onClose={handleCloseTooltip}
        />
      )}

      <button
        onClick={onSelect}
        className={`group relative flex h-9 flex-shrink-0 items-center justify-center gap-1.5 rounded-lg border px-3 transition-all duration-300 ${
          isDeleting
            ? 'animate-pulse border-white/20 bg-white/5 opacity-60'
            : isActive && isAnswered
              ? 'aucctus-bg-success-solid aucctus-border-success aucctus-text-white shadow-lg'
              : isActive
                ? 'aucctus-text-white border-white/40 bg-white/20 shadow-lg'
                : isAnswered
                  ? 'aucctus-bg-success-glass aucctus-border-success aucctus-text-success-primary hover:aucctus-bg-success-glass-hover'
                  : 'aucctus-text-quaternary border-white/20 bg-white/10 hover:border-white/30 hover:bg-white/15'
        }`}
      >
        {isCustomQuestion && onRemove && (
          <button
            ref={deleteButtonRef}
            onClick={handleDeleteClick}
            onMouseLeave={handleDeleteMouseLeave}
            disabled={isDeleting}
            className={`absolute -right-1.5 -top-1.5 z-[100] flex h-4 w-4 items-center justify-center rounded-full transition-all duration-200 ${
              isDeleting
                ? 'aucctus-bg-secondary-solid opacity-100'
                : showDeleteConfirm
                  ? 'aucctus-bg-error-solid opacity-100'
                  : 'aucctus-bg-secondary-solid hover:aucctus-bg-secondary-solid-hover opacity-0 group-hover:opacity-100'
            }`}
          >
            {isDeleting ? (
              <Icon
                variant='loading-02'
                className='aucctus-stroke-white h-2.5 w-2.5 animate-spin'
              />
            ) : (
              <Icon
                variant='closeX'
                className='aucctus-stroke-white'
                height={10}
                width={10}
              />
            )}
          </button>
        )}

        <span className='aucctus-text-xs opacity-50'>{index + 1}.</span>
        <span className='aucctus-text-xs-medium'>{question.label}</span>
      </button>
    </div>
  );
};

export default QuestionSelector;

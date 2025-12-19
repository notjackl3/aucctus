import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import defaultAvatar from '@assets/img/avatar.png';

interface PersonaCardProps {
  persona: {
    id: string;
    name: string;
    segment: string;
    avatar?: string;
    count: number;
    ratio: number;
    color: string;
  };
  onCountChange: (id: string, count: number) => void;
  maxParticipants: number;
  disabled?: boolean;
  debounceMs?: number;
}

const PersonaCard: React.FC<PersonaCardProps> = ({
  persona,
  onCountChange,
  maxParticipants,
  disabled = false,
  debounceMs = 500,
}) => {
  // Local state for immediate UI updates
  const [localCount, setLocalCount] = useState(persona.count);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSentCountRef = useRef(persona.count);

  // Sync local state when prop changes (e.g., after API response)
  useEffect(() => {
    setLocalCount(persona.count);
    lastSentCountRef.current = persona.count;
  }, [persona.count]);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Debounced API call
  const debouncedUpdate = useCallback(
    (newCount: number) => {
      // Clear existing timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new timer
      debounceTimerRef.current = setTimeout(() => {
        // Only call API if count actually changed from last sent value
        if (newCount !== lastSentCountRef.current) {
          lastSentCountRef.current = newCount;
          onCountChange(persona.id, newCount);
        }
      }, debounceMs);
    },
    [onCountChange, persona.id, debounceMs],
  );

  const handleCountUpdate = useCallback(
    (newCount: number) => {
      if (disabled) return;

      // Clamp the value
      const clampedCount = Math.max(0, Math.min(maxParticipants, newCount));

      // Update local state immediately for responsive UI
      setLocalCount(clampedCount);

      // Debounce the API call
      debouncedUpdate(clampedCount);
    },
    [disabled, maxParticipants, debouncedUpdate],
  );

  const isSelected = localCount > 0;

  const handleCardClick = () => {
    if (disabled) return;
    handleCountUpdate(isSelected ? 0 : 1);
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleCountUpdate(localCount - 1);
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleCountUpdate(localCount + 1);
  };

  const activeColor = isSelected ? persona.color : 'rgb(156, 163, 175)'; // gray-400

  return (
    <div
      className={cn(
        'aucctus-bg-primary aucctus-border-secondary cursor-pointer rounded-lg border p-4 transition-all hover:shadow-md',
        {
          'opacity-50': !isSelected,
          'cursor-not-allowed': disabled,
        },
      )}
      onClick={handleCardClick}
    >
      <div className='space-y-2.5'>
        {/* Line 1: Checkmark, Avatar, Name */}
        <div className='flex items-center gap-2'>
          {/* Colored checkmark circle */}
          <div
            className='flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-colors'
            style={{ backgroundColor: activeColor }}
          >
            {isSelected && (
              <Icon
                variant='check'
                className='h-3 w-3 stroke-white stroke-[3]'
              />
            )}
          </div>

          {/* Avatar */}
          <img
            src={persona.avatar || defaultAvatar}
            alt={persona.name}
            className='h-8 w-8 shrink-0 rounded-full object-cover'
          />

          {/* Name */}
          <span className='aucctus-text-sm aucctus-text-secondary truncate'>
            {persona.name}
          </span>
        </div>

        {/* Line 2: Persona Segment/Title */}
        <h3 className='aucctus-text-xl-bold aucctus-text-primary pl-7 leading-tight'>
          {persona.segment}
        </h3>

        {/* Line 3: Stepper + Ratio */}
        <div className='flex items-center justify-between pl-7'>
          {/* Stepper container */}
          <div className='aucctus-bg-secondary-subtle flex items-center gap-1 rounded-md px-2 py-1'>
            <button
              className={cn(
                'aucctus-text-secondary hover:aucctus-text-primary flex h-6 w-6 items-center justify-center rounded transition-colors',
                'hover:aucctus-bg-primary disabled:opacity-30',
              )}
              onClick={handleDecrement}
              disabled={localCount === 0 || disabled}
            >
              −
            </button>

            {/* Count badge */}
            <div
              className='flex h-6 min-w-[28px] items-center justify-center rounded px-2 text-sm font-semibold text-white'
              style={{ backgroundColor: activeColor }}
            >
              {localCount}
            </div>

            <button
              className={cn(
                'aucctus-text-secondary hover:aucctus-text-primary flex h-6 w-6 items-center justify-center rounded transition-colors',
                'hover:aucctus-bg-primary disabled:opacity-30',
              )}
              onClick={handleIncrement}
              disabled={localCount >= maxParticipants || disabled}
            >
              +
            </button>
          </div>

          {/* Ratio percentage */}
          <span
            className='aucctus-text-sm-medium'
            style={{ color: activeColor }}
          >
            {persona.ratio}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default PersonaCard;

import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@components';
import { AppPath } from '@routes/routes';
import { useConceptIncubationStore } from '@stores/concept-incubation/enhancedStore';
import { cn } from '@libs/utils/react';

type IdeationMode = 'playground' | 'ideate';
type SwitcherVariant = 'dark' | 'light';

interface IdeationModeSwitcherProps {
  /**
   * Which mode is currently active
   */
  currentMode: IdeationMode;
  /**
   * Visual variant - 'dark' for glassmorphic on dark backgrounds, 'light' for light backgrounds
   */
  variant?: SwitcherVariant;
  /**
   * Optional className for positioning
   */
  className?: string;
}

const MODE_OPTIONS = [
  {
    id: 'playground' as const,
    label: 'Idea Playground Beta',
    description: 'New exploration experience',
    route: AppPath.IdeaPlayground,
  },
  {
    id: 'ideate' as const,
    label: 'Aucctus Ideate 2.0',
    description: 'Classic concept generation',
    route: AppPath.IncubateConcept,
  },
];

/**
 * Glassmorphic dropdown for switching between ideation modes.
 * Shows on both IdeaPlayground and IncubateConcept pages.
 */
const IdeationModeSwitcher: React.FC<IdeationModeSwitcherProps> = ({
  currentMode,
  variant = 'dark',
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { resetQuestionnaire, setIsNewSeed } = useConceptIncubationStore();

  const currentOption = MODE_OPTIONS.find((opt) => opt.id === currentMode);
  const isDark = variant === 'dark';

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleModeSelect = (mode: IdeationMode) => {
    if (mode === currentMode) {
      setIsOpen(false);
      return;
    }

    const targetOption = MODE_OPTIONS.find((opt) => opt.id === mode);
    if (!targetOption) return;

    // If switching to Ideate 2.0, reset the questionnaire like "Add Concept" does
    if (mode === 'ideate') {
      resetQuestionnaire();
      setIsNewSeed(true);
    }

    navigate(targetOption.route);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={cn('relative z-50', className)}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-2 rounded-lg px-4 py-2.5',
          'backdrop-blur-md transition-all duration-200',
          {
            // Dark variant (glassmorphic on dark backgrounds)
            'border border-white/20 bg-white/10 text-white hover:border-white/30 hover:bg-white/15':
              isDark,
            'border-white/30 bg-white/15': isDark && isOpen,
            // Light variant (for light backgrounds)
            'border border-gray-300 bg-white text-gray-900 shadow-sm hover:border-gray-400 hover:bg-gray-50':
              !isDark,
            'border-gray-400 bg-gray-50': !isDark && isOpen,
          },
        )}
      >
        <span className='aucctus-text-sm-medium'>{currentOption?.label}</span>
        <Icon
          variant='chevrondown'
          className={cn('h-4 w-4 transition-transform duration-200', {
            'aucctus-stroke-white': isDark,
            'stroke-gray-700': !isDark,
            'rotate-180': isOpen,
          })}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            'absolute bottom-full left-0 mb-2 min-w-[240px]',
            'overflow-hidden rounded-xl shadow-lg',
            'animate-in fade-in slide-in-from-bottom-2 duration-200',
            {
              'border border-white/20 bg-white/10 backdrop-blur-xl': isDark,
              'border border-gray-200 bg-white shadow-xl': !isDark,
            },
          )}
        >
          {MODE_OPTIONS.map((option) => {
            const isSelected = option.id === currentMode;

            return (
              <button
                key={option.id}
                onClick={() => handleModeSelect(option.id)}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-3 text-left',
                  'transition-colors duration-150',
                  {
                    // Dark variant
                    'bg-white/10': isDark && isSelected,
                    'hover:bg-white/5': isDark && !isSelected,
                    // Light variant
                    'bg-gray-100': !isDark && isSelected,
                    'hover:bg-gray-50': !isDark && !isSelected,
                  },
                )}
              >
                {/* Selection indicator */}
                <div
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full border-2',
                    {
                      // Dark variant
                      'border-white bg-white': isDark && isSelected,
                      'border-white/40': isDark && !isSelected,
                      // Light variant
                      'border-gray-800 bg-gray-800': !isDark && isSelected,
                      'border-gray-400': !isDark && !isSelected,
                    },
                  )}
                >
                  {isSelected && (
                    <Icon
                      variant='check'
                      className={cn('h-3 w-3', {
                        'aucctus-stroke-brand-primary': isDark,
                        'stroke-white': !isDark,
                      })}
                    />
                  )}
                </div>

                {/* Label and description */}
                <div className='flex flex-col'>
                  <span
                    className={cn('aucctus-text-sm-medium', {
                      'text-white': isDark && isSelected,
                      'text-white/80': isDark && !isSelected,
                      'text-gray-900': !isDark && isSelected,
                      'text-gray-700': !isDark && !isSelected,
                    })}
                  >
                    {option.label}
                  </span>
                  <span
                    className={cn('aucctus-text-xs', {
                      'text-white/50': isDark,
                      'text-gray-500': !isDark,
                    })}
                  >
                    {option.description}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default IdeationModeSwitcher;

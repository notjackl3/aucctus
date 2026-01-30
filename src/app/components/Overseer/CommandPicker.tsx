import { Icon } from '@components';
import { useCustomCommandsForPicker } from '@hooks/query/customCommands.hook';
import { cn } from '@libs/utils/react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { filterSlashCommands, SlashCommand } from './slashCommands';

interface CommandPickerProps {
  /** Current filter text (without the leading "/") */
  filter: string;
  /** Callback when a command is selected */
  onSelect: (command: SlashCommand) => void;
  /** Callback when picker should close */
  onClose: () => void;
  /** Whether selected text is available (affects command availability) */
  hasSelection?: boolean;
  /** Additional class names */
  className?: string;
  /** Inline styles for custom positioning */
  style?: React.CSSProperties;
}

/**
 * Command picker dropdown for slash commands
 *
 * Features:
 * - Fuzzy filtering as user types
 * - Keyboard navigation (arrow keys, Enter, Escape)
 * - Visual indication of commands requiring selection
 * - Support for custom user-defined commands
 */
const CommandPicker: React.FC<CommandPickerProps> = ({
  filter,
  onSelect,
  onClose,
  hasSelection = false,
  className,
  style,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  // Fetch custom commands
  const { data: customCommands } = useCustomCommandsForPicker();

  // Filter commands based on input (including custom commands)
  const filteredCommands = useMemo(
    () => filterSlashCommands(filter, customCommands),
    [filter, customCommands],
  );

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [filter]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const selectedElement = listRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const totalItems = filteredCommands.length;

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : prev));
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
          break;
        case 'Enter':
          e.preventDefault();
          e.stopPropagation();
          if (!filteredCommands[selectedIndex]) {
            return;
          }
          const cmd = filteredCommands[selectedIndex];
          // Check if command requires selection and we don't have one
          if (cmd.requiresSelection && !hasSelection) {
            return; // Don't select disabled commands
          }
          onSelect(cmd);
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
        case 'Tab':
          e.preventDefault();
          if (!filteredCommands[selectedIndex]) {
            return;
          }
          {
            const cmd = filteredCommands[selectedIndex];
            if (!cmd.requiresSelection || hasSelection) {
              onSelect(cmd);
            }
          }
          break;
      }
    },
    [
      filteredCommands,
      selectedIndex,
      totalItems,
      hasSelection,
      onSelect,
      onClose,
    ],
  );

  // Attach keyboard listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, true);
    return () => {
      document.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [handleKeyDown]);

  // Handle command click
  const handleCommandClick = (cmd: SlashCommand, index: number) => {
    if (cmd.requiresSelection && !hasSelection) {
      return; // Don't select disabled commands
    }
    setSelectedIndex(index);
    onSelect(cmd);
  };

  if (filteredCommands.length === 0) {
    return (
      <div
        className={cn(
          'absolute bottom-full left-0 right-0 mb-2 rounded-lg border border-gray-200 bg-white shadow-lg',
          className,
        )}
        style={style}
      >
        <div className='p-3'>
          <p className='text-sm text-gray-500'>No matching commands</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'absolute bottom-full left-0 right-0 mb-2 max-h-[280px] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg',
        className,
      )}
      ref={listRef}
      style={style}
    >
      {filteredCommands.map((cmd, index) => {
        const isDisabled = cmd.requiresSelection && !hasSelection;
        const isSelected = index === selectedIndex;

        return (
          <button
            key={cmd.command}
            onClick={() => handleCommandClick(cmd, index)}
            disabled={isDisabled}
            className={cn(
              'flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors',
              isSelected && !isDisabled && 'bg-gray-50',
              isDisabled ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-50',
            )}
          >
            <div
              className={cn(
                'flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md',
                isDisabled ? 'bg-gray-100' : 'bg-gray-100',
              )}
            >
              <Icon
                variant={cmd.icon}
                width={16}
                height={16}
                className={cn(
                  isDisabled ? 'stroke-gray-300' : 'stroke-gray-600',
                )}
              />
            </div>
            <div className='min-w-0 flex-1'>
              <div className='flex items-center gap-2'>
                <span
                  className={cn(
                    'font-medium',
                    isDisabled ? 'text-gray-400' : 'text-gray-900',
                  )}
                >
                  {cmd.label}
                </span>
                <span
                  className={cn(
                    'rounded px-1.5 py-0.5 font-mono text-[10px]',
                    isDisabled
                      ? 'bg-gray-100 text-gray-300'
                      : 'bg-gray-100 text-gray-600',
                  )}
                >
                  {cmd.command}
                </span>
                {cmd.isCustom && (
                  <span className='rounded bg-purple-100 px-1.5 py-0.5 text-[10px] text-purple-600'>
                    Custom
                  </span>
                )}
                {cmd.requiresSelection && (
                  <span className='rounded bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-500'>
                    Requires selection
                  </span>
                )}
              </div>
              <p
                className={cn(
                  'truncate text-xs',
                  isDisabled ? 'text-gray-300' : 'text-gray-500',
                )}
              >
                {cmd.description}
              </p>
            </div>
            {isSelected && !isDisabled && (
              <div className='flex-shrink-0'>
                <span className='rounded bg-gray-200 px-1.5 py-0.5 text-[10px] text-gray-600'>
                  Enter
                </span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default CommandPicker;

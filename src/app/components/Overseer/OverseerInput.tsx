import NavLogo from '@assets/aucctus_logo.png';
import NavWord from '@assets/aucctus_nav_word.png';
import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import CommandPicker from './CommandPicker';
import { parseSlashCommand, SlashCommand } from './slashCommands';

interface OverseerInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  /** Whether there is selected text available */
  hasSelection?: boolean;
  /** Callback when a slash command is selected */
  onCommandSelect?: (command: SlashCommand) => void;
}

/**
 * Input component for Overseer with keyboard shortcuts
 * Features the "Powered by Aucctus" badge with logo
 * Supports slash commands with autocomplete dropdown
 */
const OverseerInput: React.FC<OverseerInputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = 'Ask a follow-up question...',
  className,
  hasSelection = false,
  onCommandSelect,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [showCommandPicker, setShowCommandPicker] = useState(false);

  // Parse current command to determine active state (match anywhere in text)
  // Don't trim remaining args so spaces are preserved during typing
  const [activeCommand, remainingArgs] = useMemo(
    () =>
      parseSlashCommand(value, { matchPosition: 'any', trimRemaining: false }),
    [value],
  );

  // Determine if we should show command picker
  // Show when user is typing a command (slash followed by non-space chars, no space after yet)
  const commandPickerState = useMemo(() => {
    // Find the last "/" in the value
    const lastSlashIndex = value.lastIndexOf('/');

    if (lastSlashIndex === -1) {
      return { show: false, filter: '', index: -1 };
    }

    // Check if slash is at start or preceded by a space (valid command position)
    if (lastSlashIndex > 0 && value[lastSlashIndex - 1] !== ' ') {
      return { show: false, filter: '', index: -1 };
    }

    // Get text after the slash
    const textAfterSlash = value.slice(lastSlashIndex + 1);

    // If there's a space after the slash, command is complete
    if (textAfterSlash.includes(' ')) {
      return { show: false, filter: '', index: -1 };
    }

    // Show picker with filter (text after slash)
    return { show: true, filter: textAfterSlash, index: lastSlashIndex };
  }, [value]);

  // Update showCommandPicker state
  useEffect(() => {
    setShowCommandPicker(commandPickerState.show);
  }, [commandPickerState.show]);

  // Focus input on mount
  useEffect(() => {
    // Small delay to ensure popup is rendered
    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = () => {
    if (value.trim() && !disabled) {
      onSubmit();
    }
  };

  // Handle command selection from picker
  const handleCommandSelect = useCallback(
    (command: SlashCommand) => {
      setShowCommandPicker(false);

      // Replace the partial command with the full command
      if (commandPickerState.index >= 0) {
        const prefix = value.slice(0, commandPickerState.index);
        const newValue = `${prefix}${command.command} `;
        onChange(newValue);
      } else {
        // Fallback: just set the command
        onChange(command.command + ' ');
      }

      // Notify parent if callback provided
      if (onCommandSelect) {
        onCommandSelect(command);
      }

      // Focus input after selection
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
        }
      }, 0);
    },
    [onChange, onCommandSelect, value, commandPickerState.index],
  );

  // Close command picker
  const handleCommandPickerClose = useCallback(() => {
    setShowCommandPicker(false);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Don't handle Enter/Escape if command picker is open (it handles those)
    if (showCommandPicker) {
      if (
        e.key === 'Enter' ||
        e.key === 'Escape' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown' ||
        e.key === 'Tab'
      ) {
        // Let CommandPicker handle these
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
      return;
    }

    // Handle backspace when in command mode with empty args
    if (activeCommand && e.key === 'Backspace' && remainingArgs.trim() === '') {
      e.preventDefault();
      // Remove the command entirely to go back to normal mode
      onChange(activeCommand.command.slice(0, -1));
    }
  };

  // Input change handler wrapper
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    if (activeCommand) {
      // If we have an active command, the input only contains the message (without command)
      // Reconstruct the full value: command + space + message
      onChange(`${activeCommand.command} ${inputValue}`);
    } else {
      // Standard behavior
      onChange(inputValue);
    }
  };

  const handleCommandsClick = () => {
    // If there's already text, append slash with space, otherwise just slash
    if (value.trim()) {
      onChange(value.trimEnd() + ' /');
    } else {
      onChange('/');
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  return (
    <div className={cn('border-t border-white/10 px-4 py-3', className)}>
      <div className='relative flex items-center'>
        {/* Command picker dropdown - full width to match input */}
        {showCommandPicker && (
          <CommandPicker
            filter={commandPickerState.filter}
            onSelect={handleCommandSelect}
            onClose={handleCommandPickerClose}
            hasSelection={hasSelection}
          />
        )}

        {/* Active command badge - Aucctus brown theme */}
        {activeCommand && (
          <div className='absolute left-1 z-10 flex items-center gap-1.5 rounded-md bg-primary-700 px-2 py-1 shadow-sm ring-1 ring-primary-500/30'>
            <Icon
              variant={activeCommand.icon}
              width={12}
              height={12}
              className='stroke-primary-100'
            />
            <span className='text-xs font-semibold text-primary-100'>
              {activeCommand.label}
            </span>
          </div>
        )}

        <input
          ref={inputRef}
          type='text'
          value={activeCommand ? remainingArgs : value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={
            activeCommand
              ? activeCommand.placeholder || placeholder
              : placeholder
          }
          disabled={disabled}
          className={cn(
            'w-full rounded-lg border bg-white py-2.5 pr-10 text-sm text-gray-900 outline-none transition-all placeholder:text-gray-400 focus:border-gray-400',
            activeCommand
              ? 'border-primary-300 pl-[calc(var(--badge-width,80px)+12px)] focus:border-primary-400'
              : 'border-gray-300 pl-3',
          )}
          style={
            activeCommand
              ? ({
                  '--badge-width': `${activeCommand.label.length * 8 + 32}px`,
                } as React.CSSProperties)
              : undefined
          }
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || disabled}
          className={cn(
            'absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md transition-all',
            value.trim() && !disabled
              ? 'bg-black text-white hover:bg-gray-900'
              : 'bg-white/10 text-gray-light-200',
          )}
          aria-label='Send message'
        >
          <Icon
            variant='arrowup'
            width={12}
            height={12}
            className={
              value.trim() && !disabled
                ? 'stroke-white'
                : 'stroke-gray-light-200'
            }
          />
        </button>
      </div>

      {/* Footer with powered by badge */}
      <div className='mt-2.5 flex items-center justify-between px-0.5'>
        <div className='flex items-center gap-2'>
          <button
            onClick={handleCommandsClick}
            disabled={disabled}
            className='aucctus-text-2xs font-medium text-white/40 transition-colors hover:text-white disabled:opacity-50'
          >
            / Commands
          </button>
        </div>
        <div className='flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1'>
          <span className='text-[9px] font-bold uppercase tracking-wider text-white/30'>
            Powered by
          </span>
          <img src={NavLogo} alt='Aucctus' className='h-3 w-3 opacity-80' />
          <img
            src={NavWord}
            alt='Aucctus'
            className='h-2.5 w-auto opacity-60 brightness-0 invert'
          />
        </div>
      </div>
    </div>
  );
};

export default OverseerInput;

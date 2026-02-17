import { Icon } from '@components';
import { cn } from '@libs/utils/react';
import { IOverseerPendingImage, MentionItem } from '@stores/overseer/types';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import OverseerMentionMenu from './OverseerMentionMenu';

interface OverseerInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  mentions?: MentionItem[];
  onMentionSelect?: (item: MentionItem) => void;
  onMentionRemove?: (id: string) => void;
  pendingImages?: IOverseerPendingImage[];
  onImageAdd?: (file: File) => void;
  onImageRemove?: (id: string) => void;
  maxImages?: number;
  conceptItems?: MentionItem[];
}

/**
 * Input component for Overseer with @mention and image attachment support
 * Matches Lovable OverseerChatModal input area
 */
const OverseerInput: React.FC<OverseerInputProps> = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  placeholder = 'Ask about this selection... (type @ to tag)',
  className,
  mentions = [],
  onMentionSelect,
  onMentionRemove,
  pendingImages = [],
  onImageAdd,
  onImageRemove,
  maxImages = 4,
  conceptItems,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');

  // Detect @mention trigger
  const mentionState = useMemo(() => {
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex === -1) return { active: false, query: '', index: -1 };

    // @ must be at start or preceded by a space
    if (lastAtIndex > 0 && value[lastAtIndex - 1] !== ' ') {
      return { active: false, query: '', index: -1 };
    }

    const textAfterAt = value.slice(lastAtIndex + 1);

    // If there's a space, mention input is done
    if (textAfterAt.includes(' ')) {
      return { active: false, query: '', index: -1 };
    }

    return { active: true, query: textAfterAt, index: lastAtIndex };
  }, [value]);

  useEffect(() => {
    setShowMentionMenu(mentionState.active);
    setMentionQuery(mentionState.query);
  }, [mentionState.active, mentionState.query]);

  // Focus on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 72)}px`;
  }, [value]);

  const handleSubmit = useCallback(() => {
    if ((value.trim() || pendingImages.length > 0) && !disabled) {
      onSubmit();
    }
  }, [value, disabled, onSubmit, pendingImages.length]);

  const handleMentionSelect = useCallback(
    (item: MentionItem) => {
      setShowMentionMenu(false);
      if (mentionState.index >= 0) {
        // Remove the @query text, only show the badge
        const prefix = value.slice(0, mentionState.index).trimEnd();
        onChange(prefix);
      }
      onMentionSelect?.(item);
      setTimeout(() => textareaRef.current?.focus(), 0);
    },
    [mentionState.index, value, onChange, onMentionSelect],
  );

  const handleMentionMenuClose = useCallback(() => {
    setShowMentionMenu(false);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Let mention menu handle these keys
    if (showMentionMenu) {
      if (
        e.key === 'Enter' ||
        e.key === 'Escape' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown'
      ) {
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
      return;
    }
  };

  // Handle paste for clipboard images
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      if (!onImageAdd) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) onImageAdd(file);
          return;
        }
      }
    },
    [onImageAdd],
  );

  // Handle file input change
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!onImageAdd || !e.target.files) return;
      for (const file of e.target.files) {
        if (file.type.startsWith('image/')) {
          onImageAdd(file);
        }
      }
      // Reset input so the same file can be selected again
      e.target.value = '';
    },
    [onImageAdd],
  );

  const canAddImages = pendingImages.length < maxImages;

  return (
    <div className={cn('relative px-4 pt-2', className)}>
      {/* Mention menu (positioned above input) */}
      <OverseerMentionMenu
        query={mentionQuery}
        onSelect={handleMentionSelect}
        onClose={handleMentionMenuClose}
        visible={showMentionMenu}
        concepts={conceptItems}
      />

      {/* Mention badges */}
      {mentions.length > 0 && (
        <div className='mb-1.5 flex flex-wrap gap-1'>
          {mentions.map((m) => (
            <span
              key={m.id}
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium',
                m.type === 'persona'
                  ? 'border border-purple-400/30 bg-purple-500/20 text-purple-300'
                  : 'border border-amber-400/30 bg-amber-500/20 text-amber-300',
              )}
            >
              @{m.name}
              <button
                onClick={() => onMentionRemove?.(m.id)}
                className='transition-colors hover:text-white'
              >
                <Icon
                  variant='closeX'
                  width={10}
                  height={10}
                  className='stroke-current'
                />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Image preview strip */}
      {pendingImages.length > 0 && (
        <div className='mb-1.5 flex gap-1.5'>
          {pendingImages.map((img) => (
            <div key={img.id} className='group relative'>
              <img
                src={img.dataUrl}
                alt={img.file.name}
                className='h-12 w-12 rounded-lg border border-white/10 object-cover'
              />
              <button
                onClick={() => onImageRemove?.(img.id)}
                className='absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-black/70 text-white/70 opacity-0 transition-opacity hover:text-white group-hover:opacity-100'
                aria-label='Remove image'
              >
                <Icon
                  variant='closeX'
                  width={8}
                  height={8}
                  className='stroke-current'
                />
              </button>
            </div>
          ))}
          <span className='self-end text-[10px] text-white/30'>
            {pendingImages.length}/{maxImages}
          </span>
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type='file'
        accept='image/jpeg,image/png,image/gif,image/webp'
        multiple
        className='hidden'
        onChange={handleFileChange}
      />

      {/* Input container — matches Lovable style */}
      <div className='flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.08] px-3 py-1.5'>
        {/* Image attachment button */}
        {onImageAdd && (
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled || !canAddImages}
            className={cn(
              'rounded-lg p-1.5 transition-all',
              canAddImages && !disabled
                ? 'text-white/40 hover:bg-white/10 hover:text-white/60'
                : 'text-white/15',
            )}
            aria-label='Attach image'
          >
            <Icon
              variant='image'
              width={14}
              height={14}
              className='stroke-current'
            />
          </button>
        )}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className='no-focus-ring max-h-[72px] flex-1 resize-none overflow-y-auto bg-transparent text-sm text-white outline-none placeholder:text-white/25 disabled:cursor-not-allowed disabled:opacity-50'
        />
        <button
          onClick={handleSubmit}
          disabled={(!value.trim() && pendingImages.length === 0) || disabled}
          className={cn(
            'rounded-lg p-1.5 transition-all',
            (value.trim() || pendingImages.length > 0) && !disabled
              ? 'bg-white/15 text-white hover:bg-white/20'
              : 'text-white/20',
          )}
          aria-label='Send message'
        >
          <Icon
            variant='paper-airplane'
            width={14}
            height={14}
            className='stroke-current'
          />
        </button>
      </div>
    </div>
  );
};

export default OverseerInput;

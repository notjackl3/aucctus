/**
 * PersonaChatInput - Custom chat input with inline @mention chips
 *
 * Uses a contentEditable div to support rich inline mention chips.
 * Chips are non-editable spans with data attributes for extraction on send.
 */

import type { IMentionSearchResult } from '@libs/api/types/persona';
import type { IOutboundMention } from '@libs/api/types/socketMessages/outbound';
import { cn } from '@libs/utils/react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUp } from 'lucide-react';
import React, {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';

// ============================================
// Types
// ============================================

interface PersonaChatInputProps {
  onSubmit: (text: string, mentions: IOutboundMention[]) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
  showMentionDropdown: boolean;
  onMentionQueryChange: (query: string | null) => void;
  mentionResults: IMentionSearchResult[];
  isMentionSearching: boolean;
}

export interface PersonaChatInputHandle {
  focus: () => void;
}

// ============================================
// Mention Chip Helpers
// ============================================

const MENTION_CHIP_ATTR = 'data-mention-chip';
const MENTION_UUID_ATTR = 'data-uuid';
const MENTION_TYPE_ATTR = 'data-type';
const MENTION_NAME_ATTR = 'data-name';

function createMentionChipElement(
  result: IMentionSearchResult,
): HTMLSpanElement {
  const chip = document.createElement('span');
  chip.setAttribute(MENTION_CHIP_ATTR, 'true');
  chip.setAttribute(MENTION_UUID_ATTR, result.uuid);
  chip.setAttribute(MENTION_TYPE_ATTR, result.type);
  chip.setAttribute(MENTION_NAME_ATTR, result.name);
  chip.contentEditable = 'false';
  chip.className = cn(
    'inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 mx-0.5 align-baseline',
    'aucctus-text-xs-medium cursor-default select-none',
    result.type === 'concept'
      ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
      : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  );
  chip.textContent = `@${result.name}`;
  return chip;
}

function extractContent(container: HTMLDivElement): {
  text: string;
  mentions: IOutboundMention[];
} {
  const mentions: IOutboundMention[] = [];
  let text = '';

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent ?? '';
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (el.getAttribute(MENTION_CHIP_ATTR) === 'true') {
        const name = el.getAttribute(MENTION_NAME_ATTR) ?? '';
        const uuid = el.getAttribute(MENTION_UUID_ATTR) ?? '';
        const type = el.getAttribute(MENTION_TYPE_ATTR) as
          | 'concept'
          | 'persona';
        // Use quoted format for names with spaces
        text += name.includes(' ') ? `@"${name}"` : `@${name}`;
        mentions.push({ uuid, type, name });
      } else if (el.tagName === 'BR') {
        text += '\n';
      } else if (el.tagName === 'DIV' && el !== container) {
        // Divs created by contentEditable on Enter represent new lines
        if (text.length > 0 && !text.endsWith('\n')) {
          text += '\n';
        }
        el.childNodes.forEach(walk);
      } else {
        el.childNodes.forEach(walk);
      }
    }
  };

  container.childNodes.forEach(walk);
  return { text: text.trim(), mentions };
}

// ============================================
// Mention Dropdown (Enhanced)
// ============================================

interface MentionDropdownProps {
  results: IMentionSearchResult[];
  isSearching: boolean;
  onSelect: (result: IMentionSearchResult) => void;
  onClose: () => void;
  selectedIndex: number;
}

const MentionDropdown: React.FC<MentionDropdownProps> = ({
  results,
  isSearching,
  onSelect,
  selectedIndex,
}) => {
  const listRef = useRef<HTMLDivElement>(null);

  // Group results by type
  const concepts = results.filter((r) => r.type === 'concept');
  const personas = results.filter((r) => r.type === 'persona');
  const flatResults = [...concepts, ...personas];

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current && selectedIndex >= 0) {
      const items = listRef.current.querySelectorAll('[data-mention-item]');
      items[selectedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedIndex]);

  if (flatResults.length === 0 && !isSearching) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 5 }}
        className='aucctus-border-primary aucctus-bg-primary absolute bottom-full left-0 z-50 mb-2 w-72 overflow-hidden rounded-lg border shadow-lg'
      >
        <div className='aucctus-text-xs aucctus-text-tertiary px-3 py-3 text-center'>
          No results found
        </div>
      </motion.div>
    );
  }

  let itemIndex = 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      ref={listRef}
      className='aucctus-border-primary aucctus-bg-primary absolute bottom-full left-0 z-50 mb-2 max-h-64 w-72 overflow-y-auto rounded-lg border shadow-lg'
    >
      {isSearching && flatResults.length === 0 && (
        <div className='aucctus-text-xs aucctus-text-tertiary flex items-center gap-2 px-3 py-2'>
          <span className='inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent' />
          Searching...
        </div>
      )}

      {concepts.length > 0 && (
        <>
          <div className='aucctus-text-xs-medium aucctus-text-tertiary border-b border-blue-200/30 px-3 py-1.5 dark:border-blue-800/30'>
            Concepts
          </div>
          {concepts.map((result) => {
            const idx = itemIndex++;
            return (
              <motion.button
                key={result.uuid}
                data-mention-item
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: idx * 0.03 }}
                type='button'
                onClick={() => onSelect(result)}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-left transition-colors',
                  idx === selectedIndex
                    ? 'aucctus-bg-secondary'
                    : 'hover:aucctus-bg-secondary',
                )}
              >
                <div className='aucctus-bg-secondary aucctus-text-xs-bold aucctus-text-secondary flex h-6 w-6 shrink-0 items-center justify-center rounded-full'>
                  {result.name.charAt(0)}
                </div>
                <div className='min-w-0 flex-1'>
                  <p className='aucctus-text-sm aucctus-text-primary truncate'>
                    {result.name}
                  </p>
                  {result.subtitle && (
                    <p className='aucctus-text-xs aucctus-text-tertiary truncate'>
                      {result.subtitle}
                    </p>
                  )}
                </div>
                <span className='aucctus-text-xs-medium ml-auto shrink-0 rounded bg-blue-100 px-1.5 py-0.5 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'>
                  concept
                </span>
              </motion.button>
            );
          })}
        </>
      )}

      {personas.length > 0 && (
        <>
          <div className='aucctus-text-xs-medium aucctus-text-tertiary border-b border-purple-200/30 px-3 py-1.5 dark:border-purple-800/30'>
            Personas
          </div>
          {personas.map((result) => {
            const idx = itemIndex++;
            return (
              <motion.button
                key={result.uuid}
                data-mention-item
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.15, delay: idx * 0.03 }}
                type='button'
                onClick={() => onSelect(result)}
                className={cn(
                  'flex w-full items-center gap-2 px-3 py-2 text-left transition-colors',
                  idx === selectedIndex
                    ? 'aucctus-bg-secondary'
                    : 'hover:aucctus-bg-secondary',
                )}
              >
                {result.avatar ? (
                  <img
                    src={result.avatar}
                    alt=''
                    className='h-6 w-6 shrink-0 rounded-full object-cover'
                  />
                ) : (
                  <div className='aucctus-bg-secondary aucctus-text-xs-bold aucctus-text-secondary flex h-6 w-6 shrink-0 items-center justify-center rounded-full'>
                    {result.name.charAt(0)}
                  </div>
                )}
                <div className='min-w-0 flex-1'>
                  <p className='aucctus-text-sm aucctus-text-primary truncate'>
                    {result.name}
                  </p>
                  {result.subtitle && (
                    <p className='aucctus-text-xs aucctus-text-tertiary truncate'>
                      {result.subtitle}
                    </p>
                  )}
                </div>
                <span className='aucctus-text-xs-medium ml-auto shrink-0 rounded bg-purple-100 px-1.5 py-0.5 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'>
                  persona
                </span>
              </motion.button>
            );
          })}
        </>
      )}
    </motion.div>
  );
};

// ============================================
// PersonaChatInput Component
// ============================================

const PersonaChatInput = React.forwardRef<
  PersonaChatInputHandle,
  PersonaChatInputProps
>(
  (
    {
      onSubmit,
      disabled = false,
      placeholder = 'Type a message...',
      className,
      showMentionDropdown,
      onMentionQueryChange,
      mentionResults,
      isMentionSearching,
    },
    ref,
  ) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isEmpty, setIsEmpty] = useState(true);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const mentionTriggerPosRef = useRef<number | null>(null);

    useImperativeHandle(ref, () => ({
      focus: () => editorRef.current?.focus(),
    }));

    // Reset selected index when results change
    useEffect(() => {
      setSelectedIndex(0);
    }, [mentionResults]);

    const checkEmpty = useCallback(() => {
      if (!editorRef.current) return;
      const text = editorRef.current.textContent ?? '';
      setIsEmpty(text.trim().length === 0);
    }, []);

    const handleSubmit = useCallback(() => {
      if (!editorRef.current || disabled) return;
      const { text, mentions } = extractContent(editorRef.current);
      if (!text.trim()) return;

      onSubmit(text, mentions);

      // Clear editor
      editorRef.current.innerHTML = '';
      setIsEmpty(true);
      onMentionQueryChange(null);
      mentionTriggerPosRef.current = null;
    }, [disabled, onSubmit, onMentionQueryChange]);

    const detectMentionQuery = useCallback(() => {
      if (!editorRef.current) return;

      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;

      const range = sel.getRangeAt(0);
      // Only detect in text nodes
      if (range.startContainer.nodeType !== Node.TEXT_NODE) {
        onMentionQueryChange(null);
        mentionTriggerPosRef.current = null;
        return;
      }

      const textNode = range.startContainer as Text;
      const textBefore =
        textNode.textContent?.slice(0, range.startOffset) ?? '';
      const atIndex = textBefore.lastIndexOf('@');

      if (atIndex === -1) {
        onMentionQueryChange(null);
        mentionTriggerPosRef.current = null;
        return;
      }

      // Check that @ is at start or preceded by whitespace
      const charBefore = atIndex > 0 ? textBefore[atIndex - 1] : ' ';
      if (!/\s/.test(charBefore) && atIndex !== 0) {
        onMentionQueryChange(null);
        mentionTriggerPosRef.current = null;
        return;
      }

      const query = textBefore.slice(atIndex + 1);
      mentionTriggerPosRef.current = atIndex;
      onMentionQueryChange(query);
    }, [onMentionQueryChange]);

    const handleInput = useCallback(() => {
      checkEmpty();
      detectMentionQuery();
    }, [checkEmpty, detectMentionQuery]);

    const insertMention = useCallback(
      (result: IMentionSearchResult) => {
        if (!editorRef.current) return;

        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;

        const range = sel.getRangeAt(0);
        if (
          range.startContainer.nodeType !== Node.TEXT_NODE ||
          mentionTriggerPosRef.current === null
        ) {
          return;
        }

        const textNode = range.startContainer as Text;
        const offset = range.startOffset;
        const atPos = mentionTriggerPosRef.current;

        // Delete the @query text
        const before = textNode.textContent?.slice(0, atPos) ?? '';
        const after = textNode.textContent?.slice(offset) ?? '';
        textNode.textContent = before;

        // Create chip and trailing space
        const chip = createMentionChipElement(result);
        const afterNode = document.createTextNode(
          after ? ` ${after}` : '\u00A0',
        );

        // Insert chip and after text
        const parent = textNode.parentNode;
        if (parent) {
          parent.insertBefore(afterNode, textNode.nextSibling);
          parent.insertBefore(chip, afterNode);
        }

        // Move cursor after the space
        const newRange = document.createRange();
        newRange.setStart(afterNode, 1);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);

        // Clean up
        onMentionQueryChange(null);
        mentionTriggerPosRef.current = null;
        checkEmpty();
      },
      [onMentionQueryChange, checkEmpty],
    );

    const handleMentionSelect = useCallback(
      (result: IMentionSearchResult) => {
        insertMention(result);
        editorRef.current?.focus();
      },
      [insertMention],
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (showMentionDropdown) {
          const concepts = mentionResults.filter((r) => r.type === 'concept');
          const personas = mentionResults.filter((r) => r.type === 'persona');
          const flatResults = [...concepts, ...personas];

          if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) =>
              prev < flatResults.length - 1 ? prev + 1 : 0,
            );
            return;
          }
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) =>
              prev > 0 ? prev - 1 : flatResults.length - 1,
            );
            return;
          }
          if (e.key === 'Enter' && flatResults.length > 0) {
            e.preventDefault();
            handleMentionSelect(flatResults[selectedIndex]);
            return;
          }
          if (e.key === 'Escape') {
            e.preventDefault();
            onMentionQueryChange(null);
            mentionTriggerPosRef.current = null;
            return;
          }
        }

        // Submit on Enter (without Shift)
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          handleSubmit();
        }
      },
      [
        showMentionDropdown,
        mentionResults,
        selectedIndex,
        handleMentionSelect,
        handleSubmit,
        onMentionQueryChange,
      ],
    );

    // Handle paste: strip formatting but keep plain text
    const handlePaste = useCallback(
      (e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData('text/plain');
        document.execCommand('insertText', false, text);
      },
      [],
    );

    return (
      <div className={cn('relative', className)}>
        {/* Mention dropdown */}
        <AnimatePresence>
          {showMentionDropdown && (
            <MentionDropdown
              results={mentionResults}
              isSearching={isMentionSearching}
              onSelect={handleMentionSelect}
              onClose={() => {
                onMentionQueryChange(null);
                mentionTriggerPosRef.current = null;
              }}
              selectedIndex={selectedIndex}
            />
          )}
        </AnimatePresence>

        {/* Editor container */}
        <div className='aucctus-border-primary aucctus-bg-primary relative flex items-end rounded-lg border'>
          {/* contentEditable input */}
          <div
            ref={editorRef}
            role='textbox'
            aria-label={placeholder}
            contentEditable={!disabled}
            suppressContentEditableWarning
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            className={cn(
              'aucctus-text-primary aucctus-text-sm max-h-[100px] min-h-[48px] flex-1 overflow-y-auto whitespace-pre-wrap break-words px-4 py-3 pr-12 outline-none',
              disabled && 'cursor-not-allowed opacity-50',
              'empty:before:aucctus-text-tertiary empty:before:pointer-events-none empty:before:content-[attr(data-placeholder)]',
            )}
            data-placeholder={placeholder}
          />

          {/* Send button */}
          <button
            type='button'
            onClick={handleSubmit}
            disabled={disabled || isEmpty}
            className={cn(
              'absolute bottom-2 right-2 flex h-8 w-8 items-center justify-center rounded-lg transition-all duration-200',
              disabled || isEmpty
                ? 'cursor-not-allowed opacity-30'
                : 'aucctus-bg-brand-solid hover:opacity-90',
            )}
            aria-label='Send message'
          >
            <ArrowUp
              size={16}
              className={
                disabled || isEmpty ? 'aucctus-stroke-on-brand' : 'text-white'
              }
            />
          </button>
        </div>
      </div>
    );
  },
);

PersonaChatInput.displayName = 'PersonaChatInput';

export default PersonaChatInput;

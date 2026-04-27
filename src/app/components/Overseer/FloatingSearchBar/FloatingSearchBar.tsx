import { hexToHslValues } from '@libs/utils/color';
import { cn } from '@libs/utils/react';
import { IOverseerPendingImage, MentionItem } from '@stores/overseer/types';
import {
  MentionMenu,
  buildMentionSections,
  useMentionDetection,
} from '@components/shared/MentionMenu';
import { AnimatePresence, motion } from 'framer-motion';
import { History, Search, X } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './floating-search-bar.scss';

const MAX_IMAGES = 4;

interface FloatingSearchBarProps {
  visible: boolean;
  onSubmit: (
    message: string,
    images: IOverseerPendingImage[],
    mentions: MentionItem[],
  ) => void;
  onHistoryClick?: () => void;
  leftOffset?: number;
  rightOffset?: number;
  conceptItems?: MentionItem[];
  personaItems?: MentionItem[];
  /**
   * JTBD jobs currently visible on the active canvas view. Populated only on
   * JTBD pages; omit on other routes.
   */
  jtbdJobItems?: MentionItem[];
  /**
   * Widgets attached to the currently-selected (expanded) JTBD job. Omitted
   * when no job is selected or outside JTBD pages.
   */
  jtbdWidgetItems?: MentionItem[];
  brandColors?: string[];
}

const FloatingSearchBar = ({
  visible,
  onSubmit,
  onHistoryClick,
  leftOffset = 96,
  rightOffset = 0,
  conceptItems,
  personaItems,
  jtbdJobItems,
  jtbdWidgetItems,
  brandColors,
}: FloatingSearchBarProps) => {
  const [query, setQuery] = useState('');
  const [localImages, setLocalImages] = useState<IOverseerPendingImage[]>([]);
  const [mentions, setMentions] = useState<MentionItem[]>([]);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Cmd+K / Ctrl+K to focus
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Detect @mention trigger
  const mentionState = useMentionDetection(query);

  useEffect(() => {
    setShowMentionMenu(mentionState.active);
  }, [mentionState.active]);

  const mentionSections = useMemo(
    () =>
      buildMentionSections(
        personaItems,
        conceptItems,
        jtbdJobItems,
        jtbdWidgetItems,
      ),
    [personaItems, conceptItems, jtbdJobItems, jtbdWidgetItems],
  );

  const addImageFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith('image/')) return;
      if (localImages.length >= MAX_IMAGES) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setLocalImages((prev) => {
          if (prev.length >= MAX_IMAGES) return prev;
          return [...prev, { id: crypto.randomUUID(), file, dataUrl }];
        });
      };
      reader.readAsDataURL(file);
    },
    [localImages.length],
  );

  const removeImage = useCallback((id: string) => {
    setLocalImages((prev) => prev.filter((img) => img.id !== id));
  }, []);

  const handleMentionSelect = useCallback(
    (item: MentionItem) => {
      setShowMentionMenu(false);
      if (mentionState.index >= 0) {
        const prefix = query.slice(0, mentionState.index).trimEnd();
        setQuery(prefix);
      }
      setMentions((prev) => {
        if (prev.some((m) => m.id === item.id)) return prev;
        return [...prev, item];
      });
      setTimeout(() => inputRef.current?.focus(), 0);
    },
    [mentionState.index, query],
  );

  const removeMention = useCallback((id: string) => {
    setMentions((prev) => prev.filter((m) => m.id !== id));
  }, []);

  const handleSubmit = useCallback(() => {
    if (query.trim() || localImages.length > 0) {
      onSubmit(query.trim(), localImages, mentions);
      setQuery('');
      setLocalImages([]);
      setMentions([]);
    }
  }, [query, localImages, mentions, onSubmit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      // Let mention menu handle navigation keys
      if (showMentionMenu) {
        if (['Enter', 'Escape', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
          return;
        }
      }

      if (e.key === 'Escape') {
        setQuery('');
        inputRef.current?.blur();
      }
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [showMentionMenu, handleSubmit],
  );

  // Paste handler for clipboard images
  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          if (file) addImageFile(file);
          return;
        }
      }
    },
    [addImageFile],
  );

  // Drag & drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const files = e.dataTransfer?.files;
      if (!files) return;
      for (const file of files) {
        addImageFile(file);
      }
    },
    [addImageFile],
  );

  const handleMentionMenuClose = useCallback(() => {
    setShowMentionMenu(false);
  }, []);

  const orbStyles = useMemo(() => {
    if (!brandColors || brandColors.length === 0) return undefined;
    return {
      '--orb-hsl-1': hexToHslValues(brandColors[0 % brandColors.length]),
      '--orb-hsl-2': hexToHslValues(brandColors[1 % brandColors.length]),
      '--orb-hsl-3': hexToHslValues(brandColors[2 % brandColors.length]),
      '--orb-hsl-4': hexToHslValues(brandColors[3 % brandColors.length]),
    } as React.CSSProperties;
  }, [brandColors]);

  const hasMentionsOrImages = mentions.length > 0 || localImages.length > 0;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className='pointer-events-none fixed bottom-10 z-50'
          style={{
            left: leftOffset,
            right: rightOffset,
          }}
        >
          <div className='flex justify-center px-4'>
            <div className='pointer-events-auto relative w-[480px] max-w-full'>
              {/* Mention menu — rendered OUTSIDE the shell to avoid overflow:hidden clipping */}
              <MentionMenu
                query={mentionState.query}
                onSelect={handleMentionSelect}
                onClose={handleMentionMenuClose}
                visible={showMentionMenu}
                sections={mentionSections}
                className='no-scrollbar absolute bottom-full left-0 right-0 z-50 mb-1 max-h-[160px] overflow-y-auto rounded-2xl border border-gray-200/60 bg-white/80 shadow-lg backdrop-blur-xl'
                activeItemClassName='text-gray-900'
                inactiveItemClassName='text-gray-500 hover:text-gray-700'
                sectionLabelClassName='flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-gray-400'
                sectionDividerClassName='border-t border-gray-200/60'
                avatarFallbackClassName='flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/15 text-[9px] font-bold text-purple-600'
                segmentClassName='max-w-[100px] shrink-0 truncate text-[9px] text-gray-400'
              />

              <div
                className={cn('floating-search-shell', {
                  'floating-search-shell--dragover': isDragging,
                })}
                style={orbStyles}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                {/* Glass rim */}
                <div className='floating-search-rim' aria-hidden='true' />

                {/* Corner orbs */}
                <div className='floating-search-orb floating-search-orb-1' />
                <div className='floating-search-orb floating-search-orb-2' />
                <div className='floating-search-orb floating-search-orb-3' />
                <div className='floating-search-orb floating-search-orb-4' />

                {/* Frosted glass surface */}
                <div className='floating-search-surface floating-search-surface--light'>
                  {/* Mention badges + image thumbnails */}
                  {hasMentionsOrImages && (
                    <div className='px-4 pt-2'>
                      {/* Mention badges */}
                      {mentions.length > 0 && (
                        <div className='mb-1.5 flex flex-wrap gap-1'>
                          {mentions.map((m) => (
                            <span
                              key={m.id}
                              className={cn(
                                'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium',
                                m.type === 'persona' &&
                                  'border-purple-400/30 bg-purple-500/10 text-purple-700',
                                m.type === 'jtbd_job' &&
                                  'border-sky-400/30 bg-sky-500/10 text-sky-700',
                                m.type === 'jtbd_widget' &&
                                  'border-emerald-400/30 bg-emerald-500/10 text-emerald-700',
                                m.type === 'concept' &&
                                  'border-amber-400/30 bg-amber-500/10 text-amber-700',
                              )}
                            >
                              @{m.name}
                              <button
                                onClick={() => removeMention(m.id)}
                                className='transition-colors hover:text-gray-900'
                              >
                                <X size={10} className='stroke-current' />
                              </button>
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Image thumbnails */}
                      {localImages.length > 0 && (
                        <div className='mb-1.5 flex gap-1.5'>
                          {localImages.map((img) => (
                            <div key={img.id} className='group relative'>
                              <img
                                src={img.dataUrl}
                                alt={img.file.name}
                                className='h-8 w-8 rounded border border-gray-200 object-cover'
                              />
                              <button
                                onClick={() => removeImage(img.id)}
                                className='absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gray-700 text-white opacity-0 transition-opacity group-hover:opacity-100'
                                aria-label='Remove image'
                              >
                                <X size={7} className='stroke-current' />
                              </button>
                            </div>
                          ))}
                          <span className='self-end text-[10px] text-gray-400'>
                            {localImages.length}/{MAX_IMAGES}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Input row */}
                  <div className='relative z-10 flex items-center gap-2 px-4 py-2.5'>
                    <Search className='h-4 w-4 shrink-0 text-gray-500' />
                    <input
                      ref={inputRef}
                      type='text'
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onPaste={handlePaste}
                      placeholder='Search across projects, ideas, and insights...'
                      className='h-8 min-w-0 flex-1 border-0 bg-transparent text-sm text-gray-900 shadow-none outline-none ring-0 placeholder:text-gray-400 focus:ring-0 focus-visible:ring-0 focus-visible:ring-offset-0'
                    />
                    {query && (
                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => setQuery('')}
                        className='shrink-0 rounded-md p-1 transition-colors hover:bg-gray-100'
                      >
                        <X className='h-3.5 w-3.5 text-gray-400' />
                      </button>
                    )}
                    {onHistoryClick && (
                      <button
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={onHistoryClick}
                        className='shrink-0 rounded-md p-1 transition-colors hover:bg-gray-100'
                        title='Chat history'
                      >
                        <History className='h-4 w-4 text-gray-400 hover:text-gray-600' />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FloatingSearchBar;

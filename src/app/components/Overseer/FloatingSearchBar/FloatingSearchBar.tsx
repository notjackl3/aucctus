import { cn } from '@libs/utils/react';
import { IOverseerPendingImage, MentionItem } from '@stores/overseer/types';
import { AnimatePresence, motion } from 'framer-motion';
import { History, Lightbulb, Search, Users, X } from 'lucide-react';
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
}

const FloatingSearchBar = ({
  visible,
  onSubmit,
  onHistoryClick,
  leftOffset = 96,
  rightOffset = 0,
  conceptItems,
  personaItems,
}: FloatingSearchBarProps) => {
  const [query, setQuery] = useState('');
  const [localImages, setLocalImages] = useState<IOverseerPendingImage[]>([]);
  const [mentions, setMentions] = useState<MentionItem[]>([]);
  const [showMentionMenu, setShowMentionMenu] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [activeMenuIndex, setActiveMenuIndex] = useState(0);
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
  const mentionState = useMemo(() => {
    const lastAtIndex = query.lastIndexOf('@');
    if (lastAtIndex === -1) return { active: false, query: '', index: -1 };

    if (lastAtIndex > 0 && query[lastAtIndex - 1] !== ' ') {
      return { active: false, query: '', index: -1 };
    }

    const textAfterAt = query.slice(lastAtIndex + 1);
    if (textAfterAt.includes(' ')) {
      return { active: false, query: '', index: -1 };
    }

    return { active: true, query: textAfterAt, index: lastAtIndex };
  }, [query]);

  useEffect(() => {
    setShowMentionMenu(mentionState.active);
    setMentionQuery(mentionState.query);
  }, [mentionState.active, mentionState.query]);

  const filteredPersonas = useMemo(() => {
    if (!personaItems) return [];
    const q = mentionQuery.toLowerCase();
    return personaItems.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.segment?.toLowerCase().includes(q),
    );
  }, [mentionQuery, personaItems]);

  const filteredConcepts = useMemo(() => {
    if (!conceptItems) return [];
    const q = mentionQuery.toLowerCase();
    return conceptItems.filter((c) => c.name.toLowerCase().includes(q));
  }, [mentionQuery, conceptItems]);

  const allItems = useMemo(
    () => [...filteredPersonas, ...filteredConcepts],
    [filteredPersonas, filteredConcepts],
  );

  // Reset active index when query changes
  useEffect(() => {
    setActiveMenuIndex(0);
  }, [mentionQuery]);

  // Keyboard navigation for mention menu
  useEffect(() => {
    if (!showMentionMenu) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveMenuIndex((i) => Math.min(i + 1, allItems.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveMenuIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === 'Enter' && allItems.length > 0) {
        e.preventDefault();
        handleMentionSelect(allItems[activeMenuIndex]);
      } else if (e.key === 'Escape') {
        setShowMentionMenu(false);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [showMentionMenu, activeMenuIndex, allItems]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const hasMentionsOrImages = mentions.length > 0 || localImages.length > 0;
  const personaCount = filteredPersonas.length;

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
              {showMentionMenu && allItems.length > 0 && (
                <div className='no-scrollbar absolute bottom-full left-0 right-0 z-50 mb-1 max-h-[160px] overflow-y-auto rounded-2xl border border-gray-200/60 bg-white/80 shadow-lg backdrop-blur-xl'>
                  {/* Living Personas section */}
                  {filteredPersonas.length > 0 && (
                    <>
                      <div className='flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-gray-400'>
                        <Users className='h-3 w-3' />
                        Living Personas
                      </div>
                      {filteredPersonas.map((item, i) => (
                        <button
                          key={item.id}
                          onClick={() => handleMentionSelect(item)}
                          className={cn(
                            'flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] transition-colors',
                            i === activeMenuIndex
                              ? 'text-gray-900'
                              : 'text-gray-500 hover:text-gray-700',
                          )}
                        >
                          {item.avatar ? (
                            <img
                              src={item.avatar}
                              alt={item.name}
                              className='h-5 w-5 shrink-0 rounded-full object-cover'
                            />
                          ) : (
                            <span className='flex h-5 w-5 items-center justify-center rounded-full bg-purple-500/15 text-[9px] font-bold text-purple-600'>
                              {item.name.charAt(0)}
                            </span>
                          )}
                          <span className='flex-1 truncate'>{item.name}</span>
                          {item.segment && (
                            <span className='max-w-[100px] shrink-0 truncate text-[9px] text-gray-400'>
                              {item.segment}
                            </span>
                          )}
                        </button>
                      ))}
                    </>
                  )}

                  {/* Concept Bank section */}
                  {filteredConcepts.length > 0 && (
                    <>
                      <div
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-gray-400',
                          filteredPersonas.length > 0 &&
                            'border-t border-gray-200/60',
                        )}
                      >
                        <Lightbulb className='h-3 w-3' />
                        Concept Bank
                      </div>
                      {filteredConcepts.map((item, i) => (
                        <button
                          key={item.id}
                          onClick={() => handleMentionSelect(item)}
                          className={cn(
                            'flex w-full items-center gap-2 px-3 py-1.5 text-left text-[12px] transition-colors',
                            i + personaCount === activeMenuIndex
                              ? 'text-gray-900'
                              : 'text-gray-500 hover:text-gray-700',
                          )}
                        >
                          <span className='flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/15'>
                            <Lightbulb className='h-3 w-3 stroke-amber-600' />
                          </span>
                          <span className='flex-1 truncate'>{item.name}</span>
                        </button>
                      ))}
                    </>
                  )}
                </div>
              )}

              <div
                className={cn('floating-search-shell', {
                  'floating-search-shell--dragover': isDragging,
                })}
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
                                m.type === 'persona'
                                  ? 'border-purple-400/30 bg-purple-500/10 text-purple-700'
                                  : 'border-amber-400/30 bg-amber-500/10 text-amber-700',
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

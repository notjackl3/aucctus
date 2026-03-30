import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from '@components';
import { cn } from '@libs/utils/react';
import { getAnimationStyle } from '@components/Card/ConceptGeneration/UserExploration/components/util/animation-keyframes';
import { File, Send, Upload, Users, X } from 'lucide-react';
import {
  MentionMenu,
  buildMentionSections,
} from '@components/shared/MentionMenu';
import type { MentionItem } from '@stores/overseer/types';

/** Maximum file size per file: 50MB (matches backend MAX_FILE_SIZE) */
const MAX_FILE_SIZE = 50 * 1024 * 1024;

/** Maximum aggregate size for all files: 100MB */
const MAX_AGGREGATE_SIZE = 100 * 1024 * 1024;

/** Maximum number of files per seed */
const MAX_FILES = 3;

/** Supported file extensions for Gemini API */
const SUPPORTED_EXTENSIONS = [
  'pdf',
  'docx',
  'txt',
  'html',
  'xlsx',
  'csv',
  'pptx',
  'png',
  'jpg',
  'jpeg',
  'webp',
  'gif',
  'mp3',
  'wav',
  'mp4',
  'mov',
];

interface LandingViewProps {
  inputValue: string;
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSubmit?: () => void;
  onFilesChange?: (files: File[]) => void;
  selectedFiles?: File[];
  style?: any;
  personaItems?: MentionItem[];
  selectedPersonas?: MentionItem[];
  onPersonaSelect?: (item: MentionItem) => void;
  onPersonaRemove?: (id: string) => void;
}

const LandingView: React.FC<LandingViewProps> = ({
  inputValue,
  onInputChange,
  onKeyDown,
  onSubmit,
  onFilesChange,
  selectedFiles = [],
  style,
  personaItems = [],
  selectedPersonas = [],
  onPersonaSelect,
  onPersonaRemove,
}) => {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const personaMenuRef = useRef<HTMLDivElement>(null);
  const personaButtonRef = useRef<HTMLButtonElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [showPersonaMenu, setShowPersonaMenu] = useState(false);
  const [personaQuery, setPersonaQuery] = useState('');

  // Close persona menu on click outside
  useEffect(() => {
    if (!showPersonaMenu) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        personaMenuRef.current?.contains(target) ||
        personaButtonRef.current?.contains(target)
      )
        return;
      setShowPersonaMenu(false);
      setPersonaQuery('');
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPersonaMenu]);

  // Build persona-only sections for the menu (filter out already-selected)
  const selectedIds = React.useMemo(
    () => new Set(selectedPersonas.map((p) => p.id)),
    [selectedPersonas],
  );
  const sections = React.useMemo(
    () =>
      buildMentionSections(
        personaItems.filter((p) => !selectedIds.has(p.id)),
        [],
      ),
    [personaItems, selectedIds],
  );

  const handlePersonaSelect = useCallback(
    (item: MentionItem) => {
      setShowPersonaMenu(false);
      setPersonaQuery('');
      onPersonaSelect?.(item);
      setTimeout(() => textareaRef.current?.focus(), 0);
    },
    [onPersonaSelect],
  );

  const handlePersonaMenuClose = useCallback(() => {
    setShowPersonaMenu(false);
    setPersonaQuery('');
  }, []);

  const togglePersonaMenu = useCallback(() => {
    if (selectedPersonas.length >= 4) return;
    setShowPersonaMenu((prev) => !prev);
    setPersonaQuery('');
  }, [selectedPersonas.length]);

  const validateFile = (file: File): boolean => {
    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error(
        `File "${file.name}" (${(file.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum allowed size (50MB).`,
      );
      return false;
    }

    // Check file extension
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !SUPPORTED_EXTENSIONS.includes(extension)) {
      toast.error(
        `File type not supported. Supported types: ${SUPPORTED_EXTENSIONS.join(', ')}`,
      );
      return false;
    }

    return true;
  };

  const addFiles = (newFiles: File[]) => {
    const combined = [...selectedFiles];

    for (const file of newFiles) {
      // Check max file count
      if (combined.length >= MAX_FILES) {
        toast.error(`Maximum ${MAX_FILES} files allowed.`);
        break;
      }

      // Skip duplicates by name
      if (combined.some((f) => f.name === file.name && f.size === file.size)) {
        continue;
      }

      // Validate individual file
      if (!validateFile(file)) {
        continue;
      }

      // Check aggregate size
      const aggregateSize =
        combined.reduce((sum, f) => sum + f.size, 0) + file.size;
      if (aggregateSize > MAX_AGGREGATE_SIZE) {
        toast.error(
          `Total file size exceeds 100MB limit. Remove a file before adding more.`,
        );
        break;
      }

      combined.push(file);
    }

    onFilesChange?.(combined);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      addFiles(Array.from(files));
    }
    // Reset input so the same file can be selected again
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      addFiles(Array.from(files));
    }
  };

  const handleRemoveFile = (index: number) => {
    onFilesChange?.(selectedFiles.filter((_, i) => i !== index));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Let persona menu handle navigation keys when open
    if (showPersonaMenu) {
      if (
        e.key === 'Enter' ||
        e.key === 'Escape' ||
        e.key === 'ArrowUp' ||
        e.key === 'ArrowDown'
      ) {
        return;
      }
    }

    // Enter submits (without shift), Shift+Enter creates newline
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit?.();
    }
    onKeyDown?.(e);
  };

  return (
    <motion.div
      style={style}
      className='pointer-events-none absolute inset-0 z-20 flex items-center justify-center'
    >
      <div className='relative'>
        <div className='relative z-20 space-y-6 px-6 text-center sm:px-8'>
          <div
            className='space-y-4'
            style={getAnimationStyle('fadeIn', 800, 300)}
          >
            <h1 className='aucctus-header-2xl-bold aucctus-text-white'>
              Idea Playground
            </h1>
            <p className='aucctus-text-xl aucctus-text-white opacity-80'>
              Where curiosity becomes innovation
            </p>
          </div>

          <div
            className='pointer-events-auto mx-auto w-full max-w-lg'
            style={getAnimationStyle('fadeIn', 800, 600)}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className='relative'>
              {/* Persona menu (positioned above the card) */}
              <div ref={personaMenuRef}>
                <MentionMenu
                  query={personaQuery}
                  onSelect={handlePersonaSelect}
                  onClose={handlePersonaMenuClose}
                  visible={showPersonaMenu}
                  sections={sections}
                  className='absolute bottom-full left-0 right-0 z-50 mb-1 max-h-[160px] overflow-y-auto rounded-xl border border-white/15 bg-black/90 shadow-2xl backdrop-blur-xl'
                />
              </div>

              {/* Card container */}
              <div
                className={cn(
                  'shadow-glass rounded-xl border border-white/20 bg-white/10 backdrop-blur-md transition-all duration-300 focus-within:border-white/30',
                  { 'ring-2 ring-white/40': isDragging },
                )}
              >
                {/* Input area */}
                <div className='relative'>
                  <textarea
                    ref={textareaRef}
                    value={inputValue}
                    onChange={onInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder='Describe a problem, idea or focus area on your mind'
                    rows={1}
                    className='no-focus-ring w-full resize-none overflow-y-auto border-0 bg-transparent px-5 py-6 text-base text-white shadow-none [-ms-overflow-style:none] [scrollbar-width:none] placeholder:text-white/60 focus:border-0 focus:outline-none focus:ring-0 [&::-webkit-scrollbar]:hidden'
                    style={{ maxHeight: '7.5rem' }}
                    onInput={(e) => {
                      const target = e.target as HTMLTextAreaElement;
                      target.style.height = 'auto';
                      target.style.height =
                        Math.min(target.scrollHeight, 120) + 'px';
                    }}
                  />
                </div>

                {/* Bottom action bar */}
                <div className='-mt-1 flex items-center gap-1.5 px-5 pb-3'>
                  {/* Add Personas button */}
                  {personaItems.length > 0 && (
                    <button
                      ref={personaButtonRef}
                      type='button'
                      onClick={togglePersonaMenu}
                      className={cn(
                        'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-medium transition-colors',
                        selectedPersonas.length >= 4
                          ? 'cursor-not-allowed border-white/10 text-white/20'
                          : showPersonaMenu
                            ? 'border-white/30 bg-white/10 text-white/70'
                            : 'border-white/15 text-white/40 hover:bg-white/[0.08] hover:text-white/70',
                      )}
                    >
                      <Users className='h-3 w-3' />
                      <span>
                        {selectedPersonas.length > 0
                          ? `Personas (${selectedPersonas.length}/4)`
                          : 'Add Personas'}
                      </span>
                    </button>
                  )}

                  {/* Selected persona badges */}
                  {selectedPersonas.map((persona) => (
                    <motion.span
                      key={persona.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className='inline-flex items-center gap-1 rounded-full border border-purple-400/30 bg-purple-500/20 px-2 py-0.5 text-[10px] font-medium text-purple-200'
                    >
                      {persona.avatar ? (
                        <img
                          src={persona.avatar}
                          alt={persona.name}
                          className='h-3.5 w-3.5 rounded-full object-cover'
                        />
                      ) : (
                        <span className='flex h-3.5 w-3.5 items-center justify-center rounded-full bg-purple-500/30 text-[7px] font-bold text-purple-200'>
                          {persona.name.charAt(0)}
                        </span>
                      )}
                      {persona.name}
                      <button
                        type='button'
                        onClick={() => onPersonaRemove?.(persona.id)}
                        className='ml-0.5 transition-colors hover:text-white'
                      >
                        <X size={10} className='stroke-current' />
                      </button>
                    </motion.span>
                  ))}

                  {/* Spacer */}
                  <div className='flex-1' />

                  {/* Selected file chips */}
                  <AnimatePresence>
                    {selectedFiles.map((file, index) => (
                      <motion.div
                        key={`${file.name}-${file.size}`}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className='flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-[10px] text-white/60'
                      >
                        <File className='h-3 w-3 shrink-0 stroke-current' />
                        <span className='max-w-20 truncate'>{file.name}</span>
                        <button
                          type='button'
                          onClick={() => handleRemoveFile(index)}
                          className='transition-colors hover:text-white'
                        >
                          <X size={10} className='stroke-current' />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Upload button */}
                  <button
                    type='button'
                    onClick={handleUploadClick}
                    disabled={selectedFiles.length >= MAX_FILES}
                    className={cn(
                      'rounded-lg p-2 transition-all',
                      selectedFiles.length >= MAX_FILES
                        ? 'cursor-not-allowed text-white/10'
                        : selectedFiles.length > 0
                          ? 'bg-white/10 text-white/50'
                          : 'text-white/20 hover:bg-white/[0.08] hover:text-white/50',
                    )}
                    aria-label='Upload file'
                  >
                    <Upload className='h-4 w-4' />
                  </button>

                  {/* Send button */}
                  <button
                    type='button'
                    onClick={onSubmit}
                    disabled={!inputValue.trim()}
                    className={cn(
                      'rounded-lg p-2 transition-all',
                      inputValue.trim()
                        ? 'text-white/50 hover:bg-white/[0.08] hover:text-white/80'
                        : 'text-white/20',
                    )}
                    aria-label='Submit'
                  >
                    <Send className='h-4 w-4' />
                  </button>
                </div>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type='file'
                multiple
                onChange={handleFileInputChange}
                accept={SUPPORTED_EXTENSIONS.map((ext) => `.${ext}`).join(',')}
                className='hidden'
              />
            </div>
          </div>

          <div style={getAnimationStyle('fadeIn', 800, 1500)}>
            <p className='aucctus-text-xl aucctus-text-white opacity-60'>
              Start typing to begin exploring...
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LandingView;

/**
 * PersonaOverviewSection - Persona identity and overview display
 *
 * Layout with:
 * - HEADER: Avatar, segment name with theme color, "Represented by" text, and tags
 * - CONTENT: Demographics pills, overview text with see more/less
 *
 * Supports inline editing of name, overview, demographics, and tags.
 */

import { GlassSurface } from '@components';
import { cn } from '@libs/utils/react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, Plus, X } from 'lucide-react';
import React, {
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

/** Tag color options */
export type TagColor = 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'teal';

/** Persona tag structure */
export interface PersonaTag {
  uuid: string;
  label: string;
  color: TagColor;
}

/** Demographics data structure */
export interface PersonaDemographics {
  geography?: string;
  ageRange?: string;
  familySize?: string;
  income?: string;
  education?: string;
  occupation?: string;
}

/** Props for the PersonaOverviewSection component */
export interface PersonaOverviewSectionProps {
  /** Persona segment name (e.g., "Digital Multiculturals") */
  name: string;
  /** Representative name (e.g., "Joy & Kevin") */
  representativeName: string;
  /** Avatar image URL */
  avatar?: string;
  /** Theme color in HSL format */
  themeColor?: string;
  /** Tags attached to this persona */
  tags?: PersonaTag[];
  /** Demographics data */
  demographics?: PersonaDemographics;
  /** Overview/description text */
  overview?: string;
  /** Whether editing is enabled */
  isEditable?: boolean;
  /** Callback when name is edited */
  onNameChange?: (name: string) => void;
  /** Callback when tag is added (color auto-assigned via rotation) */
  onAddTag?: (label: string, color: TagColor) => void;
  /** Callback when tag is removed */
  onRemoveTag?: (uuid: string) => void;
  /** Callback when demographics field is edited */
  onDemographicsChange?: (
    field: keyof PersonaDemographics,
    value: string,
  ) => void;
  /** Callback when overview is edited */
  onOverviewChange?: (overview: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/** Tag color configuration */
const tagColorConfig: Record<
  TagColor,
  { bg: string; text: string; border: string }
> = {
  blue: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
  },
  purple: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
  },
  green: {
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-300',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  orange: {
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-800',
  },
  red: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
  },
  teal: {
    bg: 'bg-teal-100 dark:bg-teal-900/30',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-200 dark:border-teal-800',
  },
};

/** Demographics field configuration with emojis */
const demographicsFields: Array<{
  key: keyof PersonaDemographics;
  emoji: string;
  label: string;
}> = [
  { key: 'geography', emoji: '📍', label: 'Location' },
  { key: 'ageRange', emoji: '👨‍👩‍👧‍👦', label: 'Age' },
  { key: 'income', emoji: '💰', label: 'Income' },
  { key: 'occupation', emoji: '💼', label: 'Occupation' },
];

/**
 * Generates initials from a name
 */
const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

/**
 * InlineEditableText - Click-to-edit text field
 */
const InlineEditableText: React.FC<{
  value: string;
  onSave: (value: string) => void;
  className?: string;
  multiline?: boolean;
  placeholder?: string;
  onEditingChange?: (isEditing: boolean) => void;
}> = ({
  value,
  onSave,
  className,
  multiline = false,
  placeholder,
  onEditingChange,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const setEditingState = useCallback(
    (editing: boolean) => {
      setIsEditing(editing);
      onEditingChange?.(editing);
    },
    [onEditingChange],
  );

  const handleStartEdit = useCallback(() => {
    setEditValue(value);
    setEditingState(true);
  }, [value, setEditingState]);

  const handleSave = useCallback(() => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== value) {
      onSave(trimmed);
    }
    setEditingState(false);
  }, [editValue, value, onSave, setEditingState]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !multiline) {
        handleSave();
      }
      if (e.key === 'Escape') {
        setEditingState(false);
      }
    },
    [handleSave, multiline, setEditingState],
  );

  if (isEditing) {
    if (multiline) {
      return (
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
          rows={4}
          className={cn(
            'aucctus-bg-secondary aucctus-border-primary aucctus-text-primary w-full resize-none rounded-lg border p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
            className,
          )}
        />
      );
    }
    return (
      <input
        type='text'
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={handleKeyDown}
        autoFocus
        className={cn(
          'aucctus-bg-secondary aucctus-border-primary aucctus-text-primary w-full rounded-lg border px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500/20',
          className,
        )}
      />
    );
  }

  return (
    <span
      onClick={handleStartEdit}
      className={cn(
        'cursor-pointer rounded px-1 transition-colors hover:bg-[--aucctus-bg-tertiary]',
        className,
      )}
      title='Click to edit'
    >
      {value || placeholder || 'Click to edit'}
    </span>
  );
};

/** Valid tag colors in rotation order */
const TAG_COLORS_ROTATION: TagColor[] = ['blue', 'purple', 'green', 'orange'];

/**
 * Returns the next tag color based on the existing tags, cycling through the rotation.
 */
const getNextTagColor = (existingTags: PersonaTag[]): TagColor => {
  if (existingTags.length === 0) return TAG_COLORS_ROTATION[0];
  const lastTag = existingTags[existingTags.length - 1];
  const lastIndex = TAG_COLORS_ROTATION.indexOf(lastTag.color as TagColor);
  const nextIndex = (lastIndex + 1) % TAG_COLORS_ROTATION.length;
  return TAG_COLORS_ROTATION[nextIndex];
};

/**
 * InlineAddTag - Inline input for typing a new tag name directly.
 * Color is auto-assigned via rotation. Press Enter/comma to add, Escape to cancel.
 */
const InlineAddTag: React.FC<{
  onAdd: (label: string) => void;
  existingTags: PersonaTag[];
}> = ({ onAdd, existingTags }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newTag, setNewTag] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isAdding && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isAdding]);

  const handleAddTag = useCallback(() => {
    const trimmed = newTag.trim();
    if (trimmed && !existingTags.some((t) => t.label === trimmed)) {
      onAdd(trimmed);
    }
    setNewTag('');
    setIsAdding(false);
  }, [newTag, existingTags, onAdd]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddTag();
      }
      if (e.key === 'Escape') {
        setNewTag('');
        setIsAdding(false);
      }
      if (e.key === ',') {
        e.preventDefault();
        handleAddTag();
      }
    },
    [handleAddTag],
  );

  if (isAdding) {
    return (
      <motion.input
        ref={inputRef}
        initial={{ width: 0, opacity: 0 }}
        animate={{ width: 'auto', opacity: 1 }}
        exit={{ width: 0, opacity: 0 }}
        transition={{ duration: 0.15 }}
        type='text'
        value={newTag}
        onChange={(e) => setNewTag(e.target.value)}
        onBlur={handleAddTag}
        onKeyDown={handleKeyDown}
        placeholder='Tag name...'
        className='aucctus-text-primary aucctus-text-xs-medium rounded-full border border-dashed border-indigo-400/40 bg-transparent px-2.5 py-1 outline-none focus:border-indigo-500/60'
        style={{ minWidth: 80 }}
      />
    );
  }

  return (
    <motion.button
      type='button'
      onClick={() => setIsAdding(true)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className='aucctus-border-secondary aucctus-text-xs-medium aucctus-text-tertiary hover:aucctus-border-primary hover:aucctus-text-secondary inline-flex items-center gap-1 rounded-full border border-dashed px-2.5 py-1 transition-colors'
    >
      <Plus className='h-3 w-3' />
      {existingTags.length === 0 ? 'Add tag...' : 'Add'}
    </motion.button>
  );
};

/**
 * PersonaOverviewSection Component
 */
const PersonaOverviewSection = forwardRef<
  HTMLDivElement,
  PersonaOverviewSectionProps
>(
  (
    {
      name,
      representativeName,
      avatar,
      themeColor,
      tags = [],
      demographics = {},
      overview = '',
      isEditable = false,
      onNameChange,
      onAddTag,
      onRemoveTag,
      onOverviewChange,
      className,
    },
    ref,
  ) => {
    const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);
    const [isOverviewClamped, setIsOverviewClamped] = useState(false);
    const [collapsedHeight, setCollapsedHeight] = useState<number | undefined>(
      undefined,
    );
    const overviewTextRef = useRef<HTMLDivElement>(null);

    // Compute avatar background color
    const avatarStyle = useMemo(
      () => ({
        backgroundColor: themeColor ? `hsl(${themeColor})` : '#6366F1',
      }),
      [themeColor],
    );

    // Subtle tinted background for header area
    const headerBackgroundStyle = useMemo(
      () => ({
        backgroundColor: themeColor
          ? `hsl(${themeColor} / 0.06)`
          : 'rgba(99, 102, 241, 0.06)',
      }),
      [themeColor],
    );

    // Measure clamped vs full height to detect overflow and cache collapsed height
    useEffect(() => {
      const el = overviewTextRef.current;
      if (!el) return;
      // Temporarily apply line-clamp to measure collapsed height
      el.classList.add('line-clamp-4');
      const clamped = el.offsetHeight;
      el.classList.remove('line-clamp-4');
      const full = el.scrollHeight;
      setIsOverviewClamped(full > clamped);
      setCollapsedHeight(clamped);
    }, [overview]);

    const handleToggleOverview = useCallback(() => {
      setIsOverviewExpanded((prev) => !prev);
    }, []);

    const handleOverviewEditingChange = useCallback(
      (editing: boolean) => {
        if (editing) {
          setIsOverviewExpanded(true);
        } else if (isOverviewClamped) {
          setIsOverviewExpanded(false);
        }
      },
      [isOverviewClamped],
    );

    return (
      <div ref={ref} className={className}>
        <GlassSurface className='h-full overflow-hidden'>
          {/* Header Section with tinted background */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className='rounded-t-lg p-6 pb-4'
            style={headerBackgroundStyle}
          >
            <div className='flex items-start gap-4'>
              {/* Avatar */}
              <div className='shrink-0 self-center'>
                {avatar ? (
                  <motion.img
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    src={avatar}
                    alt={name}
                    className='h-24 w-24 rounded-full border-2 object-cover'
                    style={{
                      borderColor: themeColor
                        ? `hsl(${themeColor} / 0.2)`
                        : 'rgba(99, 102, 241, 0.2)',
                    }}
                  />
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className='aucctus-header-xl-bold flex h-24 w-24 items-center justify-center rounded-full text-white shadow-lg'
                    style={avatarStyle}
                  >
                    {getInitials(representativeName)}
                  </motion.div>
                )}
              </div>

              {/* Name, Represented by, and Tags */}
              <div className='min-w-0 flex-1'>
                {/* Segment Name */}
                {isEditable && onNameChange ? (
                  <InlineEditableText
                    value={name}
                    onSave={onNameChange}
                    className='aucctus-header-sm-bold aucctus-text-primary'
                  />
                ) : (
                  <h1 className='aucctus-header-sm-bold aucctus-text-primary'>
                    {name}
                  </h1>
                )}

                {/* Represented by */}
                <p className='aucctus-text-sm aucctus-text-secondary mt-1'>
                  Represented by {representativeName}
                </p>

                {/* Tags Row */}
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className='mt-3 flex flex-wrap gap-2'
                >
                  {tags.map((tag, index) => {
                    const colors = tagColorConfig[tag.color];
                    return (
                      <motion.span
                        key={tag.uuid}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        whileHover={{ scale: 1.05 }}
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full border px-2.5 py-1',
                          'aucctus-text-xs-medium',
                          colors.bg,
                          colors.text,
                          colors.border,
                        )}
                      >
                        {tag.label}
                        {onRemoveTag && (
                          <motion.button
                            type='button'
                            aria-label='Remove tag'
                            onClick={() => onRemoveTag(tag.uuid)}
                            className='ml-0.5 rounded-full p-0.5 hover:opacity-70'
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            <X className='h-3 w-3' />
                          </motion.button>
                        )}
                      </motion.span>
                    );
                  })}

                  {onAddTag && (
                    <InlineAddTag
                      onAdd={(label: string) =>
                        onAddTag(label, getNextTagColor(tags))
                      }
                      existingTags={tags}
                    />
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Content Section */}
          <div className='p-6 pt-4'>
            {/* Demographics pills with emojis */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 }}
              className='mb-6 flex flex-wrap gap-2'
            >
              {demographicsFields.map((field, index) => {
                const value = demographics[field.key];
                if (!value) return null;
                return (
                  <motion.span
                    key={field.key}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.15 + index * 0.05 }}
                    className='aucctus-bg-secondary aucctus-text-xs aucctus-text-secondary inline-flex items-center gap-1.5 rounded-full px-3 py-1.5'
                  >
                    <span className='text-base'>{field.emoji}</span>
                    {value}
                  </motion.span>
                );
              })}
              {demographicsFields.map((field, index) => {
                const value = demographics[field.key];
                if (value) return null;
                return (
                  <motion.span
                    key={field.key}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.2 + index * 0.05 }}
                    className='inline-flex items-center gap-1.5 rounded-full border border-dashed border-[#F79009]/30 px-3 py-1.5'
                  >
                    <span className='text-base opacity-50'>{field.emoji}</span>
                    <span className='aucctus-text-sm italic text-[#F79009]/60'>
                      {field.label}
                    </span>
                  </motion.span>
                );
              })}
            </motion.div>

            {/* Overview text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className='aucctus-border-primary border-t pt-4'
            >
              <h3 className='aucctus-text-xs-bold aucctus-text-tertiary mb-2 uppercase tracking-wider'>
                Overview
              </h3>
              {overview ? (
                <div className='relative'>
                  <motion.div
                    animate={{
                      height: isOverviewExpanded
                        ? 'auto'
                        : isOverviewClamped && collapsedHeight
                          ? collapsedHeight
                          : 'auto',
                    }}
                    initial={false}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className='overflow-hidden'
                  >
                    <div ref={overviewTextRef}>
                      {isEditable && onOverviewChange ? (
                        <InlineEditableText
                          value={overview}
                          onSave={onOverviewChange}
                          className='aucctus-text-sm aucctus-text-secondary leading-relaxed'
                          multiline
                          onEditingChange={handleOverviewEditingChange}
                        />
                      ) : (
                        <p className='aucctus-text-sm aucctus-text-secondary leading-relaxed'>
                          {overview}
                        </p>
                      )}
                    </div>
                  </motion.div>
                  {(isOverviewClamped || isOverviewExpanded) && (
                    <button
                      type='button'
                      onClick={handleToggleOverview}
                      className='text-primary hover:text-primary/80 mt-2 flex items-center gap-1 text-xs font-medium transition-colors'
                    >
                      {isOverviewExpanded ? (
                        <ChevronUp className='h-3 w-3' />
                      ) : (
                        <ChevronDown className='h-3 w-3' />
                      )}
                      {isOverviewExpanded ? 'See less' : 'See more'}
                    </button>
                  )}
                </div>
              ) : (
                <div className='rounded-lg border border-dashed border-[#F79009]/40 bg-[#F79009]/5 p-4 text-center'>
                  <p className='aucctus-text-sm italic text-[#F79009]/60'>
                    No overview yet. Upload training documents to generate one.
                  </p>
                </div>
              )}
            </motion.div>
          </div>
        </GlassSurface>
      </div>
    );
  },
);

// Add display name for better debugging
PersonaOverviewSection.displayName = 'PersonaOverviewSection';

export default PersonaOverviewSection;

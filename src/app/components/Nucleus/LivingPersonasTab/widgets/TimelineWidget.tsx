/**
 * TimelineWidget - A Day in Their Life timeline
 *
 * Displays a horizontal timeline of daily activities as cards.
 * Ported from lovable WorkdayJourney design:
 * - Time-of-day icons (sun, coffee, utensils, moon)
 * - Card-based steps with time badges and step numbers
 * - Violet/purple theme for time elements
 * - Horizontal timeline line connecting cards
 * - Product intervention highlighting
 * - Inline editing with 24h time picker
 */

import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Moon,
  Pencil,
  Plus,
  Sun,
  Utensils,
  X,
} from 'lucide-react';
import React, { useRef, useCallback, useState } from 'react';
import { cn } from '@libs/utils/react';
import GlassWidget, { WidgetSize } from './GlassWidget';

/** Timeline step structure */
export interface TimelineStep {
  uuid: string;
  time: string; // 24h format e.g., "06:30", "14:00"
  title: string;
  description: string;
  isProductIntervention?: boolean; // Highlights key moments
}

/** Props for the TimelineWidget component */
export interface TimelineWidgetProps {
  /** Widget title */
  title?: string;
  /** Icon variant */
  icon?: string;
  /** Timeline steps */
  steps: TimelineStep[];
  /** Widget size */
  size?: WidgetSize;
  /** Whether editing is enabled */
  isEditable?: boolean;
  /** Callback to add new step */
  onAdd?: (data: {
    time: string;
    title: string;
    description?: string;
    isProductIntervention?: boolean;
  }) => void;
  /** Callback to update a step */
  onUpdate?: (
    uuid: string,
    data: {
      time?: string;
      title?: string;
      description?: string;
      isProductIntervention?: boolean;
    },
  ) => void;
  /** Callback to delete a step */
  onDelete?: (uuid: string) => void;
  /** Additional CSS classes */
  className?: string;
}

/** Form state for adding/editing a step */
interface StepFormState {
  time: string;
  title: string;
  description: string;
  isProductIntervention: boolean;
}

const EMPTY_FORM: StepFormState = {
  time: '09:00',
  title: '',
  description: '',
  isProductIntervention: false,
};

/**
 * Get time-of-day icon component based on the hour (24h format)
 */
const getTimeIcon = (time: string): React.FC<{ className?: string }> => {
  const match = time.match(/^(\d{1,2})/);
  if (!match) return Clock;
  const hour = parseInt(match[1], 10);
  if (hour >= 5 && hour < 9) return Sun;
  if (hour >= 9 && hour < 12) return Coffee;
  if (hour >= 12 && hour < 17) return Utensils;
  return Moon;
};

/**
 * Inline form for adding or editing a timeline step
 */
const StepForm: React.FC<{
  form: StepFormState;
  onChange: (form: StepFormState) => void;
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
}> = ({ form, onChange, onSave, onCancel, saveLabel = 'Save' }) => {
  const canSave = form.title.trim().length > 0 && form.time.trim().length > 0;

  return (
    <div className='space-y-2'>
      {/* Time picker - 24h */}
      <div>
        <label className='aucctus-text-xs aucctus-text-tertiary mb-1 block'>
          Time (24h)
        </label>
        <input
          type='time'
          value={form.time}
          onChange={(e) => onChange({ ...form, time: e.target.value })}
          className='aucctus-bg-secondary aucctus-border-primary aucctus-text-primary w-full rounded-md border px-2 py-1.5 text-sm'
        />
      </div>
      {/* Title */}
      <div>
        <label className='aucctus-text-xs aucctus-text-tertiary mb-1 block'>
          Title
        </label>
        <input
          type='text'
          value={form.title}
          onChange={(e) => onChange({ ...form, title: e.target.value })}
          placeholder='e.g., Check email'
          className='aucctus-bg-secondary aucctus-border-primary aucctus-text-primary w-full rounded-md border px-2 py-1.5 text-sm placeholder:text-gray-400'
        />
      </div>
      {/* Description */}
      <div>
        <label className='aucctus-text-xs aucctus-text-tertiary mb-1 block'>
          Description
        </label>
        <textarea
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          placeholder='What happens during this step...'
          rows={2}
          className='aucctus-bg-secondary aucctus-border-primary aucctus-text-primary w-full resize-none rounded-md border px-2 py-1.5 text-sm placeholder:text-gray-400'
        />
      </div>
      {/* Product intervention toggle */}
      <label className='flex cursor-pointer items-center gap-2'>
        <input
          type='checkbox'
          checked={form.isProductIntervention}
          onChange={(e) =>
            onChange({ ...form, isProductIntervention: e.target.checked })
          }
          className='h-3.5 w-3.5 rounded border-gray-300 accent-violet-600'
        />
        <span className='aucctus-text-xs aucctus-text-secondary'>
          Product intervention
        </span>
      </label>
      {/* Actions */}
      <div className='flex justify-end gap-2 pt-1'>
        <button
          type='button'
          onClick={onCancel}
          className='aucctus-text-xs aucctus-text-secondary rounded-md px-3 py-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800'
        >
          Cancel
        </button>
        <button
          type='button'
          onClick={onSave}
          disabled={!canSave}
          className={cn(
            'aucctus-text-xs rounded-md px-3 py-1.5 font-medium text-white transition-colors',
            canSave
              ? 'bg-violet-600 hover:bg-violet-700'
              : 'cursor-not-allowed bg-gray-300 dark:bg-gray-700',
          )}
        >
          {saveLabel}
        </button>
      </div>
    </div>
  );
};

/**
 * TimelineWidget Component
 */
const TimelineWidget: React.FC<TimelineWidgetProps> = ({
  title = 'A Day in Their Life',
  icon = 'clock',
  steps,
  size = 'full',
  isEditable = false,
  onAdd,
  onUpdate,
  onDelete,
  className,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isEmpty = steps.length === 0;

  // Editing state
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<StepFormState>(EMPTY_FORM);

  // Adding state
  const [isAdding, setIsAdding] = useState(false);
  const [addForm, setAddForm] = useState<StepFormState>(EMPTY_FORM);

  const scrollBy = useCallback((direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 240;
      scrollContainerRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth',
      });
    }
  }, []);

  const handleStartEdit = useCallback((step: TimelineStep) => {
    setEditingUuid(step.uuid);
    setEditForm({
      time: step.time,
      title: step.title,
      description: step.description || '',
      isProductIntervention: step.isProductIntervention || false,
    });
    setIsAdding(false);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingUuid || !onUpdate) return;
    onUpdate(editingUuid, {
      time: editForm.time,
      title: editForm.title,
      description: editForm.description,
      isProductIntervention: editForm.isProductIntervention,
    });
    setEditingUuid(null);
    setEditForm(EMPTY_FORM);
  }, [editingUuid, editForm, onUpdate]);

  const handleCancelEdit = useCallback(() => {
    setEditingUuid(null);
    setEditForm(EMPTY_FORM);
  }, []);

  const handleStartAdd = useCallback(() => {
    setIsAdding(true);
    setAddForm(EMPTY_FORM);
    setEditingUuid(null);
  }, []);

  const handleSaveAdd = useCallback(() => {
    if (!onAdd) return;
    onAdd({
      time: addForm.time,
      title: addForm.title,
      description: addForm.description || undefined,
      isProductIntervention: addForm.isProductIntervention || undefined,
    });
    setIsAdding(false);
    setAddForm(EMPTY_FORM);
  }, [addForm, onAdd]);

  const handleCancelAdd = useCallback(() => {
    setIsAdding(false);
    setAddForm(EMPTY_FORM);
  }, []);

  const showAddButton = isEditable && onAdd;

  return (
    <GlassWidget
      title={title}
      icon={icon}
      size={size}
      showAddButton={!!(showAddButton && !isAdding)}
      onAction={handleStartAdd}
      className={className}
    >
      <p className='aucctus-text-xs aucctus-text-tertiary mb-3'>
        Typical daily routine and touchpoints throughout the day
      </p>

      {/* Inline add form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className='mb-3 overflow-hidden'
          >
            <div className='aucctus-bg-secondary rounded-lg border border-violet-200 p-3 dark:border-violet-700/50'>
              <div className='mb-2 flex items-center gap-2'>
                <Plus className='h-3.5 w-3.5 text-violet-500' />
                <span className='aucctus-text-xs-bold text-violet-600 dark:text-violet-400'>
                  New Step
                </span>
              </div>
              <StepForm
                form={addForm}
                onChange={setAddForm}
                onSave={handleSaveAdd}
                onCancel={handleCancelAdd}
                saveLabel='Add Step'
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isEmpty && !isAdding ? (
        <div className='relative py-4'>
          {/* Empty timeline container */}
          <div className='h-[2px] bg-violet-500/20' />
          {showAddButton && (
            <div className='mt-3 flex justify-center'>
              <button
                type='button'
                onClick={handleStartAdd}
                className='aucctus-text-xs flex items-center gap-1.5 rounded-md px-3 py-1.5 text-violet-600 transition-colors hover:bg-violet-50 dark:text-violet-400 dark:hover:bg-violet-900/20'
              >
                <Plus className='h-3.5 w-3.5' />
                Add first step
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className='relative'>
          {/* Navigation arrows */}
          {steps.length > 4 && (
            <>
              <motion.button
                aria-label='Scroll timeline left'
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => scrollBy('left')}
                className='aucctus-bg-primary absolute left-0 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full shadow-md'
              >
                <ChevronLeft className='aucctus-text-secondary h-4 w-4' />
              </motion.button>
              <motion.button
                aria-label='Scroll timeline right'
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => scrollBy('right')}
                className='aucctus-bg-primary absolute right-0 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full shadow-md'
              >
                <ChevronRight className='aucctus-text-secondary h-4 w-4' />
              </motion.button>
            </>
          )}

          {/* Timeline line - full visible container width, behind cards */}
          <div className='absolute inset-x-2 top-1/2 z-0 h-[2px] -translate-y-1/2 bg-violet-500/20' />

          {/* Scroll container */}
          <div
            ref={scrollContainerRef}
            className='no-scrollbar relative z-[1] overflow-x-auto'
          >
            <div className='flex w-max py-4 pl-4'>
              {steps.map((step, index) => {
                const TimeIcon = getTimeIcon(step.time);
                const isEditingThis = editingUuid === step.uuid;

                return (
                  <motion.div
                    key={step.uuid}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: Math.min(index * 0.05, 0.3),
                    }}
                    className={cn(
                      'relative z-[1] shrink-0 grow-0 pr-4 pt-6',
                      isEditingThis ? 'basis-[280px]' : 'basis-[220px]',
                    )}
                  >
                    <div
                      className={cn(
                        'aucctus-bg-primary group relative rounded-lg border p-4 transition-all',
                        isEditingThis
                          ? 'border-violet-300 shadow-md dark:border-violet-600'
                          : step.isProductIntervention
                            ? 'border-primary bg-primary/10 shadow-primary/10 shadow-lg'
                            : 'aucctus-border-primary hover:shadow-md',
                      )}
                    >
                      {isEditingThis ? (
                        /* Inline edit form */
                        <div className='mt-1'>
                          <StepForm
                            form={editForm}
                            onChange={setEditForm}
                            onSave={handleSaveEdit}
                            onCancel={handleCancelEdit}
                          />
                        </div>
                      ) : (
                        <>
                          {/* Time badge with lucide icon */}
                          <div className='absolute -top-3 left-4 flex items-center gap-1 rounded-full border border-violet-200 bg-violet-100 px-2 py-1 dark:border-violet-700/50 dark:bg-violet-900/40'>
                            <TimeIcon className='h-3 w-3 text-violet-600 dark:text-violet-400' />
                            <span className='text-xs font-medium text-violet-700 dark:text-violet-300'>
                              {step.time}
                            </span>
                          </div>

                          {/* Step number */}
                          <div
                            className={cn(
                              'absolute -top-3 right-4 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold',
                              step.isProductIntervention
                                ? 'bg-primary text-white'
                                : 'aucctus-bg-tertiary aucctus-text-secondary',
                            )}
                          >
                            {index + 1}
                          </div>

                          {/* Content */}
                          <h4 className='aucctus-text-primary mt-2 text-sm font-medium'>
                            {step.title}
                          </h4>
                          <p className='aucctus-text-tertiary mt-1 line-clamp-2 text-xs'>
                            {step.description}
                          </p>

                          {/* Hover action buttons */}
                          {isEditable && (onDelete || onUpdate) && (
                            <div className='absolute bottom-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
                              {onUpdate && (
                                <button
                                  type='button'
                                  className='btn btn-no-border btn-light-primary btn-sm h-6 w-6 rounded-full p-0'
                                  onClick={() => handleStartEdit(step)}
                                  title='Edit step'
                                >
                                  <Pencil className='h-3 w-3' />
                                </button>
                              )}
                              {onDelete && (
                                <button
                                  type='button'
                                  className='btn btn-no-border btn-light-primary btn-sm text-destructive h-6 w-6 rounded-full p-0'
                                  onClick={() => onDelete(step.uuid)}
                                  title='Delete step'
                                >
                                  <X className='h-3 w-3' />
                                </button>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </GlassWidget>
  );
};

export default TimelineWidget;

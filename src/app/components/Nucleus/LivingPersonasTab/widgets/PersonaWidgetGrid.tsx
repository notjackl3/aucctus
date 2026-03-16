/**
 * PersonaWidgetGrid - Grid layout for persona widgets with configure mode
 *
 * Orchestrates all persona widgets in a responsive 3-column grid.
 * Supports edit mode with:
 * - Drag-and-drop reordering (HTML5 DnD)
 * - Visibility toggles per widget (eye-off icon, top-left)
 * - Size selector per widget (Third / Half / Full, bottom-right)
 * - Hidden widgets shown at bottom with blur overlay + restore
 */

import { motion, AnimatePresence } from 'framer-motion';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { CardListItem } from './CardListWidget';
import GainsWidget, { GainItem } from './GainsWidget';
import SocialValuesWidget, { SocialValueItem } from './SocialValuesWidget';
import JobsWidget from './JobsWidget';
import PainsWidget from './PainsWidget';
import MotivationsBehavioursWidget from './MotivationsBehavioursWidget';
import type { MotivationBehaviourItem } from './MotivationsBehavioursWidget';
import KeyFactsWidget, { KeyFact } from './KeyFactsWidget';
import TimelineWidget, { TimelineStep } from './TimelineWidget';
import CustomWidgetRenderer from './CustomWidgetRenderer';
import { Check, GripVertical, EyeOff, Plus, Trash2, X } from 'lucide-react';
import { cn } from '@libs/utils/react';
import type {
  ICustomWidget,
  IUpdateCustomWidgetPayload,
} from '@libs/api/types/persona';

/** Widget configuration item */
export interface WidgetConfig {
  id: string;
  label: string;
  visible: boolean;
  size: 'small' | 'medium' | 'full';
}

/** Full persona data for all widgets */
export interface PersonaWidgetData {
  jobsToBeDone?: CardListItem[];
  pains?: CardListItem[];
  gains?: GainItem[];
  socialValues?: SocialValueItem[];
  motivations?: MotivationBehaviourItem[];
  behaviours?: MotivationBehaviourItem[];
  keyFacts?: KeyFact[];
  quotes?: Array<{ uuid: string; text: string; context: string }>;
  workdaySteps?: TimelineStep[];
  customWidgets?: ICustomWidget[];
}

/** Content mutation callbacks for widgets */
export interface ContentMutationCallbacks {
  onAddJob?: (data: { text: string; priority?: number }) => void;
  onUpdateJob?: (uuid: string, data: { text: string }) => void;
  onDeleteJob?: (uuid: string) => void;
  onAddPain?: (data: { text: string; severity?: number }) => void;
  onUpdatePain?: (uuid: string, data: { text: string }) => void;
  onDeletePain?: (uuid: string) => void;
  onAddGain?: (data: { text: string; impact?: number }) => void;
  onUpdateGain?: (uuid: string, data: { text: string }) => void;
  onDeleteGain?: (uuid: string) => void;
  onAddSocialValue?: (data: { title: string; description?: string }) => void;
  onUpdateSocialValue?: (
    uuid: string,
    data: { title: string; description?: string },
  ) => void;
  onDeleteSocialValue?: (uuid: string) => void;
  onAddMotivation?: (data: { text: string; priority?: number }) => void;
  onUpdateMotivation?: (uuid: string, data: { text: string }) => void;
  onDeleteMotivation?: (uuid: string) => void;
  onAddBehaviour?: (data: { text: string }) => void;
  onUpdateBehaviour?: (uuid: string, data: { text: string }) => void;
  onDeleteBehaviour?: (uuid: string) => void;
  onAddKeyFact?: (data: {
    stat: string;
    label: string;
    trend?: string;
  }) => void;
  onUpdateKeyFact?: (
    uuid: string,
    data: { stat: string; label: string; trend?: string },
  ) => void;
  onDeleteKeyFact?: (uuid: string) => void;
  onAddWorkdayStep?: (data: {
    time: string;
    title: string;
    description?: string;
    isProductIntervention?: boolean;
  }) => void;
  onUpdateWorkdayStep?: (
    uuid: string,
    data: {
      time?: string;
      title?: string;
      description?: string;
      isProductIntervention?: boolean;
    },
  ) => void;
  onDeleteWorkdayStep?: (uuid: string) => void;
}

/** Custom widget callbacks */
export interface CustomWidgetCallbacks {
  onAddCustomWidgetItem?: (
    widgetUuid: string,
    data: Record<string, unknown>,
  ) => void;
  onUpdateCustomWidgetItem?: (
    widgetUuid: string,
    itemUuid: string,
    data: Record<string, unknown>,
  ) => void;
  onDeleteCustomWidgetItem?: (widgetUuid: string, itemUuid: string) => void;
  onUpdateCustomWidget?: (
    widgetUuid: string,
    data: IUpdateCustomWidgetPayload,
  ) => void;
  onDeleteCustomWidget?: (widgetUuid: string) => void;
}

/** Props for the PersonaWidgetGrid component */
export interface PersonaWidgetGridProps {
  /** Widget data for the persona */
  data: PersonaWidgetData;
  /** Whether layout mode is active (drag, hide, resize widgets) */
  isLayoutMode?: boolean;
  /** Widget configuration */
  widgetConfig?: WidgetConfig[];
  /** Callback when widget configuration changes */
  onConfigChange?: (config: WidgetConfig[]) => void;
  /** Content mutation callbacks */
  contentCallbacks?: ContentMutationCallbacks;
  /** Custom widget callbacks */
  customWidgetCallbacks?: CustomWidgetCallbacks;
  /** Additional CSS classes */
  className?: string;
}

/** Size to col-span mapping */
const sizeColSpanClass: Record<string, string> = {
  small: '',
  medium: 'md:col-span-2',
  full: 'md:col-span-2 xl:col-span-3',
};

/** Size options matching Lovable design: Third / Half / Full */
const sizeOptions: Array<{
  value: 'small' | 'medium' | 'full';
  label: string;
}> = [
  { value: 'small', label: 'Third' },
  { value: 'medium', label: 'Half' },
  { value: 'full', label: 'Full' },
];

/**
 * Renders a single widget by its config ID
 */
const renderWidget = (
  id: string,
  data: PersonaWidgetData,
  size: string,
  isLayoutMode: boolean,
  callbacks?: ContentMutationCallbacks,
  customCallbacks?: CustomWidgetCallbacks,
): React.ReactNode => {
  // Content editing (add/edit/delete items) is always enabled;
  // layout mode (drag/hide/resize) is handled separately by the grid.
  const isEditable = true;
  // Check if it's a custom widget
  if (id.startsWith('custom-')) {
    const widgetUuid = id.replace('custom-', '');
    const widget = data.customWidgets?.find((w) => w.uuid === widgetUuid);
    if (widget) {
      return (
        <CustomWidgetRenderer
          widget={widget}
          size={size as any}
          isEditable={isEditable}
          isLayoutMode={isLayoutMode}
          onAddItem={customCallbacks?.onAddCustomWidgetItem}
          onUpdateItem={customCallbacks?.onUpdateCustomWidgetItem}
          onDeleteItem={customCallbacks?.onDeleteCustomWidgetItem}
          onUpdateWidget={customCallbacks?.onUpdateCustomWidget}
          onDeleteWidget={customCallbacks?.onDeleteCustomWidget}
        />
      );
    }
    return null;
  }

  switch (id) {
    case 'jobs':
      return (
        <JobsWidget
          items={data.jobsToBeDone || []}
          size={size as any}
          isEditable={isEditable}
          onAdd={callbacks?.onAddJob}
          onUpdate={callbacks?.onUpdateJob}
          onDelete={callbacks?.onDeleteJob}
        />
      );
    case 'pains':
      return (
        <PainsWidget
          items={data.pains || []}
          size={size as any}
          isEditable={isEditable}
          onAdd={callbacks?.onAddPain}
          onUpdate={callbacks?.onUpdatePain}
          onDelete={callbacks?.onDeletePain}
        />
      );
    case 'gains':
      return (
        <GainsWidget
          items={data.gains || []}
          size={size as any}
          isEditable={isEditable}
          onAdd={callbacks?.onAddGain}
          onUpdate={callbacks?.onUpdateGain}
          onDelete={callbacks?.onDeleteGain}
        />
      );
    case 'socialValues':
      return (
        <SocialValuesWidget
          items={data.socialValues || []}
          size={size as any}
          isEditable={isEditable}
          onAdd={callbacks?.onAddSocialValue}
          onUpdate={callbacks?.onUpdateSocialValue}
          onDelete={callbacks?.onDeleteSocialValue}
        />
      );
    case 'motivationsBehaviours':
      return (
        <MotivationsBehavioursWidget
          motivations={data.motivations || []}
          behaviours={data.behaviours || []}
          size={size as any}
          isEditable={isEditable}
          onAddMotivation={callbacks?.onAddMotivation}
          onUpdateMotivation={callbacks?.onUpdateMotivation}
          onDeleteMotivation={callbacks?.onDeleteMotivation}
          onAddBehaviour={callbacks?.onAddBehaviour}
          onUpdateBehaviour={callbacks?.onUpdateBehaviour}
          onDeleteBehaviour={callbacks?.onDeleteBehaviour}
        />
      );
    case 'keyFacts':
      return (
        <KeyFactsWidget
          facts={data.keyFacts || []}
          size={size as any}
          isEditable={isEditable}
          onAdd={callbacks?.onAddKeyFact}
          onUpdate={callbacks?.onUpdateKeyFact}
          onDelete={callbacks?.onDeleteKeyFact}
        />
      );
    case 'timeline':
      return (
        <TimelineWidget
          steps={data.workdaySteps || []}
          size={size as any}
          isEditable={isEditable}
          onAdd={callbacks?.onAddWorkdayStep}
          onUpdate={callbacks?.onUpdateWorkdayStep}
          onDelete={callbacks?.onDeleteWorkdayStep}
        />
      );
    default:
      return null;
  }
};

/**
 * PersonaWidgetGrid Component
 */
const PersonaWidgetGrid: React.FC<PersonaWidgetGridProps> = ({
  data,
  isLayoutMode = false,
  widgetConfig,
  onConfigChange,
  contentCallbacks,
  customWidgetCallbacks,
  className,
}) => {
  // Merge custom widgets into config if they're not already present
  const config = useMemo(() => {
    const baseConfig = widgetConfig || [];
    const customWidgets = data.customWidgets || [];
    const existingIds = new Set(baseConfig.map((w) => w.id));
    const newCustomConfigs = customWidgets
      .filter((w) => !existingIds.has(`custom-${w.uuid}`))
      .map((w) => ({
        id: `custom-${w.uuid}`,
        label: w.title,
        visible: true,
        size: 'small' as const,
      }));
    if (newCustomConfigs.length > 0) {
      return [...baseConfig, ...newCustomConfigs];
    }
    return baseConfig;
  }, [widgetConfig, data.customWidgets]);
  const visibleWidgets = useMemo(
    () => config.filter((w) => w.visible),
    [config],
  );
  const hiddenWidgets = useMemo(
    () => config.filter((w) => !w.visible),
    [config],
  );

  // DnD state
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const draggedIndexRef = useRef<number | null>(null);

  // Delete confirmation state for custom widgets
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleToggleVisibility = useCallback(
    (id: string) => {
      if (!onConfigChange) return;
      onConfigChange(
        config.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w)),
      );
    },
    [config, onConfigChange],
  );

  const handleSizeChange = useCallback(
    (id: string, size: 'small' | 'medium' | 'full') => {
      if (!onConfigChange) return;
      onConfigChange(config.map((w) => (w.id === id ? { ...w, size } : w)));
    },
    [config, onConfigChange],
  );

  // DnD handlers
  const handleDragStart = useCallback(
    (e: React.DragEvent, widget: WidgetConfig, index: number) => {
      setDraggedId(widget.id);
      draggedIndexRef.current = index;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', widget.id);

      const dragPreview = document.createElement('div');
      dragPreview.textContent = widget.label;
      dragPreview.style.position = 'absolute';
      dragPreview.style.top = '-1000px';
      dragPreview.style.width = '200px';
      dragPreview.style.padding = '12px 16px';
      dragPreview.style.borderRadius = '12px';
      dragPreview.style.fontSize = '14px';
      dragPreview.style.fontWeight = '500';
      dragPreview.style.background = '#fff';
      dragPreview.style.border = '1px solid #ddd';
      dragPreview.style.boxShadow = '0 8px 32px rgba(0,0,0,0.15)';
      document.body.appendChild(dragPreview);
      e.dataTransfer.setDragImage(dragPreview, 100, 20);
      requestAnimationFrame(() => {
        document.body.removeChild(dragPreview);
      });
    },
    [],
  );

  const handleDragEnd = useCallback(() => {
    setDraggedId(null);
    setDragOverIndex(null);
    draggedIndexRef.current = null;
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedIndexRef.current !== null && index !== draggedIndexRef.current) {
      setDragOverIndex(index);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    const relatedTarget = e.relatedTarget as HTMLElement;
    if (!relatedTarget?.closest('[data-drop-zone]')) {
      setDragOverIndex(null);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, targetIndex: number) => {
      e.preventDefault();
      const sourceIndex = draggedIndexRef.current;
      if (
        sourceIndex === null ||
        sourceIndex === targetIndex ||
        !onConfigChange
      ) {
        handleDragEnd();
        return;
      }

      // Reorder visible widgets, keep hidden widgets in place
      const newVisible = [...visibleWidgets];
      const [movedWidget] = newVisible.splice(sourceIndex, 1);
      newVisible.splice(targetIndex, 0, movedWidget);

      const hidden = config.filter((w) => !w.visible);
      onConfigChange([...newVisible, ...hidden]);
      handleDragEnd();
    },
    [visibleWidgets, config, onConfigChange, handleDragEnd],
  );

  // If no config provided, render the original static layout
  if (!widgetConfig || widgetConfig.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          'grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3',
          className,
        )}
      >
        {renderWidget(
          'jobs',
          data,
          'small',
          isLayoutMode,
          contentCallbacks,
          customWidgetCallbacks,
        )}
        {renderWidget(
          'pains',
          data,
          'small',
          isLayoutMode,
          contentCallbacks,
          customWidgetCallbacks,
        )}
        {renderWidget(
          'gains',
          data,
          'small',
          isLayoutMode,
          contentCallbacks,
          customWidgetCallbacks,
        )}
        {renderWidget(
          'socialValues',
          data,
          'small',
          isLayoutMode,
          contentCallbacks,
          customWidgetCallbacks,
        )}
        {renderWidget(
          'motivationsBehaviours',
          data,
          'small',
          isLayoutMode,
          contentCallbacks,
          customWidgetCallbacks,
        )}
        {renderWidget(
          'keyFacts',
          data,
          'small',
          isLayoutMode,
          contentCallbacks,
          customWidgetCallbacks,
        )}
        <div className='md:col-span-2 xl:col-span-3'>
          {renderWidget(
            'timeline',
            data,
            'full',
            isLayoutMode,
            contentCallbacks,
            customWidgetCallbacks,
          )}
        </div>
      </motion.div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Visible widgets grid */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {visibleWidgets.map((widgetCfg, index) => {
          const isDragging = draggedId === widgetCfg.id;
          const isDropTarget =
            dragOverIndex === index && draggedId !== null && !isDragging;

          return (
            <div
              key={widgetCfg.id}
              data-drop-zone
              className={cn(
                'relative transition-all duration-200',
                sizeColSpanClass[widgetCfg.size],
              )}
              onDragOver={
                isLayoutMode ? (e) => handleDragOver(e, index) : undefined
              }
              onDragLeave={isLayoutMode ? handleDragLeave : undefined}
              onDrop={isLayoutMode ? (e) => handleDrop(e, index) : undefined}
            >
              {/* Drop indicator */}
              <AnimatePresence>
                {isDropTarget && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className='aucctus-border-brand pointer-events-none absolute -inset-1 z-20 rounded-xl border-2 border-dashed bg-blue-50/50 dark:bg-blue-950/20'
                  >
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <div className='aucctus-bg-brand-solid rounded-full px-3 py-1.5 text-xs font-medium text-white shadow-lg'>
                        Drop here
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Widget container */}
              <div
                className={cn(
                  'relative h-full transition-all duration-200',
                  isDragging && 'scale-95 opacity-40 ring-2 ring-blue-300/30',
                )}
              >
                {/* Edit overlay - no background darkening, controls only */}
                {isLayoutMode && (
                  <div className='pointer-events-none absolute inset-0 z-10'>
                    {/* Hover dashed border */}
                    <div className='group/edit pointer-events-auto absolute inset-0'>
                      <div className='pointer-events-none absolute inset-0 rounded-xl border-2 border-transparent transition-all group-hover/edit:border-dashed group-hover/edit:border-gray-300 dark:group-hover/edit:border-gray-600' />
                    </div>

                    {/* Top-left: drag handle + hide button */}
                    <div className='pointer-events-auto absolute left-2 top-2 flex items-center gap-1'>
                      <div
                        draggable
                        onDragStart={(e) =>
                          handleDragStart(
                            e as unknown as React.DragEvent,
                            widgetCfg,
                            index,
                          )
                        }
                        onDragEnd={handleDragEnd}
                        className='flex h-7 w-7 items-center justify-center rounded-md bg-gray-900/80 text-white shadow-md transition-colors hover:bg-gray-900 dark:bg-white/80 dark:text-gray-900 dark:hover:bg-white'
                        title='Drag to reorder'
                        style={{
                          cursor: isDragging ? 'grabbing' : 'grab',
                        }}
                      >
                        <GripVertical className='h-3.5 w-3.5' />
                      </div>
                      <button
                        type='button'
                        onClick={() => handleToggleVisibility(widgetCfg.id)}
                        className='flex h-7 w-7 items-center justify-center rounded-md bg-gray-900/80 text-white shadow-md transition-colors hover:bg-red-600 dark:bg-white/80 dark:text-gray-900 dark:hover:bg-red-400'
                        title='Hide widget'
                      >
                        <EyeOff className='h-3.5 w-3.5' />
                      </button>
                    </div>

                    {/* Top-right: delete button for custom widgets only */}
                    {widgetCfg.id.startsWith('custom-') &&
                      customWidgetCallbacks?.onDeleteCustomWidget && (
                        <div className='pointer-events-auto absolute right-2 top-2'>
                          {confirmDeleteId === widgetCfg.id ? (
                            <div className='flex items-center gap-1 rounded-md bg-red-600/90 px-2 py-1 shadow-md'>
                              <span className='text-xs font-medium text-white'>
                                Delete?
                              </span>
                              <button
                                type='button'
                                onClick={() => {
                                  customWidgetCallbacks.onDeleteCustomWidget!(
                                    widgetCfg.id.replace('custom-', ''),
                                  );
                                  setConfirmDeleteId(null);
                                }}
                                className='flex h-5 w-5 items-center justify-center rounded text-white hover:bg-red-700'
                                title='Confirm delete'
                              >
                                <Check className='h-3 w-3' />
                              </button>
                              <button
                                type='button'
                                onClick={() => setConfirmDeleteId(null)}
                                className='flex h-5 w-5 items-center justify-center rounded text-white hover:bg-red-700'
                                title='Cancel'
                              >
                                <X className='h-3 w-3' />
                              </button>
                            </div>
                          ) : (
                            <button
                              type='button'
                              onClick={() => setConfirmDeleteId(widgetCfg.id)}
                              className='flex h-7 w-7 items-center justify-center rounded-md bg-red-600/80 text-white shadow-md transition-colors hover:bg-red-700 dark:bg-red-500/80 dark:hover:bg-red-600'
                              title='Delete widget'
                            >
                              <Trash2 className='h-3.5 w-3.5' />
                            </button>
                          )}
                        </div>
                      )}

                    {/* Bottom-right: size selector */}
                    <div className='pointer-events-auto absolute bottom-2 right-2 flex items-center gap-1'>
                      {sizeOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type='button'
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleSizeChange(widgetCfg.id, opt.value);
                          }}
                          className={cn(
                            'rounded-md px-2 py-1 text-[11px] font-medium shadow-sm transition-colors',
                            widgetCfg.size === opt.value
                              ? 'aucctus-bg-brand-solid text-white'
                              : 'bg-gray-900/80 text-white hover:bg-gray-900 dark:bg-white/80 dark:text-gray-900 dark:hover:bg-white',
                          )}
                          title={`Set width to ${opt.label.toLowerCase()}`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Widget content */}
                {renderWidget(
                  widgetCfg.id,
                  data,
                  widgetCfg.size,
                  isLayoutMode,
                  contentCallbacks,
                  customWidgetCallbacks,
                )}
              </div>
            </div>
          );
        })}

        {/* Drop-at-end slot (only visible while dragging) */}
        {isLayoutMode && draggedId && (
          <div
            data-drop-zone
            className='relative h-48 transition-all duration-200 md:col-span-1'
            onDragOver={(e) => handleDragOver(e, visibleWidgets.length)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, visibleWidgets.length)}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{
                opacity: dragOverIndex === visibleWidgets.length ? 1 : 0.5,
              }}
              className={cn(
                'flex h-full items-center justify-center rounded-xl border-2 border-dashed transition-colors duration-200',
                dragOverIndex === visibleWidgets.length
                  ? 'aucctus-border-brand bg-blue-50/50 dark:bg-blue-950/20'
                  : 'border-gray-200 bg-gray-50/50 dark:border-gray-700 dark:bg-gray-900/20',
              )}
            >
              <span
                className={cn(
                  'text-sm font-medium transition-colors',
                  dragOverIndex === visibleWidgets.length
                    ? 'aucctus-text-brand-primary'
                    : 'aucctus-text-tertiary',
                )}
              >
                Drop at end
              </span>
            </motion.div>
          </div>
        )}
      </div>

      {/* Hidden widgets section (only in edit mode) - rendered with blur overlay */}
      {isLayoutMode && hiddenWidgets.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <h4 className='aucctus-text-xs-bold aucctus-text-tertiary mb-3 uppercase tracking-wider'>
            Hidden Widgets
          </h4>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
            <AnimatePresence>
              {hiddenWidgets.map((widgetCfg) => (
                <motion.div
                  key={widgetCfg.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className={cn('relative', sizeColSpanClass[widgetCfg.size])}
                >
                  {/* Blur overlay with restore button */}
                  <div
                    className='absolute inset-0 z-10 flex cursor-pointer items-center justify-center rounded-xl bg-white/60 backdrop-blur-[2px] transition-colors hover:bg-white/40 dark:bg-black/60 dark:hover:bg-black/40'
                    onClick={() => handleToggleVisibility(widgetCfg.id)}
                    role='button'
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        handleToggleVisibility(widgetCfg.id);
                      }
                    }}
                  >
                    <div className='aucctus-bg-brand-solid flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-white shadow-lg'>
                      <Plus className='h-4 w-4' />
                      Restore Widget
                    </div>
                  </div>
                  {/* Widget preview (muted, non-interactive) */}
                  <div className='pointer-events-none opacity-50'>
                    {renderWidget(
                      widgetCfg.id,
                      data,
                      widgetCfg.size,
                      false,
                      contentCallbacks,
                      customWidgetCallbacks,
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PersonaWidgetGrid;

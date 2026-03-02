/**
 * OverviewWidgetGrid - Grid layout for overview widgets with edit mode
 *
 * Orchestrates all nucleus overview widgets in a responsive 3-column grid.
 * Supports edit mode with:
 * - Drag-and-drop reordering (HTML5 DnD)
 * - Visibility toggles per widget (eye-off icon, top-left)
 * - Size selector per widget (Third / Half / Full, bottom-right)
 * - Delete button per widget (top-right, with confirmation)
 * - Hidden widgets shown at bottom with blur overlay + restore
 *
 * Follows the same pattern as PersonaWidgetGrid from Living Personas.
 */

import { motion, AnimatePresence } from 'framer-motion';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { Check, GripVertical, EyeOff, Plus, Trash2, X } from 'lucide-react';
import { cn } from '@libs/utils/react';
import type { INucleusOverviewWidget } from '@libs/api/types/nucleusOverview';

import ChecklistWidget from './widgets/ChecklistWidget';
import CompanyThesisWidget from './widgets/CompanyThesisWidget';
import InnovationHorizonsWidget from './widgets/InnovationHorizonsWidget';
import MustWinPrioritiesWidget from './widgets/MustWinPrioritiesWidget';
import NonNegotiablesWidget from './widgets/NonNegotiablesWidget';
import StrategicPillarsWidget from './widgets/StrategicPillarsWidget';

/** Widget configuration item */
export interface OverviewWidgetConfig {
  id: string;
  label: string;
  visible: boolean;
  size: 'small' | 'medium' | 'full';
}

/** Item editing callbacks */
export interface OverviewWidgetItemCallbacks {
  /** Whether inline editing is enabled */
  isEditable?: boolean;
  /** Add an item to a widget */
  onAddItem?: (widgetUuid: string, data: Record<string, unknown>) => void;
  /** Update an item within a widget */
  onUpdateItem?: (
    widgetUuid: string,
    itemUuid: string,
    data: Record<string, unknown>,
  ) => void;
  /** Delete an item from a widget */
  onDeleteItem?: (widgetUuid: string, itemUuid: string) => void;
  /** Update widget-level fields (title, description) */
  onUpdateWidget?: (widgetUuid: string, data: Record<string, unknown>) => void;
}

/** Props for the OverviewWidgetGrid component */
export interface OverviewWidgetGridProps extends OverviewWidgetItemCallbacks {
  /** Overview widgets from the API */
  widgets: INucleusOverviewWidget[];
  /** Brand colors for themed widgets */
  brandColors: Record<string, string>;
  /** Whether layout mode is active (drag, hide, resize widgets) */
  isLayoutMode?: boolean;
  /** Widget configuration */
  widgetConfig?: OverviewWidgetConfig[];
  /** Callback when widget configuration changes */
  onConfigChange?: (config: OverviewWidgetConfig[]) => void;
  /** Callback to delete a widget via API */
  onDeleteWidget?: (widgetUuid: string) => void;
  /** Whether a background sync is in progress */
  isSyncing?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/** Size to col-span mapping */
const sizeColSpanClass: Record<string, string> = {
  small: '',
  medium: 'md:col-span-2',
  full: 'md:col-span-2 xl:col-span-3',
};

/** Size options matching Living Personas design: Third / Half / Full */
const sizeOptions: Array<{
  value: 'small' | 'medium' | 'full';
  label: string;
}> = [
  { value: 'small', label: 'Third' },
  { value: 'medium', label: 'Half' },
  { value: 'full', label: 'Full' },
];

/** Get the default grid size for a widget based on its type */
export const getDefaultWidgetSize = (
  widget: INucleusOverviewWidget,
): 'small' | 'medium' | 'full' => {
  switch (widget.widgetType) {
    case 'thesis':
      return 'full';
    case 'card_list':
      return 'medium';
    default:
      return 'small';
  }
};

/** Build default widget config from API widget data */
export const buildDefaultOverviewConfig = (
  widgets: INucleusOverviewWidget[],
): OverviewWidgetConfig[] => {
  return widgets.map((w) => ({
    id: w.uuid,
    label: w.title,
    visible: true,
    size: getDefaultWidgetSize(w),
  }));
};

/** Render a widget based on its type */
const renderOverviewWidget = (
  widget: INucleusOverviewWidget,
  brandColors: Record<string, string>,
  itemCallbacks?: OverviewWidgetItemCallbacks,
): React.ReactNode => {
  const { isEditable, onAddItem, onUpdateItem, onDeleteItem, onUpdateWidget } =
    itemCallbacks ?? {};

  switch (widget.widgetType) {
    case 'thesis':
      return (
        <CompanyThesisWidget
          widget={widget}
          brandColors={brandColors}
          isEditable={isEditable}
          onUpdateWidget={onUpdateWidget}
        />
      );
    case 'accordion':
      return (
        <StrategicPillarsWidget
          widget={widget}
          brandColors={brandColors}
          isEditable={isEditable}
          onAddItem={onAddItem}
          onUpdateItem={onUpdateItem}
          onDeleteItem={onDeleteItem}
          onUpdateWidget={onUpdateWidget}
        />
      );
    case 'card_list':
      return (
        <MustWinPrioritiesWidget
          widget={widget}
          brandColors={brandColors}
          isEditable={isEditable}
          onAddItem={onAddItem}
          onUpdateItem={onUpdateItem}
          onDeleteItem={onDeleteItem}
          onUpdateWidget={onUpdateWidget}
        />
      );
    case 'checklist':
      return (
        <ChecklistWidget
          widget={widget}
          brandColors={brandColors}
          isEditable={isEditable}
          onAddItem={onAddItem}
          onUpdateItem={onUpdateItem}
          onDeleteItem={onDeleteItem}
          onUpdateWidget={onUpdateWidget}
        />
      );
    case 'constrained_text':
      return (
        <NonNegotiablesWidget
          widget={widget}
          brandColors={brandColors}
          isEditable={isEditable}
          onAddItem={onAddItem}
          onUpdateItem={onUpdateItem}
          onDeleteItem={onDeleteItem}
          onUpdateWidget={onUpdateWidget}
        />
      );
    case 'visualization':
      return (
        <InnovationHorizonsWidget
          widget={widget}
          brandColors={brandColors}
          isEditable={isEditable}
          onAddItem={onAddItem}
          onUpdateItem={onUpdateItem}
          onDeleteItem={onDeleteItem}
          onUpdateWidget={onUpdateWidget}
        />
      );
    default:
      return null;
  }
};

/** Fallback static layout (matches original OverviewTab hardcoded grid) */
const StaticOverviewGrid: React.FC<{
  widgets: INucleusOverviewWidget[];
  brandColors: Record<string, string>;
  className?: string;
}> = ({ widgets, brandColors, className }) => {
  const thesis = widgets.find((w) => w.widgetType === 'thesis');
  const accordion = widgets.find((w) => w.widgetType === 'accordion');
  const cardList = widgets.find((w) => w.widgetType === 'card_list');
  const remaining = widgets.filter(
    (w) =>
      w.widgetType !== 'thesis' &&
      w.widgetType !== 'accordion' &&
      w.widgetType !== 'card_list',
  );
  const row3 = remaining.slice(0, 3);
  const row4 = remaining.slice(3);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3',
        className,
      )}
    >
      {thesis && (
        <div className='col-span-full'>
          {renderOverviewWidget(thesis, brandColors)}
        </div>
      )}
      {accordion && <div>{renderOverviewWidget(accordion, brandColors)}</div>}
      {cardList && (
        <div className='lg:col-span-2'>
          {renderOverviewWidget(cardList, brandColors)}
        </div>
      )}
      {row3.map((widget) => (
        <div key={widget.uuid}>{renderOverviewWidget(widget, brandColors)}</div>
      ))}
      {row4.length > 0 && (
        <div className='col-span-full flex flex-col gap-4 lg:flex-row'>
          {row4.map((widget) => (
            <div key={widget.uuid} className='w-full lg:w-1/2'>
              {renderOverviewWidget(widget, brandColors)}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

/**
 * OverviewWidgetGrid Component
 */
const OverviewWidgetGrid: React.FC<OverviewWidgetGridProps> = ({
  widgets,
  brandColors,
  isLayoutMode = false,
  widgetConfig,
  onConfigChange,
  onDeleteWidget,
  isEditable,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onUpdateWidget,
  isSyncing = false,
  className,
}) => {
  const itemCallbacks = useMemo<OverviewWidgetItemCallbacks>(
    () => ({
      isEditable,
      onAddItem,
      onUpdateItem,
      onDeleteItem,
      onUpdateWidget,
    }),
    [isEditable, onAddItem, onUpdateItem, onDeleteItem, onUpdateWidget],
  );
  const config = useMemo(() => widgetConfig ?? [], [widgetConfig]);
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

  // Delete confirmation state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Widget lookup by UUID
  const widgetMap = useMemo(() => {
    const map = new Map<string, INucleusOverviewWidget>();
    for (const w of widgets) {
      map.set(w.uuid, w);
    }
    return map;
  }, [widgets]);

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
    (e: React.DragEvent, widgetCfg: OverviewWidgetConfig, index: number) => {
      setDraggedId(widgetCfg.id);
      draggedIndexRef.current = index;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', widgetCfg.id);

      const dragPreview = document.createElement('div');
      dragPreview.textContent = widgetCfg.label;
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
      <StaticOverviewGrid
        widgets={widgets}
        brandColors={brandColors}
        className={className}
      />
    );
  }

  return (
    <div className={cn('relative space-y-4', className)}>
      {/* Syncing indicator */}
      <AnimatePresence>
        {isSyncing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='absolute -top-2 right-0 z-30 flex items-center gap-1.5'
          >
            <div className='h-1.5 w-1.5 animate-pulse rounded-full bg-blue-500' />
            <span className='aucctus-text-tertiary text-[10px]'>Syncing</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visible widgets grid */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {visibleWidgets.map((widgetCfg, index) => {
          const isDragging = draggedId === widgetCfg.id;
          const isDropTarget =
            dragOverIndex === index && draggedId !== null && !isDragging;
          const widget = widgetMap.get(widgetCfg.id);

          if (!widget) return null;

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
                {/* Edit overlay - controls only */}
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

                    {/* Top-right: delete button */}
                    {onDeleteWidget && (
                      <div className='pointer-events-auto absolute right-2 top-2'>
                        {confirmDeleteId === widgetCfg.id ? (
                          <div className='flex items-center gap-1 rounded-md bg-red-600/90 px-2 py-1 shadow-md'>
                            <span className='text-xs font-medium text-white'>
                              Delete?
                            </span>
                            <button
                              type='button'
                              onClick={() => {
                                onDeleteWidget(widgetCfg.id);
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
                {renderOverviewWidget(widget, brandColors, itemCallbacks)}
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

      {/* Hidden widgets section (only in edit mode) */}
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
              {hiddenWidgets.map((widgetCfg) => {
                const widget = widgetMap.get(widgetCfg.id);
                if (!widget) return null;

                return (
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
                      {renderOverviewWidget(widget, brandColors, itemCallbacks)}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default OverviewWidgetGrid;

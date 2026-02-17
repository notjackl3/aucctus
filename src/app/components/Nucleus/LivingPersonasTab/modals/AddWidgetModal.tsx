/**
 * AddWidgetModal - Modal for adding new widgets to a persona
 *
 * Allows users to select a widget type and configure it:
 * - Widget type selection grid with icons
 * - Widget name input (after type selection)
 * - Icon picker
 * - Type-specific config (chart type for metric_chart, scale labels for card_list)
 * - Inline data point builder for metric_chart with live mini-preview
 * - Apply to: This Persona Only / All Personas
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart2,
  CalendarDays,
  Hash,
  List,
  PieChart,
  Plus,
  TrendingDown,
  TrendingUp,
  User,
  Users,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { LiquidGlassModal, LiquidGlassModalFooter } from '@components';
import { cn } from '@libs/utils/react';
import type {
  CustomWidgetType,
  ICreateCustomWidgetPayload,
  ICreateWidgetItemPayload,
  ICustomWidget,
  MetricChartType,
  TrendDirection,
} from '@libs/api/types/persona';
import WidgetIconPicker from '../widgets/WidgetIconPicker';

/** Color palette for mini pie preview (matches MetricChartWidget) */
const PIE_COLORS = [
  '#6366f1',
  '#f59e0b',
  '#10b981',
  '#ef4444',
  '#8b5cf6',
  '#ec4899',
  '#14b8a6',
  '#f97316',
  '#3b82f6',
  '#84cc16',
];

/** Props for the AddWidgetModal component */
export interface AddWidgetModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when the modal should close */
  onOpenChange: (open: boolean) => void;
  /** Persona UUID to add widget to */
  personaUuid: string;
  /** Callback to create the widget via API */
  onCreateWidget?: (
    data: ICreateCustomWidgetPayload,
  ) => Promise<ICustomWidget[]>;
  /** Callback when widget is successfully added */
  onSuccess?: () => void;
}

/** Available widget types - aligned with backend CustomWidgetType */
export type WidgetType = CustomWidgetType;

/** Widget type configuration */
interface WidgetTypeConfig {
  type: WidgetType;
  label: string;
  description: string;
  icon: LucideIcon;
}

/** Available widget types */
const widgetTypes: WidgetTypeConfig[] = [
  {
    type: 'card_list',
    label: 'Card List',
    description: 'Ranked list of items with priority indicators',
    icon: List,
  },
  {
    type: 'stat_list',
    label: 'Stats List',
    description: 'Grid of statistical facts with trends',
    icon: Hash,
  },
  {
    type: 'metric_chart',
    label: 'Metric Chart',
    description: 'Bar or pie chart for distributions',
    icon: BarChart2,
  },
  {
    type: 'timeline',
    label: 'Timeline',
    description: 'Horizontal journey or daily timeline',
    icon: CalendarDays,
  },
];

/** Apply to options */
type ApplyTo = 'this-persona' | 'all-personas';

/** Pending item for widget initialization — fields used depend on widget type */
interface PendingItem {
  id: number;
  // MetricChart
  label?: string;
  magnitude?: number;
  unit?: string;
  // Timeline
  title?: string;
  description?: string;
  // StatList
  trend?: TrendDirection;
}

/**
 * MiniChartPreview - Small preview of pending data points
 */
const MiniChartPreview: React.FC<{
  items: PendingItem[];
  chartType: MetricChartType;
}> = ({ items, chartType }) => {
  const maxMagnitude = Math.max(...items.map((i) => i.magnitude ?? 0), 1);
  const totalMagnitude = items.reduce((sum, i) => sum + (i.magnitude ?? 0), 0);

  const conicGradient = useMemo(() => {
    if (totalMagnitude === 0) return 'conic-gradient(#e5e7eb 0deg 360deg)';
    let currentDeg = 0;
    const stops: string[] = [];
    items.forEach((item, idx) => {
      const color = PIE_COLORS[idx % PIE_COLORS.length];
      const sliceDeg = ((item.magnitude ?? 0) / totalMagnitude) * 360;
      stops.push(`${color} ${currentDeg}deg ${currentDeg + sliceDeg}deg`);
      currentDeg += sliceDeg;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }, [items, totalMagnitude]);

  if (chartType === 'pie') {
    return (
      <div className='flex items-center gap-3'>
        <div
          className='relative h-16 w-16 shrink-0 rounded-full'
          style={{ background: conicGradient }}
        >
          <div className='aucctus-bg-secondary absolute inset-2 rounded-full' />
        </div>
        <div className='min-w-0 space-y-1'>
          {items.map((item, idx) => (
            <div key={item.id} className='flex items-center gap-1.5'>
              <span
                className='h-2 w-2 shrink-0 rounded-full'
                style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
              />
              <span className='aucctus-text-xs aucctus-text-secondary truncate'>
                {item.label}
              </span>
              <span className='aucctus-text-xs-bold aucctus-text-primary ml-auto'>
                {item.magnitude}
                {item.unit ?? ''}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Bar chart preview
  return (
    <div className='space-y-1.5'>
      {items.map((item, idx) => {
        const percentage = ((item.magnitude ?? 0) / maxMagnitude) * 100;
        return (
          <div key={item.id}>
            <div className='mb-0.5 flex items-center justify-between'>
              <span className='aucctus-text-xs aucctus-text-secondary'>
                {item.label}
              </span>
              <span className='aucctus-text-xs-bold aucctus-text-primary'>
                {item.magnitude}
                {item.unit ?? ''}
              </span>
            </div>
            <div className='aucctus-bg-tertiary h-1.5 w-full overflow-hidden rounded-full'>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className='h-full rounded-full'
                style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Shared input class for inline item builders */
const inputClass = cn(
  'rounded-lg border px-2.5 py-1.5',
  'aucctus-bg-secondary aucctus-text-primary',
  'aucctus-border-primary',
  'placeholder:aucctus-text-quaternary',
  'focus:ring-primary/20 focus:outline-none focus:ring-2',
  'aucctus-text-sm',
);

/**
 * AddWidgetModal Component
 */
const AddWidgetModal: React.FC<AddWidgetModalProps> = ({
  open,
  onOpenChange,
  onCreateWidget,
  onSuccess,
}) => {
  const [selectedType, setSelectedType] = useState<WidgetType | null>(null);
  const [widgetName, setWidgetName] = useState('');
  const [widgetDescription, setWidgetDescription] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('bar-chart-3');
  const [chartType, setChartType] = useState<MetricChartType>('bar');
  const [topScaleLabel, setTopScaleLabel] = useState('');
  const [bottomScaleLabel, setBottomScaleLabel] = useState('');
  const [applyTo, setApplyTo] = useState<ApplyTo>('this-persona');
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Inline data builder state (shared across widget types)
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [dpLabel, setDpLabel] = useState('');
  const [dpMagnitude, setDpMagnitude] = useState('');
  const [dpUnit, setDpUnit] = useState('%');
  const [dpTitle, setDpTitle] = useState('');
  const [dpDescription, setDpDescription] = useState('');
  const [dpTrend, setDpTrend] = useState<TrendDirection>('neutral');
  const [nextDpId, setNextDpId] = useState(1);

  const isValid = selectedType && widgetName.trim().length > 0;

  // Reset state when modal closes
  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        setSelectedType(null);
        setWidgetName('');
        setWidgetDescription('');
        setSelectedIcon('bar-chart-3');
        setChartType('bar');
        setTopScaleLabel('');
        setBottomScaleLabel('');
        setApplyTo('this-persona');
        setError(null);
        setIsAdding(false);
        setPendingItems([]);
        setDpLabel('');
        setDpMagnitude('');
        setDpUnit('%');
        setDpTitle('');
        setDpDescription('');
        setDpTrend('neutral');
        setNextDpId(1);
      }
      onOpenChange(newOpen);
    },
    [onOpenChange],
  );

  // Handle type selection
  const handleTypeSelect = useCallback((type: WidgetType) => {
    setSelectedType(type);
    const config = widgetTypes.find((w) => w.type === type);
    if (config) {
      setWidgetName(config.label);
    }
    // Set sensible default icons per type
    if (type === 'metric_chart') setSelectedIcon('bar-chart-3');
    else if (type === 'timeline') setSelectedIcon('clock');
    else if (type === 'card_list') setSelectedIcon('list');
    else if (type === 'stat_list') setSelectedIcon('hash');
    // Reset data points when switching types
    setPendingItems([]);
  }, []);

  // Add a pending item (type-aware)
  const handleAddPendingItem = useCallback(() => {
    if (selectedType === 'metric_chart') {
      if (!dpLabel.trim() || !dpMagnitude.trim()) return;
      const magnitude = parseFloat(dpMagnitude);
      if (isNaN(magnitude)) return;
      setPendingItems((prev) => [
        ...prev,
        { id: nextDpId, label: dpLabel.trim(), magnitude, unit: dpUnit.trim() },
      ]);
      setDpLabel('');
      setDpMagnitude('');
    } else if (selectedType === 'timeline') {
      if (!dpLabel.trim() || !dpTitle.trim()) return;
      setPendingItems((prev) => [
        ...prev,
        {
          id: nextDpId,
          label: dpLabel.trim(),
          title: dpTitle.trim(),
          description: dpDescription.trim(),
        },
      ]);
      setDpLabel('');
      setDpTitle('');
      setDpDescription('');
    } else if (selectedType === 'card_list') {
      if (!dpTitle.trim()) return;
      setPendingItems((prev) => [
        ...prev,
        {
          id: nextDpId,
          title: dpTitle.trim(),
          description: dpDescription.trim(),
        },
      ]);
      setDpTitle('');
      setDpDescription('');
    } else if (selectedType === 'stat_list') {
      if (!dpTitle.trim()) return;
      setPendingItems((prev) => [
        ...prev,
        {
          id: nextDpId,
          title: dpTitle.trim(),
          description: dpDescription.trim(),
          trend: dpTrend,
        },
      ]);
      setDpTitle('');
      setDpDescription('');
      setDpTrend('neutral');
    }
    setNextDpId((prev) => prev + 1);
  }, [
    selectedType,
    dpLabel,
    dpMagnitude,
    dpUnit,
    dpTitle,
    dpDescription,
    dpTrend,
    nextDpId,
  ]);

  const handleItemKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddPendingItem();
      }
    },
    [handleAddPendingItem],
  );

  const removePendingItem = useCallback((id: number) => {
    setPendingItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Handle add action
  const handleAdd = useCallback(async () => {
    if (!isValid || isAdding || !selectedType) return;

    setError(null);
    setIsAdding(true);

    try {
      const payload: ICreateCustomWidgetPayload = {
        widgetType: selectedType,
        title: widgetName.trim(),
        icon: selectedIcon,
      };

      if (selectedType === 'metric_chart') {
        payload.chartType = chartType;
        if (widgetDescription.trim()) {
          payload.description = widgetDescription.trim();
        }
      }

      // Include initial items for all widget types
      if (pendingItems.length > 0) {
        payload.initialItems = pendingItems.map(
          (item): ICreateWidgetItemPayload => {
            if (selectedType === 'metric_chart') {
              return {
                label: item.label,
                magnitude: item.magnitude,
                unit: item.unit,
              };
            }
            if (selectedType === 'timeline') {
              return {
                label: item.label,
                title: item.title,
                description: item.description,
              };
            }
            if (selectedType === 'stat_list') {
              return {
                title: item.title,
                description: item.description,
                trend: item.trend,
              };
            }
            // card_list
            return { title: item.title, description: item.description };
          },
        );
      }

      if (selectedType === 'card_list') {
        if (topScaleLabel.trim()) payload.topScaleLabel = topScaleLabel.trim();
        if (bottomScaleLabel.trim())
          payload.bottomScaleLabel = bottomScaleLabel.trim();
      }

      if (onCreateWidget) {
        await onCreateWidget(payload);
      }

      onSuccess?.();
      handleOpenChange(false);
    } catch {
      setError('Failed to add widget. Please try again.');
      setIsAdding(false);
    }
  }, [
    isValid,
    isAdding,
    selectedType,
    widgetName,
    widgetDescription,
    selectedIcon,
    chartType,
    pendingItems,
    topScaleLabel,
    bottomScaleLabel,
    onCreateWidget,
    onSuccess,
    handleOpenChange,
  ]);

  return (
    <LiquidGlassModal
      open={open}
      onOpenChange={handleOpenChange}
      size='md'
      title='Add Widget'
      description='Choose a widget type to add to this persona'
    >
      <div className='space-y-6 p-6'>
        {/* Error message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className='rounded-lg bg-error-50 p-3 dark:bg-error-900/30'
          >
            <p className='aucctus-text-sm text-error-700 dark:text-error-300'>
              {error}
            </p>
          </motion.div>
        )}

        {/* Widget type selection grid */}
        <div>
          <span className='aucctus-text-sm-medium aucctus-text-primary mb-3 block'>
            Widget Type
          </span>
          <div className='grid grid-cols-2 gap-3'>
            {widgetTypes.map((widget, index) => (
              <motion.button
                key={widget.type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.05, 0.3) }}
                type='button'
                onClick={() => handleTypeSelect(widget.type)}
                className={cn(
                  'rounded-lg border-2 p-4 text-left transition-all',
                  'hover:aucctus-bg-tertiary',
                  selectedType === widget.type
                    ? 'aucctus-border-brand aucctus-bg-brand-secondary'
                    : 'aucctus-border-secondary aucctus-bg-secondary',
                )}
              >
                <div className='flex items-start gap-3'>
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                      selectedType === widget.type
                        ? 'aucctus-bg-brand-solid text-white'
                        : 'aucctus-bg-tertiary aucctus-text-secondary',
                    )}
                  >
                    <widget.icon size={20} />
                  </div>
                  <div className='min-w-0'>
                    <p
                      className={cn(
                        'aucctus-text-sm-bold mb-0.5',
                        selectedType === widget.type
                          ? 'aucctus-text-brand-primary'
                          : 'aucctus-text-primary',
                      )}
                    >
                      {widget.label}
                    </p>
                    <p className='aucctus-text-xs aucctus-text-tertiary line-clamp-2'>
                      {widget.description}
                    </p>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Config section (shown after type selection) */}
        <AnimatePresence>
          {selectedType && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className='space-y-5'
            >
              {/* Widget name input */}
              <label className='block'>
                <span className='aucctus-text-sm-medium aucctus-text-primary mb-2 block'>
                  Widget Name
                </span>
                <input
                  type='text'
                  value={widgetName}
                  onChange={(e) => setWidgetName(e.target.value)}
                  placeholder='Enter widget name...'
                  className={cn(
                    'w-full rounded-lg border px-3 py-2',
                    'aucctus-bg-secondary aucctus-text-primary',
                    'aucctus-border-primary',
                    'placeholder:aucctus-text-quaternary',
                    'focus:ring-primary/20 focus:outline-none focus:ring-2',
                    'aucctus-text-sm',
                  )}
                />
              </label>

              {/* Widget description (metric_chart only) */}
              {selectedType === 'metric_chart' && (
                <label className='block'>
                  <span className='aucctus-text-sm-medium aucctus-text-primary mb-2 block'>
                    Description
                    <span className='aucctus-text-xs aucctus-text-tertiary ml-1.5 font-normal'>
                      (optional)
                    </span>
                  </span>
                  <input
                    type='text'
                    value={widgetDescription}
                    onChange={(e) => setWidgetDescription(e.target.value)}
                    placeholder='Brief description of what this chart shows...'
                    className={cn(
                      'w-full rounded-lg border px-3 py-2',
                      'aucctus-bg-secondary aucctus-text-primary',
                      'aucctus-border-primary',
                      'placeholder:aucctus-text-quaternary',
                      'focus:ring-primary/20 focus:outline-none focus:ring-2',
                      'aucctus-text-sm',
                    )}
                  />
                </label>
              )}

              {/* Icon picker */}
              <div>
                <span className='aucctus-text-sm-medium aucctus-text-primary mb-2 block'>
                  Icon
                </span>
                <WidgetIconPicker
                  value={selectedIcon}
                  onChange={setSelectedIcon}
                />
              </div>

              {/* Metric chart type selector */}
              {selectedType === 'metric_chart' && (
                <div>
                  <span className='aucctus-text-sm-medium aucctus-text-primary mb-2 block'>
                    Chart Type
                  </span>
                  <div className='flex gap-3'>
                    <button
                      type='button'
                      onClick={() => setChartType('bar')}
                      className={cn(
                        'flex-1 rounded-lg border-2 px-4 py-3 text-left transition-all',
                        chartType === 'bar'
                          ? 'aucctus-border-brand aucctus-bg-brand-secondary'
                          : 'aucctus-border-secondary aucctus-bg-secondary hover:aucctus-bg-tertiary',
                      )}
                    >
                      <div className='flex items-center gap-2'>
                        <BarChart2
                          size={16}
                          className={cn(
                            chartType === 'bar'
                              ? 'aucctus-text-brand-primary'
                              : 'aucctus-text-secondary',
                          )}
                        />
                        <span
                          className={cn(
                            'aucctus-text-sm-medium',
                            chartType === 'bar'
                              ? 'aucctus-text-brand-primary'
                              : 'aucctus-text-primary',
                          )}
                        >
                          Bar
                        </span>
                      </div>
                    </button>
                    <button
                      type='button'
                      onClick={() => setChartType('pie')}
                      className={cn(
                        'flex-1 rounded-lg border-2 px-4 py-3 text-left transition-all',
                        chartType === 'pie'
                          ? 'aucctus-border-brand aucctus-bg-brand-secondary'
                          : 'aucctus-border-secondary aucctus-bg-secondary hover:aucctus-bg-tertiary',
                      )}
                    >
                      <div className='flex items-center gap-2'>
                        <PieChart
                          size={16}
                          className={cn(
                            chartType === 'pie'
                              ? 'aucctus-text-brand-primary'
                              : 'aucctus-text-secondary',
                          )}
                        />
                        <span
                          className={cn(
                            'aucctus-text-sm-medium',
                            chartType === 'pie'
                              ? 'aucctus-text-brand-primary'
                              : 'aucctus-text-primary',
                          )}
                        >
                          Pie
                        </span>
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Inline item builder — shown for all widget types */}
              <div>
                <span className='aucctus-text-sm-medium aucctus-text-primary mb-2 block'>
                  {selectedType === 'metric_chart'
                    ? 'Data Points'
                    : selectedType === 'timeline'
                      ? 'Timeline Entries'
                      : selectedType === 'stat_list'
                        ? 'Stats'
                        : 'Items'}
                  <span className='aucctus-text-xs aucctus-text-tertiary ml-1.5 font-normal'>
                    (optional)
                  </span>
                </span>

                {/* Pending items list */}
                <AnimatePresence mode='popLayout'>
                  {pendingItems.map((item, idx) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20, height: 0 }}
                      transition={{ duration: 0.15 }}
                      className='mb-1.5 flex items-center gap-2'
                    >
                      {selectedType === 'metric_chart' ? (
                        <span
                          className='h-2.5 w-2.5 shrink-0 rounded-full'
                          style={{
                            backgroundColor:
                              PIE_COLORS[idx % PIE_COLORS.length],
                          }}
                        />
                      ) : selectedType === 'stat_list' && item.trend ? (
                        <span className='shrink-0'>
                          {item.trend === 'up' && (
                            <TrendingUp
                              size={12}
                              className='text-emerald-500'
                            />
                          )}
                          {item.trend === 'down' && (
                            <TrendingDown size={12} className='text-red-500' />
                          )}
                          {item.trend === 'neutral' && (
                            <span className='aucctus-text-tertiary text-xs'>
                              —
                            </span>
                          )}
                        </span>
                      ) : (
                        <span className='aucctus-bg-tertiary aucctus-text-xs-bold aucctus-text-secondary flex h-5 w-5 shrink-0 items-center justify-center rounded-full'>
                          {idx + 1}
                        </span>
                      )}
                      <span className='aucctus-text-sm aucctus-text-primary flex-1 truncate'>
                        {selectedType === 'metric_chart'
                          ? item.label
                          : item.title}
                      </span>
                      {selectedType === 'metric_chart' && (
                        <span className='aucctus-text-sm-bold aucctus-text-primary'>
                          {item.magnitude}
                          {item.unit ?? ''}
                        </span>
                      )}
                      {(selectedType === 'timeline' ||
                        selectedType === 'card_list' ||
                        selectedType === 'stat_list') &&
                        item.description && (
                          <span className='aucctus-text-xs aucctus-text-tertiary max-w-[120px] truncate'>
                            {item.description}
                          </span>
                        )}
                      {selectedType === 'timeline' && item.label && (
                        <span className='aucctus-text-xs aucctus-text-tertiary rounded bg-violet-100 px-1.5 py-0.5 dark:bg-violet-900/30'>
                          {item.label}
                        </span>
                      )}
                      <button
                        type='button'
                        onClick={() => removePendingItem(item.id)}
                        className='flex h-5 w-5 shrink-0 items-center justify-center rounded hover:bg-red-100 dark:hover:bg-red-900/30'
                      >
                        <X size={12} className='text-red-500' />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Add item inline form — type-specific fields */}
                <div className='mt-2 flex items-center gap-2'>
                  {selectedType === 'metric_chart' && (
                    <>
                      <input
                        type='text'
                        value={dpLabel}
                        onChange={(e) => setDpLabel(e.target.value)}
                        onKeyDown={handleItemKeyDown}
                        placeholder='Label'
                        className={cn(inputClass, 'flex-1')}
                      />
                      <input
                        type='number'
                        value={dpMagnitude}
                        onChange={(e) => setDpMagnitude(e.target.value)}
                        onKeyDown={handleItemKeyDown}
                        placeholder='Value'
                        className={cn(inputClass, 'w-20')}
                      />
                      <input
                        type='text'
                        value={dpUnit}
                        onChange={(e) => setDpUnit(e.target.value)}
                        onKeyDown={handleItemKeyDown}
                        placeholder='Unit'
                        className={cn(inputClass, 'w-14')}
                      />
                    </>
                  )}
                  {selectedType === 'timeline' && (
                    <>
                      <input
                        type='text'
                        value={dpLabel}
                        onChange={(e) => setDpLabel(e.target.value)}
                        onKeyDown={handleItemKeyDown}
                        placeholder='Time (e.g., Morning)'
                        className={cn(inputClass, 'w-28')}
                      />
                      <input
                        type='text'
                        value={dpTitle}
                        onChange={(e) => setDpTitle(e.target.value)}
                        onKeyDown={handleItemKeyDown}
                        placeholder='Title'
                        className={cn(inputClass, 'flex-1')}
                      />
                      <input
                        type='text'
                        value={dpDescription}
                        onChange={(e) => setDpDescription(e.target.value)}
                        onKeyDown={handleItemKeyDown}
                        placeholder='Desc'
                        className={cn(inputClass, 'w-24')}
                      />
                    </>
                  )}
                  {selectedType === 'card_list' && (
                    <>
                      <input
                        type='text'
                        value={dpTitle}
                        onChange={(e) => setDpTitle(e.target.value)}
                        onKeyDown={handleItemKeyDown}
                        placeholder='Title'
                        className={cn(inputClass, 'flex-1')}
                      />
                      <input
                        type='text'
                        value={dpDescription}
                        onChange={(e) => setDpDescription(e.target.value)}
                        onKeyDown={handleItemKeyDown}
                        placeholder='Description'
                        className={cn(inputClass, 'flex-1')}
                      />
                    </>
                  )}
                  {selectedType === 'stat_list' && (
                    <>
                      <input
                        type='text'
                        value={dpTitle}
                        onChange={(e) => setDpTitle(e.target.value)}
                        onKeyDown={handleItemKeyDown}
                        placeholder='Stat (e.g., 59%)'
                        className={cn(inputClass, 'w-24')}
                      />
                      <input
                        type='text'
                        value={dpDescription}
                        onChange={(e) => setDpDescription(e.target.value)}
                        onKeyDown={handleItemKeyDown}
                        placeholder='Label'
                        className={cn(inputClass, 'flex-1')}
                      />
                      <select
                        value={dpTrend}
                        onChange={(e) =>
                          setDpTrend(e.target.value as TrendDirection)
                        }
                        className={cn(inputClass, 'w-20')}
                      >
                        <option value='neutral'>—</option>
                        <option value='up'>Up</option>
                        <option value='down'>Down</option>
                      </select>
                    </>
                  )}
                  <button
                    type='button'
                    onClick={handleAddPendingItem}
                    disabled={
                      selectedType === 'metric_chart'
                        ? !dpLabel.trim() || !dpMagnitude.trim()
                        : selectedType === 'timeline'
                          ? !dpLabel.trim() || !dpTitle.trim()
                          : !dpTitle.trim()
                    }
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                      (
                        selectedType === 'metric_chart'
                          ? dpLabel.trim() && dpMagnitude.trim()
                          : selectedType === 'timeline'
                            ? dpLabel.trim() && dpTitle.trim()
                            : dpTitle.trim()
                      )
                        ? 'aucctus-bg-brand-solid text-white hover:opacity-90'
                        : 'aucctus-bg-tertiary aucctus-text-quaternary cursor-not-allowed',
                    )}
                  >
                    <Plus size={16} />
                  </button>
                </div>

                {/* Mini chart preview (metric_chart only) */}
                {selectedType === 'metric_chart' && (
                  <AnimatePresence>
                    {pendingItems.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className='aucctus-border-secondary aucctus-bg-secondary mt-3 rounded-lg border p-3'
                      >
                        <span className='aucctus-text-xs aucctus-text-tertiary mb-2 block'>
                          Preview
                        </span>
                        <MiniChartPreview
                          items={pendingItems}
                          chartType={chartType}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                )}
              </div>

              {/* Card list scale labels */}
              {selectedType === 'card_list' && (
                <div className='space-y-3'>
                  <span className='aucctus-text-sm-medium aucctus-text-primary block'>
                    Scale Labels (optional)
                  </span>
                  <div className='flex gap-3'>
                    <input
                      type='text'
                      value={topScaleLabel}
                      onChange={(e) => setTopScaleLabel(e.target.value)}
                      placeholder='Top label (e.g., High Priority)'
                      className={cn(
                        'flex-1 rounded-lg border px-3 py-2',
                        'aucctus-bg-secondary aucctus-text-primary',
                        'aucctus-border-primary',
                        'placeholder:aucctus-text-quaternary',
                        'focus:ring-primary/20 focus:outline-none focus:ring-2',
                        'aucctus-text-sm',
                      )}
                    />
                    <input
                      type='text'
                      value={bottomScaleLabel}
                      onChange={(e) => setBottomScaleLabel(e.target.value)}
                      placeholder='Bottom label (e.g., Low Priority)'
                      className={cn(
                        'flex-1 rounded-lg border px-3 py-2',
                        'aucctus-bg-secondary aucctus-text-primary',
                        'aucctus-border-primary',
                        'placeholder:aucctus-text-quaternary',
                        'focus:ring-primary/20 focus:outline-none focus:ring-2',
                        'aucctus-text-sm',
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Apply to options */}
              <div>
                <span className='aucctus-text-sm-medium aucctus-text-primary mb-2 block'>
                  Apply To
                </span>
                <div className='flex gap-3'>
                  <button
                    type='button'
                    onClick={() => setApplyTo('this-persona')}
                    className={cn(
                      'flex-1 rounded-lg border-2 px-4 py-3 text-left transition-all',
                      applyTo === 'this-persona'
                        ? 'aucctus-border-brand aucctus-bg-brand-secondary'
                        : 'aucctus-border-secondary aucctus-bg-secondary hover:aucctus-bg-tertiary',
                    )}
                  >
                    <div className='flex items-center gap-2'>
                      <User
                        size={16}
                        className={cn(
                          applyTo === 'this-persona'
                            ? 'aucctus-text-brand-primary'
                            : 'aucctus-text-secondary',
                        )}
                      />
                      <span
                        className={cn(
                          'aucctus-text-sm-medium',
                          applyTo === 'this-persona'
                            ? 'aucctus-text-brand-primary'
                            : 'aucctus-text-primary',
                        )}
                      >
                        Only This Persona
                      </span>
                    </div>
                  </button>
                  <button
                    type='button'
                    onClick={() => setApplyTo('all-personas')}
                    className={cn(
                      'flex-1 rounded-lg border-2 px-4 py-3 text-left transition-all',
                      applyTo === 'all-personas'
                        ? 'aucctus-border-brand aucctus-bg-brand-secondary'
                        : 'aucctus-border-secondary aucctus-bg-secondary hover:aucctus-bg-tertiary',
                    )}
                  >
                    <div className='flex items-center gap-2'>
                      <Users
                        size={16}
                        className={cn(
                          applyTo === 'all-personas'
                            ? 'aucctus-text-brand-primary'
                            : 'aucctus-text-secondary',
                        )}
                      />
                      <span
                        className={cn(
                          'aucctus-text-sm-medium',
                          applyTo === 'all-personas'
                            ? 'aucctus-text-brand-primary'
                            : 'aucctus-text-primary',
                        )}
                      >
                        All Personas
                      </span>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <LiquidGlassModalFooter>
        <button
          type='button'
          onClick={() => handleOpenChange(false)}
          disabled={isAdding}
          className='btn btn-ghost btn-md'
        >
          Cancel
        </button>
        <button
          type='button'
          onClick={handleAdd}
          disabled={!isValid || isAdding}
          className='btn btn-primary btn-md'
        >
          {isAdding ? (
            <span className='flex items-center gap-2'>
              <div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
              Adding...
            </span>
          ) : (
            'Add Widget'
          )}
        </button>
      </LiquidGlassModalFooter>
    </LiquidGlassModal>
  );
};

export default AddWidgetModal;

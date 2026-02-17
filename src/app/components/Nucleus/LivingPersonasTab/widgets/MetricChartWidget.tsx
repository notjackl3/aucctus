/**
 * MetricChartWidget - Horizontal bar or pie donut chart widget
 *
 * Displays metric data as horizontal bars or as a CSS conic-gradient donut chart.
 * Supports inline add/delete/edit when editable.
 */

import { AnimatePresence, motion } from 'framer-motion';
import { Check, Pencil, Plus, X } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Cell,
  Tooltip,
} from 'recharts';
import { cn } from '@libs/utils/react';
import type {
  ICreateMetricChartItemPayload,
  IMetricChartItem,
  MetricChartType,
} from '@libs/api/types/persona';
import GlassWidget, { WidgetSize } from './GlassWidget';

/** Color palette for pie slices */
const PIE_COLORS = [
  '#6366f1', // indigo
  '#f59e0b', // amber
  '#10b981', // emerald
  '#ef4444', // red
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#14b8a6', // teal
  '#f97316', // orange
  '#3b82f6', // blue
  '#84cc16', // lime
];

/** Monochromatic blue palette for bar chart — darkest first, lighter toward bottom */
const BAR_COLORS = [
  '#1e3a5f',
  '#264b7a',
  '#2d5f9a',
  '#3b7dd8',
  '#5a9ae5',
  '#7ab3ec',
  '#9ccaf2',
  '#bdddf7',
];

/** Recharts bar label prop shape */
interface BarLabelProps {
  x: number;
  y: number;
  width: number;
  height: number;
  value: number;
  index: number;
}

/** Tooltip for bar chart */
interface BarTooltipPayloadItem {
  payload: { label: string; magnitude: number; unit: string };
}
const BarChartTooltip: React.FC<{
  active?: boolean;
  payload?: BarTooltipPayloadItem[];
}> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className='aucctus-bg-primary aucctus-border-secondary rounded-lg border px-3 py-2 shadow-lg'>
        <p className='aucctus-text-primary aucctus-text-sm-semibold'>
          {data.label}
        </p>
        <p className='aucctus-text-xs aucctus-text-secondary'>
          {data.magnitude}
          {data.unit}
        </p>
      </div>
    );
  }
  return null;
};

/** Props for the MetricChartWidget component */
export interface MetricChartWidgetProps {
  /** Widget title */
  title: string;
  /** Brief description of what the chart shows */
  description?: string;
  /** Icon variant */
  icon?: string;
  /** Chart data */
  items: IMetricChartItem[];
  /** Chart display type */
  chartType: MetricChartType;
  /** Widget size */
  size?: WidgetSize;
  /** Whether editing is enabled */
  isEditable?: boolean;
  /** Callback to add new item */
  onAdd?: (data: ICreateMetricChartItemPayload) => void;
  /** Callback to update an existing item */
  onUpdate?: (
    uuid: string,
    data: { label?: string; magnitude?: number; unit?: string },
  ) => void;
  /** Callback to delete item */
  onDelete?: (uuid: string) => void;
  /** Override for showing the add button (defaults to !!onAdd) */
  showAddButton?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * MetricChartWidget Component
 */
const MetricChartWidget: React.FC<MetricChartWidgetProps> = ({
  title,
  description,
  icon,
  items,
  chartType,
  size = 'small',
  isEditable = false,
  showAddButton,
  onAdd,
  onUpdate,
  onDelete,
  className,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newMagnitude, setNewMagnitude] = useState('');
  const [newUnit, setNewUnit] = useState('');

  // Inline editing state
  const [editingUuid, setEditingUuid] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editMagnitude, setEditMagnitude] = useState('');
  const [editUnit, setEditUnit] = useState('');

  const handleAdd = useCallback(() => {
    if (!newLabel.trim() || !newMagnitude.trim() || !onAdd) return;
    onAdd({
      label: newLabel.trim(),
      magnitude: parseFloat(newMagnitude),
      unit: newUnit.trim(),
    });
    setNewLabel('');
    setNewMagnitude('');
    setNewUnit('');
    setIsAdding(false);
  }, [newLabel, newMagnitude, newUnit, onAdd]);

  const handleAddKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleAdd();
      if (e.key === 'Escape') {
        setIsAdding(false);
        setNewLabel('');
        setNewMagnitude('');
        setNewUnit('');
      }
    },
    [handleAdd],
  );

  const startEditing = useCallback((item: IMetricChartItem) => {
    setEditingUuid(item.uuid);
    setEditLabel(item.label);
    setEditMagnitude(String(item.magnitude));
    setEditUnit(item.unit);
  }, []);

  const cancelEditing = useCallback(() => {
    setEditingUuid(null);
    setEditLabel('');
    setEditMagnitude('');
    setEditUnit('');
  }, []);

  const saveEditing = useCallback(() => {
    if (!editingUuid || !onUpdate) return;
    const updates: { label?: string; magnitude?: number; unit?: string } = {};
    if (editLabel.trim()) updates.label = editLabel.trim();
    if (editMagnitude.trim()) updates.magnitude = parseFloat(editMagnitude);
    if (editUnit.trim() !== undefined) updates.unit = editUnit.trim();
    onUpdate(editingUuid, updates);
    cancelEditing();
  }, [
    editingUuid,
    editLabel,
    editMagnitude,
    editUnit,
    onUpdate,
    cancelEditing,
  ]);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') saveEditing();
      if (e.key === 'Escape') cancelEditing();
    },
    [saveEditing, cancelEditing],
  );

  const maxMagnitude = useMemo(
    () => Math.max(...items.map((i) => i.magnitude), 1),
    [items],
  );

  const totalMagnitude = useMemo(
    () => items.reduce((sum, i) => sum + i.magnitude, 0),
    [items],
  );

  /** Recharts data for bar chart */
  const barChartData = useMemo(
    () =>
      items.map((item) => ({
        label:
          item.label.length > 12 ? item.label.slice(0, 10) + '...' : item.label,
        magnitude: item.magnitude,
        unit: item.unit,
        uuid: item.uuid,
      })),
    [items],
  );

  /** Build conic-gradient string for pie chart */
  const conicGradient = useMemo(() => {
    if (totalMagnitude === 0) return 'conic-gradient(#e5e7eb 0deg 360deg)';
    let currentDeg = 0;
    const stops: string[] = [];
    items.forEach((item, idx) => {
      const color = PIE_COLORS[idx % PIE_COLORS.length];
      const sliceDeg = (item.magnitude / totalMagnitude) * 360;
      stops.push(`${color} ${currentDeg}deg ${currentDeg + sliceDeg}deg`);
      currentDeg += sliceDeg;
    });
    return `conic-gradient(${stops.join(', ')})`;
  }, [items, totalMagnitude]);

  /** Renders inline edit form for an item */
  const renderEditForm = (item: IMetricChartItem) => (
    <motion.div
      key={`edit-${item.uuid}`}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      className='aucctus-border-brand rounded-lg border p-2'
    >
      <div className='space-y-1.5'>
        <input
          type='text'
          value={editLabel}
          onChange={(e) => setEditLabel(e.target.value)}
          placeholder='Label'
          className='aucctus-bg-primary aucctus-text-primary aucctus-text-xs w-full border-none outline-none'
          autoFocus
          onKeyDown={handleEditKeyDown}
        />
        <div className='flex gap-2'>
          <input
            type='number'
            value={editMagnitude}
            onChange={(e) => setEditMagnitude(e.target.value)}
            placeholder='Value'
            className='aucctus-bg-primary aucctus-text-primary aucctus-text-xs flex-1 border-none outline-none'
            onKeyDown={handleEditKeyDown}
          />
          <input
            type='text'
            value={editUnit}
            onChange={(e) => setEditUnit(e.target.value)}
            placeholder='Unit'
            className='aucctus-bg-primary aucctus-text-primary aucctus-text-xs w-16 border-none outline-none'
            onKeyDown={handleEditKeyDown}
          />
        </div>
        <div className='flex gap-1'>
          <button
            type='button'
            onClick={saveEditing}
            className='flex h-5 w-5 items-center justify-center rounded text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/30'
          >
            <Check size={12} />
          </button>
          <button
            type='button'
            onClick={cancelEditing}
            className='flex h-5 w-5 items-center justify-center rounded text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30'
          >
            <X size={12} />
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <GlassWidget
      title={title}
      icon={icon}
      size={size}
      showAddButton={showAddButton ?? !!onAdd}
      onAction={() => setIsAdding(true)}
      className={className}
    >
      {description && (
        <p className='aucctus-text-xs aucctus-text-tertiary mb-3'>
          {description}
        </p>
      )}

      {/* Inline add form */}
      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className='mb-3'
          >
            <div className='aucctus-border-brand space-y-2 rounded-lg border p-2'>
              <input
                type='text'
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder='Label (e.g., Revenue)'
                className='aucctus-bg-primary aucctus-text-primary aucctus-text-sm w-full border-none outline-none'
                autoFocus
              />
              <div className='flex gap-2'>
                <input
                  type='number'
                  value={newMagnitude}
                  onChange={(e) => setNewMagnitude(e.target.value)}
                  placeholder='Value'
                  className='aucctus-bg-primary aucctus-text-primary aucctus-text-sm flex-1 border-none outline-none'
                />
                <input
                  type='text'
                  value={newUnit}
                  onChange={(e) => setNewUnit(e.target.value)}
                  onKeyDown={handleAddKeyDown}
                  placeholder='Unit (e.g., %)'
                  className='aucctus-bg-primary aucctus-text-primary aucctus-text-sm w-20 border-none outline-none'
                />
              </div>
              <div className='flex gap-2'>
                <button
                  type='button'
                  onClick={handleAdd}
                  disabled={!newLabel.trim() || !newMagnitude.trim()}
                  className='btn btn-primary btn-xs'
                >
                  Add
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setIsAdding(false);
                    setNewLabel('');
                    setNewMagnitude('');
                    setNewUnit('');
                  }}
                  className='btn btn-ghost btn-xs'
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state */}
      {items.length === 0 && !isAdding && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className='flex flex-col items-center py-6'
        >
          {chartType === 'bar' ? (
            /* Muted placeholder bars */
            <div className='mb-4 w-full space-y-2.5 px-2'>
              {[72, 55, 35].map((width, i) => (
                <div key={i} className='space-y-1'>
                  <div className='flex items-center justify-between'>
                    <div className='aucctus-bg-tertiary h-2 w-12 rounded' />
                    <div className='aucctus-bg-tertiary h-2 w-6 rounded' />
                  </div>
                  <div className='aucctus-bg-secondary h-2 w-full overflow-hidden rounded-full'>
                    <div
                      className='aucctus-bg-tertiary h-full rounded-full opacity-50'
                      style={{ width: `${width}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Muted placeholder donut */
            <div
              className='relative mb-4 h-20 w-20 rounded-full'
              style={{ background: 'conic-gradient(#e5e7eb 0deg 360deg)' }}
            >
              <div className='aucctus-bg-primary absolute inset-3 rounded-full' />
            </div>
          )}
          <p className='aucctus-text-sm aucctus-text-tertiary mb-2'>
            No data yet
          </p>
          {onAdd && (
            <button
              type='button'
              onClick={() => setIsAdding(true)}
              className='btn btn-ghost btn-sm flex items-center gap-1.5'
            >
              <Plus size={14} />
              Add first data point
            </button>
          )}
        </motion.div>
      )}

      {items.length > 0 && chartType === 'bar' && !editingUuid && (
        /* Bar chart mode — Recharts horizontal bar chart */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div
            style={{
              width: '100%',
              height: Math.max(items.length * 40 + 24, 120),
            }}
          >
            <ResponsiveContainer width='100%' height='100%'>
              <BarChart
                data={barChartData}
                layout='vertical'
                margin={{ top: 4, right: 40, left: 4, bottom: 4 }}
              >
                <XAxis type='number' domain={[0, maxMagnitude]} hide />
                <YAxis
                  type='category'
                  dataKey='label'
                  stroke='currentColor'
                  opacity={0.6}
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  width={80}
                />
                <Tooltip
                  content={<BarChartTooltip />}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                />
                <Bar
                  dataKey='magnitude'
                  radius={[0, 6, 6, 0]}
                  barSize={20}
                  animationDuration={800}
                  label={({
                    x,
                    y,
                    width: barWidth,
                    height: barHeight,
                    value,
                    index: idx,
                  }: BarLabelProps) => {
                    const item = barChartData[idx];
                    return (
                      <text
                        x={Number(x) + Number(barWidth) + 6}
                        y={Number(y) + Number(barHeight) / 2}
                        fill='currentColor'
                        opacity={0.6}
                        fontSize={11}
                        dominantBaseline='central'
                      >
                        {value}
                        {item?.unit ?? ''}
                      </text>
                    );
                  }}
                >
                  {barChartData.map((_entry, index) => (
                    <Cell
                      key={index}
                      fill={BAR_COLORS[index % BAR_COLORS.length]}
                      fillOpacity={0.9}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Edit/delete controls below chart */}
          {isEditable && (onUpdate || onDelete) && (
            <div className='mt-2 space-y-1'>
              {items.map((item, index) => (
                <div
                  key={item.uuid}
                  className='group flex items-center gap-2 rounded px-1 py-0.5 hover:bg-white/5'
                >
                  <span
                    className='h-2.5 w-2.5 shrink-0 rounded-sm'
                    style={{
                      backgroundColor: BAR_COLORS[index % BAR_COLORS.length],
                    }}
                  />
                  <span className='aucctus-text-xs aucctus-text-secondary flex-1 truncate'>
                    {item.label}
                  </span>
                  {onUpdate && (
                    <button
                      type='button'
                      onClick={() => startEditing(item)}
                      className='flex h-5 w-5 items-center justify-center rounded opacity-0 transition-opacity hover:bg-blue-100 group-hover:opacity-100 dark:hover:bg-blue-900/30'
                    >
                      <Pencil size={10} className='aucctus-text-secondary' />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      type='button'
                      onClick={() => onDelete(item.uuid)}
                      className='flex h-5 w-5 items-center justify-center rounded opacity-0 transition-opacity hover:bg-red-100 group-hover:opacity-100 dark:hover:bg-red-900/30'
                    >
                      <X size={12} className='text-red-500' />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Bar chart inline edit form (replaces chart while editing) */}
      {items.length > 0 && chartType === 'bar' && editingUuid && (
        <AnimatePresence mode='popLayout'>
          {items.map((item) =>
            editingUuid === item.uuid ? renderEditForm(item) : null,
          )}
        </AnimatePresence>
      )}

      {items.length > 0 && chartType === 'pie' && (
        /* Pie chart mode — donut left, legend right */
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className='flex items-start gap-5'
        >
          {/* Donut with center total */}
          <div className='flex shrink-0 flex-col items-center gap-1.5'>
            <div
              className='relative h-28 w-28 rounded-full'
              style={{ background: conicGradient }}
            >
              <div className='aucctus-bg-primary absolute inset-[14px] flex items-center justify-center rounded-full'>
                <div className='text-center'>
                  <span className='aucctus-text-sm-bold aucctus-text-primary block leading-none'>
                    {totalMagnitude % 1 === 0
                      ? totalMagnitude
                      : totalMagnitude.toFixed(1)}
                  </span>
                  <span className='aucctus-text-xs aucctus-text-tertiary leading-none'>
                    total
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className='flex min-w-0 flex-1 flex-col justify-center gap-1.5 py-1'>
            <AnimatePresence mode='popLayout'>
              {items.map((item, index) => {
                const isEditing = editingUuid === item.uuid;
                const pct =
                  totalMagnitude > 0
                    ? (item.magnitude / totalMagnitude) * 100
                    : 0;

                if (isEditing) {
                  return renderEditForm(item);
                }

                return (
                  <div
                    key={item.uuid}
                    className='group flex items-center gap-2'
                  >
                    <span
                      className='h-2.5 w-2.5 shrink-0 rounded-full'
                      style={{
                        backgroundColor: PIE_COLORS[index % PIE_COLORS.length],
                      }}
                    />
                    <span className='aucctus-text-xs aucctus-text-secondary min-w-0 flex-1 truncate'>
                      {item.label}
                    </span>
                    <span className='aucctus-text-xs aucctus-text-tertiary shrink-0 tabular-nums'>
                      {pct < 1 && pct > 0 ? '<1' : Math.round(pct)}%
                    </span>
                    <span className='aucctus-text-xs-bold aucctus-text-primary shrink-0 tabular-nums'>
                      {item.magnitude}
                      {item.unit}
                    </span>
                    {isEditable && onUpdate && (
                      <button
                        type='button'
                        onClick={() => startEditing(item)}
                        className='flex h-4 w-4 shrink-0 items-center justify-center rounded opacity-0 transition-opacity hover:bg-blue-100 group-hover:opacity-100 dark:hover:bg-blue-900/30'
                      >
                        <Pencil size={10} className='aucctus-text-secondary' />
                      </button>
                    )}
                    {isEditable && onDelete && (
                      <button
                        type='button'
                        onClick={() => onDelete(item.uuid)}
                        className={cn(
                          'flex h-4 w-4 shrink-0 items-center justify-center rounded opacity-0 transition-opacity hover:bg-red-100 group-hover:opacity-100 dark:hover:bg-red-900/30',
                        )}
                      >
                        <X size={12} className='text-red-500' />
                      </button>
                    )}
                  </div>
                );
              })}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </GlassWidget>
  );
};

export default MetricChartWidget;

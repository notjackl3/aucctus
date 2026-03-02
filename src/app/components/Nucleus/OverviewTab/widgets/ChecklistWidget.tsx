/**
 * ChecklistWidget - Generic checklist widget for Decision Filters, Pitfalls, and Success Metrics.
 *
 * Renders a list of text items with status icons. Appearance adapts based on
 * the widget title (amber for pitfalls, emerald for filters/metrics).
 * Supports inline add/delete/update of items when isEditable is true.
 * Maps to the `checklist` widget type.
 */

import { GlassSurface } from '@components';
import { IconPickerDropdown } from '@components/Dropdown';
import type { INucleusOverviewWidget } from '@libs/api/types/nucleusOverview';
import { resolveIcon } from '@libs/utils/iconMap';
import { VALID_OVERVIEW_WIDGET_ICONS } from './constants';
import { cn } from '@libs/utils/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Plus,
  Target,
  Trash2,
} from 'lucide-react';
import React, { useCallback, useId, useState } from 'react';

interface ChecklistWidgetProps {
  widget: INucleusOverviewWidget;
  brandColors?: Record<string, string>;
  isEditable?: boolean;
  onAddItem?: (widgetUuid: string, data: Record<string, unknown>) => void;
  onUpdateItem?: (
    widgetUuid: string,
    itemUuid: string,
    data: Record<string, unknown>,
  ) => void;
  onDeleteItem?: (widgetUuid: string, itemUuid: string) => void;
  onUpdateWidget?: (widgetUuid: string, data: Record<string, unknown>) => void;
}

type ChecklistVariant = 'filter' | 'pitfall' | 'metric';

const getVariant = (title: string): ChecklistVariant => {
  const lower = title.toLowerCase();
  if (
    lower.includes('pitfall') ||
    lower.includes('risk') ||
    lower.includes('avoid')
  ) {
    return 'pitfall';
  }
  if (lower.includes('metric') || lower.includes('success')) {
    return 'metric';
  }
  return 'filter';
};

const variantConfig = {
  filter: {
    Icon: CheckCircle2,
    iconClass: 'text-emerald-500',
    headerIconSuffix: '/70',
  },
  pitfall: {
    Icon: AlertTriangle,
    iconClass: 'text-amber-500',
    headerIconSuffix: '/70',
  },
  metric: {
    Icon: Target,
    iconClass: 'text-emerald-500',
    headerIconSuffix: '/70',
  },
};

const createHexagonPath = (cx: number, cy: number, radius: number): string => {
  const points = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return `${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`;
  });
  return `M ${points.join(' L ')} Z`;
};

const generateHoneycombGrid = (
  cols: number,
  rows: number,
  hexRadius: number,
  startX: number,
  startY: number,
): Array<{ x: number; y: number; isLandmine: boolean }> => {
  const hexagons: Array<{ x: number; y: number; isLandmine: boolean }> = [];
  const horizontalSpacing = hexRadius * 1.75;
  const verticalSpacing = hexRadius * 1.5;
  const landminePositions = new Set(['2-1', '4-1']);

  for (let row = 0; row < rows; row++) {
    const offset = row % 2 === 0 ? 0 : hexRadius * 0.875;
    for (let col = 0; col < cols; col++) {
      hexagons.push({
        x: startX + col * horizontalSpacing + offset,
        y: startY + row * verticalSpacing,
        isLandmine: landminePositions.has(`${col}-${row}`),
      });
    }
  }
  return hexagons;
};

const PitfallHoneycomb: React.FC = () => {
  const id = useId();
  const landmineGradientId = `landmineGradient-${id}`;
  const glowFilterId = `glowFilter-${id}`;
  const fadeGradientId = `fadeGradient-${id}`;
  const fadeMaskId = `fadeMask-${id}`;
  const hexagons = generateHoneycombGrid(5, 2, 36, 40, 50);

  return (
    <svg
      className='pointer-events-none absolute inset-x-0 bottom-0 z-0 h-[45%] w-full'
      viewBox='0 0 400 120'
      preserveAspectRatio='xMidYMax slice'
    >
      <defs>
        <radialGradient id={landmineGradientId} cx='50%' cy='50%' r='50%'>
          <stop offset='0%' stopColor='rgb(210, 120, 20)' stopOpacity='0.2' />
          <stop offset='50%' stopColor='rgb(245, 158, 11)' stopOpacity='0.12' />
          <stop
            offset='100%'
            stopColor='rgb(251, 191, 36)'
            stopOpacity='0.06'
          />
        </radialGradient>
        <filter id={glowFilterId} x='-50%' y='-50%' width='200%' height='200%'>
          <feGaussianBlur stdDeviation='2' result='blur' />
          <feMerge>
            <feMergeNode in='blur' />
            <feMergeNode in='SourceGraphic' />
          </feMerge>
        </filter>
        <linearGradient id={fadeGradientId} x1='0' y1='0' x2='0' y2='1'>
          <stop offset='0%' stopColor='white' stopOpacity='0' />
          <stop offset='40%' stopColor='white' stopOpacity='0.4' />
          <stop offset='100%' stopColor='white' stopOpacity='1' />
        </linearGradient>
        <mask id={fadeMaskId}>
          <rect
            x='0'
            y='0'
            width='100%'
            height='100%'
            fill={`url(#${fadeGradientId})`}
          />
        </mask>
      </defs>
      <g mask={`url(#${fadeMaskId})`}>
        {hexagons
          .filter((h) => !h.isLandmine)
          .map((hex, i) => (
            <path
              key={`hex-${i}`}
              d={createHexagonPath(hex.x, hex.y, 36)}
              fill='none'
              stroke='rgba(156, 163, 175, 0.06)'
              strokeWidth='1'
            />
          ))}
        {hexagons
          .filter((h) => h.isLandmine)
          .map((hex, i) => (
            <path
              key={`landmine-${i}`}
              d={createHexagonPath(hex.x, hex.y, 36)}
              fill={`url(#${landmineGradientId})`}
              stroke='rgba(245, 158, 11, 0.08)'
              strokeWidth='1'
              filter={`url(#${glowFilterId})`}
            />
          ))}
      </g>
    </svg>
  );
};

/** Editable text that becomes an input on click. */
const EditableText: React.FC<{
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
}> = ({ value, onSave, className }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);

  const handleSave = useCallback(() => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== value) {
      onSave(trimmed);
    }
    setIsEditing(false);
  }, [editValue, value, onSave]);

  if (isEditing) {
    return (
      <input
        type='text'
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSave();
          if (e.key === 'Escape') {
            setEditValue(value);
            setIsEditing(false);
          }
        }}
        className={cn(
          'aucctus-bg-secondary aucctus-border-brand w-full rounded border px-1 py-0.5 text-sm outline-none',
          className,
        )}
        autoFocus
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={cn('hover:aucctus-text-brand-primary cursor-text', className)}
      role='button'
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') setIsEditing(true);
      }}
    >
      {value}
    </span>
  );
};

/** Delete button that appears on hover. */
const ItemDeleteButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    type='button'
    onClick={onClick}
    className='flex h-5 w-5 flex-shrink-0 items-center justify-center rounded opacity-0 transition-opacity hover:bg-red-100 group-hover/item:opacity-100 dark:hover:bg-red-900/30'
    title='Delete item'
  >
    <Trash2 className='h-3 w-3 text-red-500' />
  </button>
);

const ChecklistWidget: React.FC<ChecklistWidgetProps> = ({
  widget,
  brandColors = {},
  isEditable = false,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onUpdateWidget,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newText, setNewText] = useState('');
  const items = widget.checklistItems;
  const variant = getVariant(widget.title);
  const config = variantConfig[variant];
  const HeaderIcon = widget.icon ? resolveIcon(widget.icon) : config.Icon;
  const brandColorValues = Object.values(brandColors);
  const primaryBrandColor = brandColorValues[0] || null;
  const secondaryBrandColor = brandColorValues[1] || primaryBrandColor;

  const handleAdd = useCallback(() => {
    if (!newText.trim()) return;
    onAddItem?.(widget.uuid, { text: newText.trim() });
    setNewText('');
    setIsAdding(false);
  }, [newText, widget.uuid, onAddItem]);

  const handleUpdate = useCallback(
    (itemUuid: string, text: string) => {
      onUpdateItem?.(widget.uuid, itemUuid, { text });
    },
    [widget.uuid, onUpdateItem],
  );

  const handleDelete = useCallback(
    (itemUuid: string) => {
      onDeleteItem?.(widget.uuid, itemUuid);
    },
    [widget.uuid, onDeleteItem],
  );

  const renderItemContent = (item: { uuid: string; text: string }) => (
    <>
      {isEditable && onUpdateItem ? (
        <EditableText
          value={item.text}
          onSave={(newValue) => handleUpdate(item.uuid, newValue)}
          className='flex-1'
        />
      ) : (
        <span className='flex-1'>{item.text}</span>
      )}
      {isEditable && onDeleteItem && (
        <ItemDeleteButton onClick={() => handleDelete(item.uuid)} />
      )}
    </>
  );

  return (
    <GlassSurface
      className='relative flex h-full min-h-[220px] flex-col overflow-hidden'
      variant='default'
    >
      {variant === 'pitfall' && (
        <>
          <div
            className='pointer-events-none absolute inset-x-0 bottom-0 h-[30%]'
            style={{
              background: secondaryBrandColor
                ? `radial-gradient(ellipse at 0% 100%, ${secondaryBrandColor}0F 0%, transparent 50%)`
                : 'radial-gradient(ellipse at 0% 100%, rgba(245, 158, 11, 0.06) 0%, transparent 50%)',
            }}
          />
          <div
            className='pointer-events-none absolute inset-x-0 bottom-0 h-[30%]'
            style={{
              background: secondaryBrandColor
                ? `radial-gradient(ellipse at 100% 100%, ${secondaryBrandColor}0F 0%, transparent 50%)`
                : 'radial-gradient(ellipse at 100% 100%, rgba(245, 158, 11, 0.06) 0%, transparent 50%)',
            }}
          />
        </>
      )}

      <div className='relative z-20 flex-shrink-0 px-4 pb-3 pt-3'>
        <div className='flex items-center gap-2'>
          {isEditable && onUpdateWidget ? (
            <IconPickerDropdown
              currentIcon={widget.icon}
              onSelect={(icon) => onUpdateWidget(widget.uuid, { icon })}
              allowedIcons={VALID_OVERVIEW_WIDGET_ICONS}
              trigger={
                <button
                  type='button'
                  className='hover:aucctus-bg-secondary rounded p-0.5 transition-colors'
                  title='Change icon'
                >
                  <HeaderIcon
                    className={`h-4 w-4 ${config.iconClass}${config.headerIconSuffix}`}
                    style={
                      (
                        variant === 'pitfall'
                          ? secondaryBrandColor
                          : primaryBrandColor
                      )
                        ? {
                            color:
                              variant === 'pitfall'
                                ? secondaryBrandColor!
                                : primaryBrandColor!,
                          }
                        : undefined
                    }
                  />
                </button>
              }
            />
          ) : (
            <HeaderIcon
              className={`h-4 w-4 ${config.iconClass}${config.headerIconSuffix}`}
              style={
                (
                  variant === 'pitfall'
                    ? secondaryBrandColor
                    : primaryBrandColor
                )
                  ? {
                      color:
                        variant === 'pitfall'
                          ? secondaryBrandColor!
                          : primaryBrandColor!,
                    }
                  : undefined
              }
            />
          )}
          <span className='aucctus-text-xs-medium aucctus-text-tertiary flex-1 uppercase tracking-wider'>
            {isEditable && onUpdateWidget ? (
              <EditableText
                value={widget.title}
                onSave={(v) => onUpdateWidget(widget.uuid, { title: v })}
              />
            ) : (
              widget.title
            )}
          </span>
          {isEditable && onAddItem && (
            <button
              type='button'
              onClick={() => setIsAdding(true)}
              className='aucctus-text-tertiary hover:aucctus-bg-secondary flex h-5 w-5 items-center justify-center rounded-full transition-colors'
              title='Add item'
            >
              <Plus className='h-3.5 w-3.5' />
            </button>
          )}
        </div>
      </div>

      <div className='relative z-10 flex flex-1 flex-col justify-center overflow-hidden px-4 pb-4 pt-0'>
        {variant === 'filter' && (
          <div className='space-y-2'>
            {items.map((item) => (
              <div
                key={item.uuid}
                className={cn(
                  'group/item flex items-center gap-3 py-2',
                  item.uuid.startsWith('temp-') && 'animate-pulse opacity-60',
                )}
              >
                <div
                  className='flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/15'
                  style={
                    primaryBrandColor
                      ? { backgroundColor: `${primaryBrandColor}26` }
                      : undefined
                  }
                >
                  <CheckCircle2
                    className='h-4 w-4 text-emerald-500'
                    style={
                      primaryBrandColor
                        ? { color: primaryBrandColor }
                        : undefined
                    }
                  />
                </div>
                <span className='aucctus-text-primary aucctus-text-sm flex flex-1 flex-row items-center'>
                  {renderItemContent(item)}
                </span>
              </div>
            ))}
          </div>
        )}

        {variant === 'pitfall' && (
          <div className='space-y-1.5'>
            {items.map((item) => (
              <div
                key={item.uuid}
                className={cn(
                  'group/item flex items-center gap-2.5 rounded-lg border bg-white/60 p-2 shadow-sm backdrop-blur-sm transition-colors hover:bg-white/80 dark:bg-white/10 dark:hover:bg-white/15',
                  !secondaryBrandColor && 'border-amber-500/20',
                  item.uuid.startsWith('temp-') && 'animate-pulse opacity-60',
                )}
                style={
                  secondaryBrandColor
                    ? { borderColor: `${secondaryBrandColor}33` }
                    : undefined
                }
              >
                <AlertTriangle
                  className='h-3.5 w-3.5 flex-shrink-0 text-amber-500'
                  style={
                    secondaryBrandColor
                      ? { color: secondaryBrandColor }
                      : undefined
                  }
                />
                <span className='text-foreground/90 flex flex-1 flex-row items-center text-sm'>
                  {renderItemContent(item)}
                </span>
              </div>
            ))}
          </div>
        )}

        {variant === 'metric' && (
          <div className='space-y-2'>
            {items.map((item) => (
              <div
                key={item.uuid}
                className={cn(
                  'group/item rounded-lg border p-3 transition-colors',
                  !primaryBrandColor &&
                    'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10',
                  item.uuid.startsWith('temp-') && 'animate-pulse opacity-60',
                )}
                style={
                  primaryBrandColor
                    ? {
                        borderColor: `${primaryBrandColor}33`,
                        backgroundColor: `${primaryBrandColor}0D`,
                      }
                    : undefined
                }
              >
                <div className='flex items-center gap-3'>
                  <CheckCircle2
                    className='h-4 w-4 flex-shrink-0 text-emerald-500'
                    style={
                      primaryBrandColor
                        ? { color: primaryBrandColor }
                        : undefined
                    }
                  />
                  <span className='text-foreground/90 flex flex-1 flex-row items-center text-sm'>
                    {renderItemContent(item)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Inline add form */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className='overflow-hidden'
            >
              <div className='flex items-center gap-2 pt-2'>
                <input
                  type='text'
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAdd();
                    if (e.key === 'Escape') {
                      setNewText('');
                      setIsAdding(false);
                    }
                  }}
                  placeholder='Add an item...'
                  className='aucctus-bg-secondary aucctus-border-secondary aucctus-text-primary focus:aucctus-border-brand flex-1 rounded-lg border px-3 py-1.5 text-sm outline-none transition-colors'
                  autoFocus
                />
                <button
                  type='button'
                  onClick={handleAdd}
                  disabled={!newText.trim()}
                  className='aucctus-bg-brand-solid rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-opacity disabled:opacity-50'
                >
                  Add
                </button>
                <button
                  type='button'
                  onClick={() => {
                    setNewText('');
                    setIsAdding(false);
                  }}
                  className='aucctus-text-tertiary hover:aucctus-bg-secondary rounded-lg px-2 py-1.5 text-xs transition-colors'
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {variant === 'pitfall' && <PitfallHoneycomb />}
    </GlassSurface>
  );
};

export default ChecklistWidget;

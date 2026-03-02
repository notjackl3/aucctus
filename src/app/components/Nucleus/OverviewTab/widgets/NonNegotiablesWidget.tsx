/**
 * NonNegotiablesWidget - Constrained text widget with decorative guardrail SVG lines.
 *
 * Displays two-line constraint statements with rose-colored decorative framing,
 * subtle pressure glows from the sides, glow layers, and starting tails.
 * Supports inline add/delete/update of items when isEditable is true.
 * Maps to the `constrained_text` widget type.
 */

import { GlassSurface } from '@components';
import { IconPickerDropdown } from '@components/Dropdown';
import type { INucleusOverviewWidget } from '@libs/api/types/nucleusOverview';
import { resolveIcon } from '@libs/utils/iconMap';
import { VALID_OVERVIEW_WIDGET_ICONS } from './constants';
import { hexToRgb } from '@libs/utils/propertyColors';
import { cn } from '@libs/utils/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, ShieldAlert, Trash2 } from 'lucide-react';
import React, { useCallback, useId, useMemo, useState } from 'react';

const DEFAULT_ACCENT_RGB = '251, 113, 133'; // rose-400

interface NonNegotiablesWidgetProps {
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

/** Inline editable text that becomes an input on click. */
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
        className={`aucctus-bg-secondary aucctus-border-brand w-full rounded border px-2 py-1 text-center outline-none ${className ?? ''}`}
        autoFocus
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`hover:aucctus-text-brand-primary cursor-text ${className ?? ''}`}
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

const NonNegotiablesWidget: React.FC<NonNegotiablesWidgetProps> = ({
  widget,
  brandColors = {},
  isEditable = false,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onUpdateWidget,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newLine1, setNewLine1] = useState('');
  const [newLine2, setNewLine2] = useState('');
  const items = widget.constrainedTextItems;
  const svgId = useId();
  const elegantGradientId = `guardrailElegantGradient-${svgId}`;
  const glowLayerId = `guardrailGlowLayer-${svgId}`;
  const subtleGlowId = `guardrailSubtleGlow-${svgId}`;

  const accentRgb = useMemo(() => {
    const primaryHex = Object.values(brandColors)[0];
    if (!primaryHex) return DEFAULT_ACCENT_RGB;
    const rgb = hexToRgb(primaryHex);
    return rgb ? `${rgb.r}, ${rgb.g}, ${rgb.b}` : DEFAULT_ACCENT_RGB;
  }, [brandColors]);

  const handleAdd = useCallback(() => {
    if (!newLine1.trim()) return;
    onAddItem?.(widget.uuid, {
      line1: newLine1.trim(),
      line2: newLine2.trim(),
    });
    setNewLine1('');
    setNewLine2('');
    setIsAdding(false);
  }, [newLine1, newLine2, widget.uuid, onAddItem]);

  const handleDelete = useCallback(
    (itemUuid: string) => {
      onDeleteItem?.(widget.uuid, itemUuid);
    },
    [widget.uuid, onDeleteItem],
  );

  return (
    <GlassSurface
      className='relative flex h-full min-h-[220px] flex-col overflow-hidden'
      variant='default'
    >
      {/* Radial pressure glows from sides */}
      <div
        className='pointer-events-none absolute inset-0'
        style={{
          background: `radial-gradient(circle at 0% 50%, rgba(${accentRgb}, 0.08) 0%, transparent 35%)`,
        }}
      />
      <div
        className='pointer-events-none absolute inset-0'
        style={{
          background: `radial-gradient(circle at 100% 50%, rgba(${accentRgb}, 0.08) 0%, transparent 35%)`,
        }}
      />

      <div className='relative z-10 flex-shrink-0 px-4 pb-3 pt-3'>
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
                  {React.createElement(
                    widget.icon ? resolveIcon(widget.icon) : ShieldAlert,
                    {
                      className: 'text-primary/70 h-4 w-4',
                    },
                  )}
                </button>
              }
            />
          ) : (
            React.createElement(
              widget.icon ? resolveIcon(widget.icon) : ShieldAlert,
              {
                className: 'text-primary/70 h-4 w-4',
              },
            )
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

      <div className='relative z-10 flex flex-1 flex-col justify-center px-4 pb-4 pt-0'>
        {/* Guardrail SVG */}
        <svg
          className='pointer-events-none absolute inset-0 h-full w-full'
          viewBox='0 0 100 100'
          preserveAspectRatio='none'
        >
          <defs>
            <filter
              id={subtleGlowId}
              x='-50%'
              y='-50%'
              width='200%'
              height='200%'
            >
              <feGaussianBlur
                in='SourceGraphic'
                stdDeviation='2.5'
                result='blur'
              />
              <feMerge>
                <feMergeNode in='blur' />
                <feMergeNode in='SourceGraphic' />
              </feMerge>
            </filter>
            <linearGradient id={elegantGradientId} x1='0' y1='0' x2='0' y2='1'>
              <stop
                offset='0%'
                stopColor={`rgb(${accentRgb})`}
                stopOpacity='0.10'
              />
              <stop
                offset='15%'
                stopColor={`rgb(${accentRgb})`}
                stopOpacity='0.30'
              />
              <stop
                offset='50%'
                stopColor={`rgb(${accentRgb})`}
                stopOpacity='0.35'
              />
              <stop
                offset='75%'
                stopColor={`rgb(${accentRgb})`}
                stopOpacity='0.25'
              />
              <stop
                offset='100%'
                stopColor={`rgb(${accentRgb})`}
                stopOpacity='0.10'
              />
            </linearGradient>
            <linearGradient id={glowLayerId} x1='0' y1='0' x2='0' y2='1'>
              <stop
                offset='0%'
                stopColor={`rgb(${accentRgb})`}
                stopOpacity='0.02'
              />
              <stop
                offset='50%'
                stopColor={`rgb(${accentRgb})`}
                stopOpacity='0.08'
              />
              <stop
                offset='100%'
                stopColor={`rgb(${accentRgb})`}
                stopOpacity='0.03'
              />
            </linearGradient>
          </defs>
          <path
            d='M 0 3 L 5 3 Q 7 3, 8 6'
            stroke={`url(#${elegantGradientId})`}
            strokeWidth='0.5'
            strokeLinecap='round'
            fill='none'
            opacity='0.4'
          />
          <path
            d='M 8 6 L 8 82 Q 8 90, 20 100'
            stroke={`url(#${glowLayerId})`}
            strokeWidth='4'
            strokeLinecap='round'
            fill='none'
            filter={`url(#${subtleGlowId})`}
          />
          <path
            d='M 8 6 L 8 82 Q 8 90, 20 100'
            stroke={`url(#${elegantGradientId})`}
            strokeWidth='1'
            strokeLinecap='round'
            fill='none'
          />
          <path
            d='M 100 3 L 95 3 Q 93 3, 92 6'
            stroke={`url(#${elegantGradientId})`}
            strokeWidth='0.5'
            strokeLinecap='round'
            fill='none'
            opacity='0.4'
          />
          <path
            d='M 92 6 L 92 82 Q 92 90, 80 100'
            stroke={`url(#${glowLayerId})`}
            strokeWidth='4'
            strokeLinecap='round'
            fill='none'
            filter={`url(#${subtleGlowId})`}
          />
          <path
            d='M 92 6 L 92 82 Q 92 90, 80 100'
            stroke={`url(#${elegantGradientId})`}
            strokeWidth='1'
            strokeLinecap='round'
            fill='none'
          />
        </svg>

        {/* Content */}
        <div className='divide-destructive/15 relative z-10 mx-auto max-w-[78%] divide-y'>
          {items.map((constraint) => (
            <div
              key={constraint.uuid}
              className={cn(
                'group/item relative py-2 text-center',
                constraint.uuid.startsWith('temp-') &&
                  'animate-pulse opacity-60',
              )}
            >
              <span className='text-foreground/90 text-base font-medium leading-tight'>
                {isEditable && onUpdateItem ? (
                  <>
                    <EditableText
                      value={constraint.line1}
                      onSave={(v) =>
                        onUpdateItem(widget.uuid, constraint.uuid, {
                          line1: v,
                        })
                      }
                    />
                    {constraint.line2 && (
                      <>
                        <br />
                        <EditableText
                          value={constraint.line2}
                          onSave={(v) =>
                            onUpdateItem(widget.uuid, constraint.uuid, {
                              line2: v,
                            })
                          }
                        />
                      </>
                    )}
                  </>
                ) : (
                  <>
                    {constraint.line1}
                    {constraint.line2 && (
                      <>
                        <br />
                        {constraint.line2}
                      </>
                    )}
                  </>
                )}
              </span>
              {isEditable && onDeleteItem && (
                <button
                  type='button'
                  onClick={() => handleDelete(constraint.uuid)}
                  className='absolute -right-6 top-1/2 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded opacity-0 transition-opacity hover:bg-red-100 group-hover/item:opacity-100 dark:hover:bg-red-900/30'
                  title='Delete item'
                >
                  <Trash2 className='h-3 w-3 text-red-500' />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Inline add form */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className='relative z-10 overflow-hidden'
            >
              <div className='mx-auto mt-3 max-w-[78%] space-y-2 rounded-lg border border-dashed border-gray-300 p-3 dark:border-gray-600'>
                <input
                  type='text'
                  value={newLine1}
                  onChange={(e) => setNewLine1(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAdd();
                    if (e.key === 'Escape') {
                      setNewLine1('');
                      setNewLine2('');
                      setIsAdding(false);
                    }
                  }}
                  placeholder='First line...'
                  className='aucctus-bg-secondary aucctus-border-secondary aucctus-text-primary focus:aucctus-border-brand w-full rounded-lg border px-3 py-1.5 text-center text-sm outline-none transition-colors'
                  autoFocus
                />
                <input
                  type='text'
                  value={newLine2}
                  onChange={(e) => setNewLine2(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAdd();
                    if (e.key === 'Escape') {
                      setNewLine1('');
                      setNewLine2('');
                      setIsAdding(false);
                    }
                  }}
                  placeholder='Second line (optional)...'
                  className='aucctus-bg-secondary aucctus-border-secondary aucctus-text-primary focus:aucctus-border-brand w-full rounded-lg border px-3 py-1.5 text-center text-sm outline-none transition-colors'
                />
                <div className='flex items-center justify-center gap-2'>
                  <button
                    type='button'
                    onClick={handleAdd}
                    disabled={!newLine1.trim()}
                    className='aucctus-bg-brand-solid rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-opacity disabled:opacity-50'
                  >
                    Add
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      setNewLine1('');
                      setNewLine2('');
                      setIsAdding(false);
                    }}
                    className='aucctus-text-tertiary hover:aucctus-bg-secondary rounded-lg px-2 py-1.5 text-xs transition-colors'
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </GlassSurface>
  );
};

export default NonNegotiablesWidget;

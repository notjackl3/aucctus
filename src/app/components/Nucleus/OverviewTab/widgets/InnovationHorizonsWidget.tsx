/**
 * InnovationHorizonsWidget - Interactive half-circle radar visualization.
 *
 * Shows H1/H2/H3 innovation horizons as clickable concentric ring sectors.
 * Selected horizon displays its title and description above the radar.
 * Features a multi-layer liquid glass rim effect on the selected ring.
 * Maps to the `visualization` widget type.
 */

import { GlassSurface } from '@components';
import { IconPickerDropdown } from '@components/Dropdown';
import type { INucleusOverviewWidget } from '@libs/api/types/nucleusOverview';
import { resolveIcon } from '@libs/utils/iconMap';
import { VALID_OVERVIEW_WIDGET_ICONS } from './constants';
import { cn } from '@libs/utils/react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus, Rocket, Trash2 } from 'lucide-react';
import React, { useCallback, useId, useState } from 'react';

interface InnovationHorizonsWidgetProps {
  widget: INucleusOverviewWidget;
  brandColors?: string[];
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

const DEFAULT_RING_RADII = [
  { innerRadius: 0, outerRadius: 0.35 },
  { innerRadius: 0.35, outerRadius: 0.67 },
  { innerRadius: 0.67, outerRadius: 1 },
];

const getRingPath = (
  innerRadius: number,
  outerRadius: number,
  maxRadius: number,
  cx: number,
  cy: number,
): string => {
  const inner = innerRadius * maxRadius;
  const outer = outerRadius * maxRadius;

  if (innerRadius === 0) {
    return `M ${cx - outer} ${cy} A ${outer} ${outer} 0 0 1 ${cx + outer} ${cy} L ${cx} ${cy} Z`;
  }
  return `M ${cx - outer} ${cy} A ${outer} ${outer} 0 0 1 ${cx + outer} ${cy} L ${cx + inner} ${cy} A ${inner} ${inner} 0 0 0 ${cx - inner} ${cy} Z`;
};

/** Create the outer arc path for glass rim effects. */
const getOuterArcPath = (
  outerRadius: number,
  maxRadius: number,
  cx: number,
  cy: number,
): string => {
  const outer = outerRadius * maxRadius;
  return `M ${cx - outer} ${cy} A ${outer} ${outer} 0 0 1 ${cx + outer} ${cy}`;
};

/** Inline editable text that becomes an input/textarea on click. */
const EditableText: React.FC<{
  value: string;
  onSave: (newValue: string) => void;
  className?: string;
  multiline?: boolean;
}> = ({ value, onSave, className, multiline = false }) => {
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
    if (multiline) {
      return (
        <textarea
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setEditValue(value);
              setIsEditing(false);
            }
          }}
          className={`aucctus-bg-secondary aucctus-border-brand w-full resize-none rounded border px-2 py-1 outline-none ${className ?? ''}`}
          rows={3}
          autoFocus
        />
      );
    }
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
        className={`aucctus-bg-secondary aucctus-border-brand w-full rounded border px-2 py-1 outline-none ${className ?? ''}`}
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

const InnovationHorizonsWidget: React.FC<InnovationHorizonsWidgetProps> = ({
  widget,
  brandColors = [],
  isEditable = false,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onUpdateWidget,
}) => {
  const horizons = widget.visualizationItems;
  const brandColorValues = brandColors;
  const [selectedIndex, setSelectedIndex] = useState(
    Math.min(horizons.length - 1, 2),
  );
  const svgId = useId();
  const current = horizons[selectedIndex];
  /** Resolve color for a horizon from brand colors by index */
  const getHorizonColor = (index: number) =>
    brandColorValues[index % brandColorValues.length] || '#333';
  const currentColor = current ? getHorizonColor(selectedIndex) : '#333';
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newShortName, setNewShortName] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const handleAdd = useCallback(() => {
    if (!newLabel.trim() || !newTitle.trim()) return;
    onAddItem?.(widget.uuid, {
      label: newLabel.trim(),
      short_name: newShortName.trim(),
      title: newTitle.trim(),
      description: newDescription.trim(),
    });
    setNewLabel('');
    setNewShortName('');
    setNewTitle('');
    setNewDescription('');
    setIsAdding(false);
  }, [
    newLabel,
    newShortName,
    newTitle,
    newDescription,
    widget.uuid,
    onAddItem,
  ]);

  const handleDelete = useCallback(
    (itemUuid: string) => {
      onDeleteItem?.(widget.uuid, itemUuid);
    },
    [widget.uuid, onDeleteItem],
  );

  const centerX = 50;
  const centerY = 60;
  const maxRadius = 52;

  return (
    <GlassSurface
      className='flex h-full min-h-[280px] flex-col overflow-visible'
      variant='default'
    >
      <div className='flex-shrink-0 px-4 pb-2 pt-3'>
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
                    widget.icon ? resolveIcon(widget.icon) : Rocket,
                    {
                      className: 'text-primary/70 h-4 w-4',
                    },
                  )}
                </button>
              }
            />
          ) : (
            React.createElement(
              widget.icon ? resolveIcon(widget.icon) : Rocket,
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
              title='Add horizon'
            >
              <Plus className='h-3.5 w-3.5' />
            </button>
          )}
        </div>
      </div>

      <div className='flex flex-1 flex-col px-0 pb-0 pt-0'>
        {/* Description panel */}
        <div className='px-4 pb-4'>
          <AnimatePresence mode='wait'>
            {current && (
              <motion.div
                key={selectedIndex}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  'group/item space-y-1',
                  current.uuid.startsWith('temp-') &&
                    'animate-pulse opacity-60',
                )}
              >
                <div className='flex items-center gap-2'>
                  <span
                    className='flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] text-white'
                    style={{ backgroundColor: currentColor }}
                  >
                    <span className='font-bold'>{current.label}</span>
                    <span className='font-light opacity-90'>
                      {current.shortName}
                    </span>
                  </span>
                  <span className='aucctus-text-primary flex-1 text-base font-semibold'>
                    {isEditable && onUpdateItem ? (
                      <EditableText
                        value={current.title}
                        onSave={(v) =>
                          onUpdateItem(widget.uuid, current.uuid, { title: v })
                        }
                      />
                    ) : (
                      current.title
                    )}
                  </span>
                  {isEditable && onDeleteItem && (
                    <button
                      type='button'
                      onClick={() => handleDelete(current.uuid)}
                      className='flex h-5 w-5 items-center justify-center rounded opacity-0 transition-opacity hover:bg-red-100 group-hover/item:opacity-100 dark:hover:bg-red-900/30'
                      title='Delete horizon'
                    >
                      <Trash2 className='h-3 w-3 text-red-500' />
                    </button>
                  )}
                </div>
                <div className='aucctus-text-secondary text-sm font-light leading-relaxed'>
                  {isEditable && onUpdateItem ? (
                    <EditableText
                      value={current.description}
                      onSave={(v) =>
                        onUpdateItem(widget.uuid, current.uuid, {
                          description: v,
                        })
                      }
                      multiline
                    />
                  ) : (
                    current.description
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Inline add form */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className='overflow-hidden px-4 pb-3'
            >
              <div className='space-y-2 rounded-lg border border-dashed border-gray-300 p-3 dark:border-gray-600'>
                <div className='flex gap-2'>
                  <input
                    type='text'
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    placeholder='Label (e.g., H4)...'
                    className='aucctus-bg-secondary aucctus-border-secondary aucctus-text-primary focus:aucctus-border-brand w-1/3 rounded-lg border px-3 py-1.5 text-sm outline-none transition-colors'
                    autoFocus
                  />
                  <input
                    type='text'
                    value={newShortName}
                    onChange={(e) => setNewShortName(e.target.value)}
                    placeholder='Short name...'
                    className='aucctus-bg-secondary aucctus-border-secondary aucctus-text-primary focus:aucctus-border-brand w-2/3 rounded-lg border px-3 py-1.5 text-sm outline-none transition-colors'
                  />
                </div>
                <input
                  type='text'
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAdd();
                    if (e.key === 'Escape') {
                      setNewLabel('');
                      setNewShortName('');
                      setNewTitle('');
                      setNewDescription('');
                      setIsAdding(false);
                    }
                  }}
                  placeholder='Title...'
                  className='aucctus-bg-secondary aucctus-border-secondary aucctus-text-primary focus:aucctus-border-brand w-full rounded-lg border px-3 py-1.5 text-sm outline-none transition-colors'
                />
                <input
                  type='text'
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAdd();
                    if (e.key === 'Escape') {
                      setNewLabel('');
                      setNewShortName('');
                      setNewTitle('');
                      setNewDescription('');
                      setIsAdding(false);
                    }
                  }}
                  placeholder='Description (optional)...'
                  className='aucctus-bg-secondary aucctus-border-secondary aucctus-text-primary focus:aucctus-border-brand w-full rounded-lg border px-3 py-1.5 text-sm outline-none transition-colors'
                />
                <div className='flex items-center gap-2'>
                  <button
                    type='button'
                    onClick={handleAdd}
                    disabled={!newLabel.trim() || !newTitle.trim()}
                    className='aucctus-bg-brand-solid rounded-lg px-3 py-1.5 text-xs font-medium text-white transition-opacity disabled:opacity-50'
                  >
                    Add
                  </button>
                  <button
                    type='button'
                    onClick={() => {
                      setNewLabel('');
                      setNewShortName('');
                      setNewTitle('');
                      setNewDescription('');
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

        {/* Half-circle radar */}
        <div className='relative flex-1' style={{ overflow: 'visible' }}>
          <svg
            width='100%'
            height='100%'
            viewBox='-5 -13 110 71'
            preserveAspectRatio='xMidYMax slice'
            className='absolute inset-0'
          >
            <defs>
              {/* Glass refraction gradient for depth */}
              <linearGradient
                id={`${svgId}-refraction`}
                x1='0%'
                y1='0%'
                x2='0%'
                y2='100%'
              >
                <stop offset='0%' stopColor='white' stopOpacity='0.08' />
                <stop offset='50%' stopColor='white' stopOpacity='0.02' />
                <stop offset='100%' stopColor='white' stopOpacity='0.05' />
              </linearGradient>

              {/* Specular highlight for glass edge */}
              <linearGradient
                id={`${svgId}-specular`}
                x1='0%'
                y1='0%'
                x2='100%'
                y2='100%'
              >
                <stop offset='0%' stopColor='white' stopOpacity='0.15' />
                <stop offset='50%' stopColor='white' stopOpacity='0' />
                <stop offset='100%' stopColor='white' stopOpacity='0.08' />
              </linearGradient>

              {/* Depth gradients per horizon */}
              {horizons.map((h, i) => (
                <radialGradient
                  key={`depth-${i}`}
                  id={`${svgId}-depth${i}`}
                  cx='50%'
                  cy='100%'
                  r='100%'
                >
                  <stop
                    offset='0%'
                    stopColor={getHorizonColor(i)}
                    stopOpacity={i === 0 ? '0.35' : i === 1 ? '0.5' : '0.45'}
                  />
                  <stop
                    offset='100%'
                    stopColor={getHorizonColor(i)}
                    stopOpacity={i === 0 ? '0.15' : i === 1 ? '0.25' : '0.2'}
                  />
                </radialGradient>
              ))}

              {/* Ambient glow radials per horizon */}
              {horizons.map((h, i) => {
                const radii = [0.35, 0.67, 1];
                return (
                  <radialGradient
                    key={`glow-${i}`}
                    id={`${svgId}-glow${i}`}
                    cx='50%'
                    cy='100%'
                    r={`${radii[i] * 100}%`}
                  >
                    <stop
                      offset='0%'
                      stopColor={getHorizonColor(i)}
                      stopOpacity={i === 0 ? '0.18' : i === 1 ? '0.3' : '0.25'}
                    />
                    <stop
                      offset='60%'
                      stopColor={getHorizonColor(i)}
                      stopOpacity={i === 0 ? '0.05' : i === 1 ? '0.12' : '0.08'}
                    />
                    <stop
                      offset='100%'
                      stopColor={getHorizonColor(i)}
                      stopOpacity='0'
                    />
                  </radialGradient>
                );
              })}

              {/* Prismatic gradients per horizon for rim */}
              {horizons.map((h, i) => (
                <linearGradient
                  key={`prismatic-${i}`}
                  id={`${svgId}-prismatic${i}`}
                  x1='0%'
                  y1='50%'
                  x2='100%'
                  y2='50%'
                >
                  <stop offset='0%' stopColor='white' stopOpacity='0.4' />
                  <stop
                    offset='25%'
                    stopColor={getHorizonColor(i)}
                    stopOpacity={i === 0 ? '0.3' : i === 1 ? '0.45' : '0.35'}
                  />
                  <stop
                    offset='50%'
                    stopColor={getHorizonColor(i)}
                    stopOpacity={i === 0 ? '0.25' : i === 1 ? '0.4' : '0.3'}
                  />
                  <stop
                    offset='75%'
                    stopColor={getHorizonColor(i)}
                    stopOpacity={i === 0 ? '0.3' : i === 1 ? '0.45' : '0.35'}
                  />
                  <stop offset='100%' stopColor='white' stopOpacity='0.4' />
                </linearGradient>
              ))}

              {/* Liquid glass filter layers */}
              <filter
                id={`${svgId}-diffuseGlow`}
                x='-100%'
                y='-100%'
                width='300%'
                height='300%'
              >
                <feGaussianBlur
                  in='SourceGraphic'
                  stdDeviation='2.5'
                  result='blur'
                />
                <feColorMatrix in='blur' type='saturate' values='1.3' />
              </filter>

              <filter
                id={`${svgId}-colorBleed`}
                x='-50%'
                y='-50%'
                width='200%'
                height='200%'
              >
                <feTurbulence
                  type='fractalNoise'
                  baseFrequency='0.02'
                  numOctaves='3'
                  seed='15'
                  result='noise'
                />
                <feDisplacementMap
                  in='SourceGraphic'
                  in2='noise'
                  scale='2.5'
                  xChannelSelector='R'
                  yChannelSelector='G'
                  result='displaced'
                />
                <feGaussianBlur
                  in='displaced'
                  stdDeviation='1.5'
                  result='blur'
                />
                <feColorMatrix in='blur' type='saturate' values='1.6' />
              </filter>

              <filter
                id={`${svgId}-frostedCore`}
                x='-50%'
                y='-50%'
                width='200%'
                height='200%'
              >
                <feGaussianBlur
                  in='SourceGraphic'
                  stdDeviation='0.8'
                  result='blur1'
                />
                <feGaussianBlur
                  in='SourceGraphic'
                  stdDeviation='2'
                  result='blur2'
                />
                <feGaussianBlur
                  in='SourceGraphic'
                  stdDeviation='3.5'
                  result='blur3'
                />
                <feMerge>
                  <feMergeNode in='blur3' />
                  <feMergeNode in='blur2' />
                  <feMergeNode in='blur1' />
                  <feMergeNode in='SourceGraphic' />
                </feMerge>
              </filter>

              <filter
                id={`${svgId}-specularEdge`}
                x='-50%'
                y='-50%'
                width='200%'
                height='200%'
              >
                <feFlood floodColor='white' floodOpacity='0.7' result='flood' />
                <feComposite
                  in='flood'
                  in2='SourceGraphic'
                  operator='in'
                  result='masked'
                />
                <feGaussianBlur in='masked' stdDeviation='0.3' result='blur' />
                <feMerge>
                  <feMergeNode in='blur' />
                  <feMergeNode in='SourceGraphic' />
                </feMerge>
              </filter>

              <filter
                id={`${svgId}-innerShadow`}
                x='-50%'
                y='-50%'
                width='200%'
                height='200%'
              >
                <feGaussianBlur in='SourceGraphic' stdDeviation='0.6' />
              </filter>
            </defs>

            <g>
              {/* Ring outlines */}
              {DEFAULT_RING_RADII.map((ring, i) => (
                <path
                  key={`outline-${i}`}
                  d={`M ${centerX - ring.outerRadius * maxRadius} ${centerY} A ${ring.outerRadius * maxRadius} ${ring.outerRadius * maxRadius} 0 0 1 ${centerX + ring.outerRadius * maxRadius} ${centerY}`}
                  fill='none'
                  stroke='currentColor'
                  strokeOpacity={0.08}
                  strokeWidth='0.2'
                  className='text-muted-foreground'
                />
              ))}

              {/* Ambient glow layer from selected ring */}
              <path
                d={getRingPath(0, 1, maxRadius, centerX, centerY)}
                fill={`url(#${svgId}-glow${selectedIndex})`}
                className='pointer-events-none transition-opacity duration-500'
              />

              {/* Ring sections - outer to inner */}
              {[...DEFAULT_RING_RADII]
                .map((ring, i) => ({ ...ring, index: i }))
                .reverse()
                .map((ring) => {
                  const isSelected = selectedIndex === ring.index;
                  const horizon = horizons[ring.index];
                  if (!horizon) return null;
                  const color = getHorizonColor(ring.index);
                  const labelRadius =
                    ((ring.innerRadius + ring.outerRadius) / 2) * maxRadius;

                  return (
                    <g key={ring.index}>
                      {/* Glass base */}
                      <path
                        d={getRingPath(
                          ring.innerRadius,
                          ring.outerRadius,
                          maxRadius,
                          centerX,
                          centerY,
                        )}
                        fill={`url(#${svgId}-refraction)`}
                        className='pointer-events-none'
                      />

                      {/* Specular highlight layer (unselected only) */}
                      {!isSelected && (
                        <path
                          d={getRingPath(
                            ring.innerRadius,
                            ring.outerRadius,
                            maxRadius,
                            centerX,
                            centerY,
                          )}
                          fill={`url(#${svgId}-specular)`}
                          fillOpacity={0.5}
                          className='pointer-events-none'
                        />
                      )}

                      {/* Selected state: depth gradient fill + 5-layer liquid glass rim */}
                      {isSelected && (
                        <>
                          {/* Depth gradient fill */}
                          <path
                            d={getRingPath(
                              ring.innerRadius,
                              ring.outerRadius,
                              maxRadius,
                              centerX,
                              centerY,
                            )}
                            fill={`url(#${svgId}-depth${ring.index})`}
                            className='pointer-events-none'
                          />

                          {/* Layer 1: Diffuse outer glow */}
                          <path
                            d={getOuterArcPath(
                              ring.outerRadius,
                              maxRadius,
                              centerX,
                              centerY,
                            )}
                            fill='none'
                            stroke='white'
                            strokeWidth={6}
                            strokeOpacity={0.06}
                            strokeLinecap='round'
                            filter={`url(#${svgId}-diffuseGlow)`}
                            className='pointer-events-none'
                          />

                          {/* Layer 2: Color bleed - chromatic distortion */}
                          <path
                            d={getOuterArcPath(
                              ring.outerRadius,
                              maxRadius,
                              centerX,
                              centerY,
                            )}
                            fill='none'
                            stroke={`url(#${svgId}-prismatic${ring.index})`}
                            strokeWidth={6}
                            strokeLinecap='round'
                            filter={`url(#${svgId}-colorBleed)`}
                            className='pointer-events-none'
                          />

                          {/* Layer 3: Frosted glass core */}
                          <path
                            d={getOuterArcPath(
                              ring.outerRadius,
                              maxRadius,
                              centerX,
                              centerY,
                            )}
                            fill='none'
                            stroke='white'
                            strokeWidth={4.5}
                            strokeOpacity={0.45}
                            strokeLinecap='round'
                            filter={`url(#${svgId}-frostedCore)`}
                            className='pointer-events-none'
                          />

                          {/* Layer 4: Specular edge highlight */}
                          <path
                            d={getOuterArcPath(
                              ring.outerRadius,
                              maxRadius,
                              centerX,
                              centerY,
                            )}
                            fill='none'
                            stroke='white'
                            strokeWidth={1.5}
                            strokeOpacity={0.7}
                            strokeLinecap='round'
                            filter={`url(#${svgId}-specularEdge)`}
                            className='pointer-events-none'
                          />

                          {/* Layer 5: Inner shadow for depth */}
                          <path
                            d={`M ${centerX - ring.innerRadius * maxRadius} ${centerY} A ${ring.innerRadius * maxRadius} ${ring.innerRadius * maxRadius} 0 0 1 ${centerX + ring.innerRadius * maxRadius} ${centerY}`}
                            fill='none'
                            stroke='black'
                            strokeWidth={0.8}
                            strokeOpacity={0.12}
                            strokeLinecap='round'
                            filter={`url(#${svgId}-innerShadow)`}
                            className='pointer-events-none'
                          />
                        </>
                      )}

                      {/* Clickable area */}
                      <path
                        d={getRingPath(
                          ring.innerRadius,
                          ring.outerRadius,
                          maxRadius,
                          centerX,
                          centerY,
                        )}
                        fill='transparent'
                        stroke={isSelected ? 'transparent' : 'currentColor'}
                        strokeWidth={0.12}
                        strokeOpacity={0.08}
                        className='text-muted-foreground cursor-pointer transition-all duration-300'
                        onClick={() => setSelectedIndex(ring.index)}
                      />

                      {/* Label */}
                      <text
                        x={centerX}
                        y={centerY - labelRadius}
                        textAnchor='middle'
                        dominantBaseline='middle'
                        fill={isSelected ? color : 'currentColor'}
                        fontWeight={isSelected ? '700' : '500'}
                        fontSize='4'
                        className='text-muted-foreground cursor-pointer transition-all duration-300'
                        style={{ opacity: isSelected ? 1 : 0.4 }}
                        onClick={() => setSelectedIndex(ring.index)}
                      >
                        {horizon.label}
                      </text>
                    </g>
                  );
                })}
            </g>
          </svg>
        </div>
      </div>
    </GlassSurface>
  );
};

export default InnovationHorizonsWidget;

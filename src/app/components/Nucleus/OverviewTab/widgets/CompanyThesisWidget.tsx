/**
 * CompanyThesisWidget - Full-width hero banner displaying the company's strategic thesis.
 *
 * Features animated gradient orbs using brand colors, frosted glass rim,
 * and a clean inner surface with the thesis title and description.
 */

import { GlassSurface } from '@components';
import { IconPickerDropdown } from '@components/Dropdown';
import type { INucleusOverviewWidget } from '@libs/api/types/nucleusOverview';
import { resolveIcon } from '@libs/utils/iconMap';
import { VALID_OVERVIEW_WIDGET_ICONS } from './constants';
import { motion } from 'framer-motion';
import { Compass } from 'lucide-react';
import React, { useCallback, useState } from 'react';

interface CompanyThesisWidgetProps {
  widget: INucleusOverviewWidget;
  brandColors: Record<string, string>;
  isEditable?: boolean;
  onUpdateWidget?: (widgetUuid: string, data: Record<string, unknown>) => void;
}

const DEFAULT_COLORS = {
  teal: '#C1DDDF',
  purple: '#8F46E2',
  dark: '#333333',
};

/** Inline editable text that becomes an input/textarea on click. */
const EditableThesisField: React.FC<{
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
    <div
      onClick={() => setIsEditing(true)}
      className={`hover:aucctus-text-brand-primary cursor-text ${className ?? ''}`}
      role='button'
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') setIsEditing(true);
      }}
    >
      {value}
    </div>
  );
};

const CompanyThesisWidget: React.FC<CompanyThesisWidgetProps> = ({
  widget,
  brandColors,
  isEditable = false,
  onUpdateWidget,
}) => {
  const colorValues = Object.values(brandColors);
  const c1 = colorValues[0] || DEFAULT_COLORS.teal;
  const c2 = colorValues[1] || DEFAULT_COLORS.purple;
  const c3 = colorValues[2] || DEFAULT_COLORS.dark;

  return (
    <div className='relative col-span-full min-h-[160px] overflow-hidden rounded-xl'>
      {/* Layer 0: Floating Gradient Orbs */}
      <div className='absolute inset-0 overflow-hidden rounded-xl'>
        <motion.div
          className='absolute -left-20 -top-20 h-[500px] w-[500px] rounded-full opacity-60'
          style={{
            background: `radial-gradient(circle, ${c1}90 0%, transparent 70%)`,
          }}
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className='absolute -bottom-24 -right-16 h-[450px] w-[450px] rounded-full opacity-70'
          style={{
            background: `radial-gradient(circle, ${c2}A0 0%, transparent 70%)`,
          }}
          animate={{ x: [0, -30, 0], y: [0, -25, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className='absolute right-1/4 top-1/2 h-[350px] w-[350px] -translate-y-1/2 rounded-full opacity-40'
          style={{
            background: `radial-gradient(circle, ${c3}70 0%, transparent 70%)`,
          }}
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
        />
      </div>

      {/* Layer 1: Glass Rim */}
      <div
        className='absolute inset-0 rounded-xl'
        style={{
          backdropFilter: 'blur(24px) saturate(2.0)',
          WebkitBackdropFilter: 'blur(24px) saturate(2.0)',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '0.5px solid rgba(255, 255, 255, 0.28)',
          boxShadow:
            'inset 0 1px 1px rgba(255, 255, 255, 0.1), inset 0 -1px 1px rgba(0, 0, 0, 0.05)',
        }}
      >
        <div
          className='absolute inset-0 rounded-xl opacity-30'
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(255,255,255,0.08) 100%)',
          }}
        />
      </div>

      {/* Layer 2: Inner Surface */}
      <GlassSurface
        className='relative z-10 m-2 rounded-lg px-6 py-5'
        variant='elevated'
      >
        <div className='mb-3 flex items-center gap-2'>
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
                    widget.icon ? resolveIcon(widget.icon) : Compass,
                    {
                      className: 'text-primary/70 h-4 w-4',
                    },
                  )}
                </button>
              }
            />
          ) : (
            React.createElement(
              widget.icon ? resolveIcon(widget.icon) : Compass,
              {
                className: 'text-primary/70 h-4 w-4',
              },
            )
          )}
          <span className='aucctus-text-xs-medium aucctus-text-tertiary uppercase tracking-wider'>
            Innovation Thesis
          </span>
        </div>
        <div>
          {isEditable && onUpdateWidget ? (
            <>
              <EditableThesisField
                value={widget.title}
                onSave={(v) => onUpdateWidget(widget.uuid, { title: v })}
                className='aucctus-text-primary mb-2 text-xl font-semibold leading-snug tracking-tight md:text-2xl lg:text-[1.75rem]'
              />
              {widget.description && (
                <EditableThesisField
                  value={widget.description}
                  onSave={(v) =>
                    onUpdateWidget(widget.uuid, { description: v })
                  }
                  className='aucctus-text-secondary max-w-3xl text-sm leading-relaxed md:text-base'
                  multiline
                />
              )}
            </>
          ) : (
            <>
              <h2 className='aucctus-text-primary mb-2 text-xl font-semibold leading-snug tracking-tight md:text-2xl lg:text-[1.75rem]'>
                {widget.title}
              </h2>
              {widget.description && (
                <p className='aucctus-text-secondary max-w-3xl text-sm leading-relaxed md:text-base'>
                  {widget.description}
                </p>
              )}
            </>
          )}
        </div>
      </GlassSurface>
    </div>
  );
};

export default CompanyThesisWidget;

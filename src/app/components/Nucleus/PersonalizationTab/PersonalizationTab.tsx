/**
 * PersonalizationTab - Brand customization for the Nucleus company profile.
 *
 * Two-column layout:
 * - Left: Company name (editable), website domain (editable), brand colors (editable, drag-to-reorder)
 * - Right: Logo upload (drag-drop), HQ image upload (drag-drop)
 *
 * Connected to useAccountBranding hooks for persistence.
 */

import {
  useAccountBranding,
  useDeleteLogoVariant,
  useUpdateBranding,
  useUploadHqImage,
  useUploadLogoVariant,
} from '@hooks/query/accountBranding.hook';
import { useUpdateAccount } from '@hooks/query/account.hook';
import type {
  IAccountLogos,
  LogoVariantName,
} from '@libs/api/types/accountBranding';
import useStore from '@stores/store';
import { cn } from '@libs/utils/react';
import {
  closestCenter,
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  horizontalListSortingStrategy,
  SortableContext,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2,
  Check,
  Globe,
  GripVertical,
  Palette,
  Pencil,
  Plus,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ColorPicker } from '@components/ColorPicker';

/* ------------------------------------------------------------------ */
/* Sortable color swatch                                               */
/* ------------------------------------------------------------------ */

const SortableColorSwatch: React.FC<{
  id: string;
  hex: string;
  onRemove: () => void;
}> = ({ id, hex, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className='group relative'>
      <div
        className={cn(
          'border-border/40 flex h-14 w-14 items-center justify-center rounded-lg border shadow-sm transition-transform',
          isDragging ? 'scale-110 shadow-lg' : 'hover:scale-105',
        )}
        style={{ backgroundColor: hex }}
      >
        <button
          {...attributes}
          {...listeners}
          className='absolute inset-0 flex cursor-grab items-center justify-center rounded-lg opacity-0 transition-opacity active:cursor-grabbing group-hover:opacity-100'
          style={{ background: 'rgba(0,0,0,0.25)' }}
        >
          <GripVertical className='h-4 w-4 text-white drop-shadow' />
        </button>
        <button
          onClick={onRemove}
          className='border-border bg-background hover:border-destructive hover:bg-destructive hover:text-destructive-foreground absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border opacity-0 shadow-md transition-opacity group-hover:opacity-100'
        >
          <X className='h-2.5 w-2.5' />
        </button>
      </div>
      <p className='aucctus-text-tertiary mt-1 text-center text-[9px] uppercase'>
        {hex}
      </p>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Logo variant slot                                                   */
/* ------------------------------------------------------------------ */

interface LogoVariantSlotConfig {
  variant: LogoVariantName;
  label: string;
  description: string;
  previewBgClass: string;
}

const LOGO_VARIANT_SLOTS: LogoVariantSlotConfig[] = [
  {
    variant: 'color',
    label: 'Original',
    description: 'Full-colour logo. Used wherever it has enough contrast.',
    previewBgClass: 'bg-neutral-200',
  },
  {
    variant: 'light',
    label: 'Light',
    description: 'Light-coloured (often white) logo for dark surfaces.',
    previewBgClass: 'bg-neutral-900',
  },
  {
    variant: 'dark',
    label: 'Dark',
    description: 'Dark-coloured (often black) logo for light surfaces.',
    previewBgClass: 'bg-white',
  },
];

const LogoVariantSlot: React.FC<{
  config: LogoVariantSlotConfig;
  url: string | null | undefined;
  isUploading: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}> = ({ config, url, isUploading, onUpload, onRemove }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file: File | undefined) => {
      if (file && file.type.startsWith('image/')) {
        onUpload(file);
      }
    },
    [onUpload],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      handleFile(e.dataTransfer.files[0]);
    },
    [handleFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFile(e.target.files?.[0]);
      e.target.value = '';
    },
    [handleFile],
  );

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove();
    },
    [onRemove],
  );

  return (
    <div className='border-border/40 bg-muted/20 flex flex-col rounded-xl border p-4 backdrop-blur-xl'>
      <div className='mb-2 flex items-center justify-between'>
        <span className='aucctus-text-tertiary text-[10px] uppercase tracking-wider'>
          {config.label}
        </span>
        {url && (
          <button
            type='button'
            onClick={handleRemove}
            disabled={isUploading}
            className='aucctus-text-tertiary transition-colors hover:text-red-400 disabled:opacity-50'
            aria-label={`Remove ${config.label} logo`}
          >
            <Trash2 className='h-3.5 w-3.5' />
          </button>
        )}
      </div>
      <p className='aucctus-text-secondary mb-3 text-xs'>
        {config.description}
      </p>
      <div
        className={cn(
          'relative flex h-32 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-all duration-300',
          isDragging
            ? 'border-primary scale-[1.01]'
            : 'border-border/60 hover:border-border',
          url ? config.previewBgClass : 'bg-black/10',
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type='file'
          accept='image/*'
          className='hidden'
          onChange={handleSelect}
        />
        {url ? (
          <div className='group relative h-full w-full'>
            <img
              src={url}
              alt={`${config.label} logo`}
              className='h-full w-full object-contain p-3'
            />
            <div className='absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 opacity-0 transition-opacity group-hover:opacity-100'>
              <span className='text-xs font-medium text-white'>
                Click to replace
              </span>
            </div>
          </div>
        ) : (
          <div className='aucctus-text-tertiary flex flex-col items-center gap-2'>
            <Upload className='h-5 w-5' />
            <span className='text-xs'>Drop logo or click to browse</span>
          </div>
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

const PersonalizationTab: React.FC = () => {
  const account = useStore((state) => state.auth.account);
  const { branding } = useAccountBranding();
  const updateMutation = useUpdateBranding();
  const updateAccountMutation = useUpdateAccount();
  const uploadLogoVariantMutation = useUploadLogoVariant();
  const deleteLogoVariantMutation = useDeleteLogoVariant();
  const uploadHqMutation = useUploadHqImage();

  const logos: IAccountLogos = useMemo(
    () => branding?.logos ?? {},
    [branding?.logos],
  );

  const [isDraggingHQ, setIsDraggingHQ] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [newColor, setNewColor] = useState('#6366F1');

  // Editable company name
  const [isEditingName, setIsEditingName] = useState(false);
  const [editName, setEditName] = useState(account?.name ?? '');
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Editable website domain
  const [isEditingDomain, setIsEditingDomain] = useState(false);
  const [editDomain, setEditDomain] = useState(account?.domain ?? '');
  const domainInputRef = useRef<HTMLInputElement>(null);

  // Sync local state when account changes
  useEffect(() => {
    if (!isEditingName) setEditName(account?.name ?? '');
  }, [account?.name, isEditingName]);

  useEffect(() => {
    if (!isEditingDomain) setEditDomain(account?.domain ?? '');
  }, [account?.domain, isEditingDomain]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditingName) nameInputRef.current?.focus();
  }, [isEditingName]);

  useEffect(() => {
    if (isEditingDomain) domainInputRef.current?.focus();
  }, [isEditingDomain]);

  const saveName = useCallback(() => {
    const trimmed = editName.trim();
    if (trimmed && trimmed !== account?.name) {
      updateAccountMutation.mutate({ name: trimmed });
    }
    setIsEditingName(false);
  }, [editName, account?.name, updateAccountMutation]);

  const saveDomain = useCallback(() => {
    const trimmed = editDomain.trim();
    if (trimmed && trimmed !== account?.domain) {
      updateAccountMutation.mutate({ domain: trimmed });
    }
    setIsEditingDomain(false);
  }, [editDomain, account?.domain, updateAccountMutation]);

  const addColorBtnRef = useRef<HTMLButtonElement>(null);
  const hqInputRef = useRef<HTMLInputElement>(null);

  // Brand colors as ordered list
  const brandColors = useMemo(() => branding?.colors ?? [], [branding?.colors]);

  // Sortable IDs (dnd-kit needs string ids)
  const colorIds = brandColors.map((_hex: string, i: number) => `color-${i}`);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const oldIndex = colorIds.indexOf(String(active.id));
      const newIndex = colorIds.indexOf(String(over.id));
      const reordered = arrayMove(brandColors, oldIndex, newIndex);
      updateMutation.mutate({ colors: reordered });
    },
    [brandColors, colorIds, updateMutation],
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent, setDragging: (v: boolean) => void) => {
      e.preventDefault();
      setDragging(true);
    },
    [],
  );

  const handleDragLeave = useCallback((setDragging: (v: boolean) => void) => {
    setDragging(false);
  }, []);

  const handleHqDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingHQ(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        uploadHqMutation.mutate(file);
      }
    },
    [uploadHqMutation],
  );

  const handleHqSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        uploadHqMutation.mutate(file);
      }
    },
    [uploadHqMutation],
  );

  const removeColor = useCallback(
    (index: number) => {
      const updated = brandColors.filter((_: string, i: number) => i !== index);
      updateMutation.mutate({ colors: updated });
    },
    [brandColors, updateMutation],
  );

  return (
    <div className='space-y-8'>
      {/* Header */}
      <div className='mb-6'>
        <h2 className='aucctus-text-primary mb-2 text-2xl font-semibold'>
          Brand Personalization
        </h2>
        <p className='aucctus-text-secondary text-sm'>
          Customize your company&apos;s visual identity across the platform
        </p>
      </div>

      {/* Two Column Layout */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-[minmax(280px,380px)_1fr]'>
        {/* Left Column */}
        <div className='space-y-4'>
          {/* Company Name (editable) */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className='rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 backdrop-blur-xl'
          >
            <div className='mb-1 flex items-center justify-between'>
              <span className='aucctus-text-tertiary text-[10px] uppercase tracking-wider'>
                Full Company Name
              </span>
              {!isEditingName && (
                <button
                  onClick={() => setIsEditingName(true)}
                  className='aucctus-text-tertiary hover:aucctus-text-primary transition-colors'
                >
                  <Pencil className='h-3 w-3' />
                </button>
              )}
            </div>
            {isEditingName ? (
              <div className='flex items-center gap-2'>
                <input
                  ref={nameInputRef}
                  type='text'
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveName();
                    if (e.key === 'Escape') {
                      setEditName(account?.name ?? '');
                      setIsEditingName(false);
                    }
                  }}
                  className='aucctus-text-primary flex-1 border-b border-emerald-500/50 bg-transparent text-xl font-bold outline-none'
                />
                <button
                  onClick={saveName}
                  className='text-emerald-400 transition-colors hover:text-emerald-300'
                >
                  <Check className='h-4 w-4' />
                </button>
                <button
                  onClick={() => {
                    setEditName(account?.name ?? '');
                    setIsEditingName(false);
                  }}
                  className='aucctus-text-tertiary hover:aucctus-text-primary transition-colors'
                >
                  <X className='h-4 w-4' />
                </button>
              </div>
            ) : (
              <p className='aucctus-text-primary text-xl font-bold'>
                {account?.name || branding?.brandName || '\u2014'}
              </p>
            )}
          </motion.div>

          {/* Website Domain (editable) */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className='rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 backdrop-blur-xl'
          >
            <div className='mb-1 flex items-center justify-between'>
              <span className='aucctus-text-tertiary flex items-center gap-1.5 text-[10px] uppercase tracking-wider'>
                <Globe className='h-3 w-3' /> Website Domain
              </span>
              {!isEditingDomain && (
                <button
                  onClick={() => setIsEditingDomain(true)}
                  className='aucctus-text-tertiary hover:aucctus-text-primary transition-colors'
                >
                  <Pencil className='h-3 w-3' />
                </button>
              )}
            </div>
            {isEditingDomain ? (
              <div className='flex items-center gap-2'>
                <input
                  ref={domainInputRef}
                  type='text'
                  value={editDomain}
                  onChange={(e) => setEditDomain(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') saveDomain();
                    if (e.key === 'Escape') {
                      setEditDomain(account?.domain ?? '');
                      setIsEditingDomain(false);
                    }
                  }}
                  placeholder='https://example.com'
                  className='aucctus-text-primary flex-1 border-b border-emerald-500/50 bg-transparent text-lg font-medium outline-none'
                />
                <button
                  onClick={saveDomain}
                  className='text-emerald-400 transition-colors hover:text-emerald-300'
                >
                  <Check className='h-4 w-4' />
                </button>
                <button
                  onClick={() => {
                    setEditDomain(account?.domain ?? '');
                    setIsEditingDomain(false);
                  }}
                  className='aucctus-text-tertiary hover:aucctus-text-primary transition-colors'
                >
                  <X className='h-4 w-4' />
                </button>
              </div>
            ) : (
              <p className='aucctus-text-primary text-lg font-medium'>
                {account?.domain || '\u2014'}
              </p>
            )}
          </motion.div>

          {/* Brand Colors */}
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className='border-border/40 bg-muted/20 rounded-xl border p-4 backdrop-blur-xl'
          >
            <div className='mb-3 flex items-center justify-between'>
              <span className='aucctus-text-tertiary flex items-center gap-1.5 text-[10px] uppercase tracking-wider'>
                <Palette className='h-3 w-3' /> Brand Colors
              </span>
              <span className='aucctus-text-tertiary text-xs'>
                {brandColors.length}/5
              </span>
            </div>

            <div className='flex flex-wrap gap-2'>
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={colorIds}
                  strategy={horizontalListSortingStrategy}
                >
                  <AnimatePresence mode='popLayout'>
                    {brandColors.map((hex: string, index: number) => (
                      <motion.div
                        key={`${hex}-${index}`}
                        layout
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                      >
                        <SortableColorSwatch
                          id={colorIds[index]}
                          hex={hex}
                          onRemove={() => removeColor(index)}
                        />
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </SortableContext>
              </DndContext>

              {brandColors.length < 5 && (
                <motion.button
                  ref={addColorBtnRef}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setColorPickerOpen((prev) => !prev)}
                  className='border-border/60 bg-muted/20 hover:border-primary/50 hover:bg-muted/40 flex h-14 w-14 items-center justify-center rounded-lg border-2 border-dashed transition-all'
                >
                  <Plus className='aucctus-text-tertiary h-4 w-4' />
                </motion.button>
              )}

              <AnimatePresence>
                {colorPickerOpen && (
                  <ColorPicker
                    value={newColor}
                    anchorRef={addColorBtnRef}
                    onChange={(hex) => {
                      if (brandColors.length < 5) {
                        updateMutation.mutate({
                          colors: [...brandColors, hex],
                        });
                      }
                      setColorPickerOpen(false);
                      setNewColor('#6366F1');
                    }}
                    onClose={() => setColorPickerOpen(false)}
                  />
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className='flex-1 space-y-4'>
          {/* Logo Variants */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <span className='aucctus-text-tertiary mb-3 block text-[10px] uppercase tracking-wider'>
              Company Logos
            </span>
            <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
              {LOGO_VARIANT_SLOTS.map((slot) => (
                <LogoVariantSlot
                  key={slot.variant}
                  config={slot}
                  url={logos[slot.variant]?.url ?? null}
                  isUploading={
                    uploadLogoVariantMutation.isLoading ||
                    deleteLogoVariantMutation.isLoading
                  }
                  onUpload={(file) =>
                    uploadLogoVariantMutation.mutate({
                      variant: slot.variant,
                      file,
                    })
                  }
                  onRemove={() =>
                    deleteLogoVariantMutation.mutate(slot.variant)
                  }
                />
              ))}
            </div>
          </motion.div>

          {/* HQ Image Upload */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            className='border-border/40 bg-muted/20 rounded-xl border p-4 backdrop-blur-xl'
          >
            <span className='aucctus-text-tertiary mb-3 flex items-center gap-1.5 text-[10px] uppercase tracking-wider'>
              <Building2 className='h-3 w-3' /> Headquarters / Branch Image
            </span>
            <div
              className={cn(
                'relative flex h-48 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-all duration-300',
                isDraggingHQ
                  ? 'border-primary bg-primary/5 scale-[1.01]'
                  : 'border-border/60 bg-background/50 hover:border-border',
              )}
              onDragOver={(e) => handleDragOver(e, setIsDraggingHQ)}
              onDragLeave={() => handleDragLeave(setIsDraggingHQ)}
              onDrop={handleHqDrop}
              onClick={() => hqInputRef.current?.click()}
            >
              <input
                ref={hqInputRef}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={handleHqSelect}
              />
              {branding?.hqImageUrl ? (
                <div className='group relative h-full w-full'>
                  <img
                    src={branding.hqImageUrl}
                    alt='Headquarters'
                    className='h-full w-full rounded-md object-cover'
                  />
                  <div className='absolute inset-0 flex items-center justify-center rounded-md bg-black/50 opacity-0 transition-opacity group-hover:opacity-100'>
                    <span className='text-xs font-medium text-white'>
                      Click to replace
                    </span>
                  </div>
                </div>
              ) : (
                <div className='aucctus-text-tertiary flex flex-col items-center gap-2'>
                  <Building2 className='h-5 w-5' />
                  <span className='text-xs'>Drop image or click to browse</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PersonalizationTab;

/**
 * PersonalizationTab - Brand customization for the Nucleus company profile.
 *
 * Two-column layout:
 * - Left: Company name (readonly), website domain (readonly), brand colors (editable)
 * - Right: Logo upload (drag-drop), HQ image upload (drag-drop)
 *
 * Connected to useAccountBranding hooks for persistence.
 */

import {
  useAccountBranding,
  useUpdateBranding,
  useUploadHqImage,
  useUploadLogo,
} from '@hooks/query/accountBranding.hook';
import { useUpdateAccount } from '@hooks/query/account.hook';
import { useAccountLogo } from '@hooks/query/admin.hook';
import useStore from '@stores/store';
import { cn } from '@libs/utils/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Building2,
  Check,
  Globe,
  Palette,
  Pencil,
  Plus,
  Upload,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface BrandColor {
  id: string;
  hex: string;
  name: string;
}

const PersonalizationTab: React.FC = () => {
  const account = useStore((state) => state.auth.account);
  const { branding } = useAccountBranding();
  const { logoUrl: accountLogoUrl } = useAccountLogo();
  const updateMutation = useUpdateBranding();
  const updateAccountMutation = useUpdateAccount();
  const uploadLogoMutation = useUploadLogo();
  const uploadHqMutation = useUploadHqImage();

  const [isDraggingLogo, setIsDraggingLogo] = useState(false);
  const [isDraggingHQ, setIsDraggingHQ] = useState(false);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const [newColor, setNewColor] = useState('#6366F1');
  const [newColorName, setNewColorName] = useState('');

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

  const logoInputRef = useRef<HTMLInputElement>(null);
  const hqInputRef = useRef<HTMLInputElement>(null);

  // Derive brand colors from branding data
  const brandColors: BrandColor[] = Object.entries(branding?.colors ?? {}).map(
    ([name, hex], i) => ({
      id: String(i),
      hex,
      name,
    }),
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

  const handleLogoDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDraggingLogo(false);
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        uploadLogoMutation.mutate(file);
      }
    },
    [uploadLogoMutation],
  );

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

  const handleLogoSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        uploadLogoMutation.mutate(file);
      }
    },
    [uploadLogoMutation],
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

  const addColor = useCallback(() => {
    if (brandColors.length >= 5) return;
    const updatedColors: Record<string, string> = {
      ...(branding?.colors ?? {}),
    };
    const name = newColorName || `Color ${brandColors.length + 1}`;
    updatedColors[name] = newColor;
    updateMutation.mutate({ colors: updatedColors });
    setColorPickerOpen(false);
    setNewColor('#6366F1');
    setNewColorName('');
  }, [
    brandColors.length,
    branding?.colors,
    newColor,
    newColorName,
    updateMutation,
  ]);

  const removeColor = useCallback(
    (colorName: string) => {
      const updatedColors: Record<string, string> = {
        ...(branding?.colors ?? {}),
      };
      delete updatedColors[colorName];
      updateMutation.mutate({ colors: updatedColors });
    },
    [branding?.colors, updateMutation],
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
                {account?.name || branding?.brandName || '—'}
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
                {account?.domain || '—'}
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
              <AnimatePresence mode='popLayout'>
                {brandColors.map((color) => (
                  <motion.div
                    key={color.id}
                    layout
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className='group relative'
                  >
                    <div
                      className='border-border/40 flex h-14 w-14 items-center justify-center rounded-lg border shadow-sm transition-transform hover:scale-105'
                      style={{ backgroundColor: color.hex }}
                    >
                      <button
                        onClick={() => removeColor(color.name)}
                        className='border-border bg-background hover:border-destructive hover:bg-destructive hover:text-destructive-foreground absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full border opacity-0 shadow-md transition-opacity group-hover:opacity-100'
                      >
                        <X className='h-2.5 w-2.5' />
                      </button>
                    </div>
                    <p className='aucctus-text-tertiary mt-1 text-center text-[9px] uppercase'>
                      {color.hex}
                    </p>
                  </motion.div>
                ))}
              </AnimatePresence>

              {brandColors.length < 5 && !colorPickerOpen && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setColorPickerOpen(true)}
                  className='border-border/60 bg-muted/20 hover:border-primary/50 hover:bg-muted/40 flex h-14 w-14 items-center justify-center rounded-lg border-2 border-dashed transition-all'
                >
                  <Plus className='aucctus-text-tertiary h-4 w-4' />
                </motion.button>
              )}

              {colorPickerOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className='flex items-center gap-2'
                >
                  <input
                    type='color'
                    value={newColor}
                    onChange={(e) => setNewColor(e.target.value)}
                    className='border-border/40 h-14 w-14 cursor-pointer rounded-lg border'
                  />
                  <div className='flex flex-col gap-1'>
                    <input
                      type='text'
                      placeholder='Name'
                      value={newColorName}
                      onChange={(e) => setNewColorName(e.target.value)}
                      className='border-border/60 bg-muted/50 w-20 rounded border px-2 py-1 text-xs outline-none'
                    />
                    <div className='flex gap-1'>
                      <button
                        onClick={() => setColorPickerOpen(false)}
                        className='hover:bg-muted rounded px-2 py-1 text-xs transition-colors'
                      >
                        Cancel
                      </button>
                      <button
                        onClick={addColor}
                        className='aucctus-bg-brand-primary rounded px-2 py-1 text-xs text-white'
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Right Column */}
        <div className='flex-1 space-y-4'>
          {/* Logo Upload */}
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className='border-border/40 bg-muted/20 rounded-xl border p-4 backdrop-blur-xl'
          >
            <span className='aucctus-text-tertiary mb-3 block text-[10px] uppercase tracking-wider'>
              Company Logo
            </span>
            <div
              className={cn(
                'relative flex h-32 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-all duration-300',
                isDraggingLogo
                  ? 'border-primary bg-primary/5 scale-[1.01]'
                  : 'border-border/60 hover:border-border bg-black/10',
              )}
              onDragOver={(e) => handleDragOver(e, setIsDraggingLogo)}
              onDragLeave={() => handleDragLeave(setIsDraggingLogo)}
              onDrop={handleLogoDrop}
              onClick={() => logoInputRef.current?.click()}
            >
              <input
                ref={logoInputRef}
                type='file'
                accept='image/*'
                className='hidden'
                onChange={handleLogoSelect}
              />
              {accountLogoUrl ? (
                <div className='group relative h-full w-full'>
                  <img
                    src={accountLogoUrl}
                    alt='Company logo'
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

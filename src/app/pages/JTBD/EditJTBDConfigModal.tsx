import LiquidGlassModal from '@components/ui/LiquidGlassModal';
import {
  useAddJTBDRule,
  useDeleteJTBDConfig,
  useDeleteJTBDDocument,
  useDeleteJTBDRule,
  useJTBDConfig,
  useUpdateJTBDConfig,
  useUploadJTBDDocument,
} from '@hooks/query/jtbd.hook';
import type { IJTBDConfigDocument } from '@libs/api/types/jtbd';
import { cn } from '@libs/utils/react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import * as Dialog from '@radix-ui/react-dialog';
import { motion } from 'framer-motion';
import {
  Check,
  FileText,
  Loader2,
  Plus,
  Settings,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import React, { useCallback, useRef, useState } from 'react';

import JTBDPersonaTagger from './JTBDPersonaTagger';
import { useJTBDView } from './JTBDViewContext';

interface EditJTBDConfigModalProps {
  configUuid: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const EditJTBDConfigModal: React.FC<EditJTBDConfigModalProps> = ({
  configUuid,
  open,
  onOpenChange,
}) => {
  const { config, isLoading } = useJTBDConfig(configUuid);
  const { updateConfig } = useUpdateJTBDConfig();
  const { addRule, isAdding } = useAddJTBDRule();
  const { deleteRule } = useDeleteJTBDRule();
  const { uploadDocument, isUploading } = useUploadJTBDDocument();
  const { deleteDocument } = useDeleteJTBDDocument();
  const { deleteConfigAsync } = useDeleteJTBDConfig();
  const { setActiveConfigUuid, setEditConfigUuid } = useJTBDView();

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [ruleInput, setRuleInput] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleStartEdit = useCallback(
    (field: 'name' | 'description', currentValue: string) => {
      setEditingField(field);
      setEditValue(currentValue);
    },
    [],
  );

  const handleSaveEdit = useCallback(
    (field: 'name' | 'description') => {
      if (!config) return;
      const trimmed = editValue.trim();
      if (field === 'name' && !trimmed) return;
      updateConfig({
        configUuid: config.uuid,
        data: { [field]: trimmed },
      });
      setEditingField(null);
    },
    [config, editValue, updateConfig],
  );

  const handleCancelEdit = useCallback(() => {
    setEditingField(null);
    setEditValue('');
  }, []);

  const handlePersonasChange = useCallback(
    (uuids: string[]) => {
      if (!config) return;
      updateConfig({
        configUuid: config.uuid,
        data: { personaUuids: uuids },
      });
    },
    [config, updateConfig],
  );

  const handleAddRule = useCallback(() => {
    const text = ruleInput.trim();
    if (!text || !config) return;
    addRule({ configUuid: config.uuid, data: { ruleText: text } });
    setRuleInput('');
  }, [ruleInput, addRule, config]);

  const handleDeleteRule = useCallback(
    (ruleUuid: string) => {
      if (!config) return;
      deleteRule({ ruleUuid, configUuid: config.uuid });
    },
    [deleteRule, config],
  );

  const handleFileUpload = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0 || !config) return;
      Array.from(files).forEach((file) => {
        uploadDocument({ configUuid: config.uuid, file });
      });
    },
    [config, uploadDocument],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      handleFileUpload(e.dataTransfer.files);
    },
    [handleFileUpload],
  );

  const handleDeleteDocument = useCallback(
    (doc: IJTBDConfigDocument) => {
      if (!config) return;
      deleteDocument({ documentUuid: doc.uuid, configUuid: config.uuid });
    },
    [deleteDocument, config],
  );

  const handleDelete = useCallback(async () => {
    if (!config) return;
    try {
      await deleteConfigAsync(config.uuid);
      setShowDeleteConfirm(false);
      setActiveConfigUuid(undefined);
      setEditConfigUuid(undefined);
      onOpenChange(false);
    } catch {
      // Error toast handled by hook
    }
  }, [
    config,
    deleteConfigAsync,
    setActiveConfigUuid,
    setEditConfigUuid,
    onOpenChange,
  ]);

  if (isLoading || !config) {
    return (
      <LiquidGlassModal
        open={open}
        onOpenChange={onOpenChange}
        size='lg'
        title='Edit Discovery Area'
        titleIcon={<Settings size={18} className='text-white/80' />}
        titleClassName='text-white/80'
        animatedRim
        className='liquid-glass-dark-surface text-white'
      >
        <div className='space-y-4 p-6'>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className='h-16 animate-pulse rounded-xl bg-white/[0.05]'
            />
          ))}
        </div>
      </LiquidGlassModal>
    );
  }

  return (
    <>
      <LiquidGlassModal
        open={open}
        onOpenChange={onOpenChange}
        size='lg'
        title='Edit Discovery Area'
        titleIcon={<Settings size={18} className='text-white/60' />}
        titleClassName='text-white'
        animatedRim
        className='liquid-glass-dark-surface'
      >
        <Dialog.Description className='sr-only'>
          Edit the configuration for this discovery area
        </Dialog.Description>

        <div className='space-y-5 p-6'>
          {/* Name & Description Section */}
          <div className='space-y-3 rounded-xl border border-white/[0.08] bg-white/[0.03] p-4'>
            {/* Name */}
            <div>
              <label className='mb-1 block text-xs font-medium text-white/40'>
                Name
              </label>
              {editingField === 'name' ? (
                <div className='flex gap-2'>
                  <input
                    type='text'
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSaveEdit('name');
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    autoFocus
                    className='flex-1 rounded-lg border border-emerald-500/50 bg-white/[0.07] px-3 py-1.5 text-sm font-medium text-white outline-none'
                  />
                  <button
                    onClick={() => handleSaveEdit('name')}
                    className='rounded-lg bg-emerald-500/20 p-1.5 text-emerald-400 transition-colors hover:bg-emerald-500/30'
                  >
                    <Check className='h-3.5 w-3.5' />
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className='rounded-lg bg-white/[0.08] p-1.5 text-white/40 transition-colors hover:text-white/60'
                  >
                    <X className='h-3.5 w-3.5' />
                  </button>
                </div>
              ) : (
                <p
                  onClick={() => handleStartEdit('name', config.name)}
                  className='cursor-pointer text-sm font-medium text-white transition-colors hover:text-emerald-400'
                  title='Click to edit'
                >
                  {config.name}
                </p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className='mb-1 block text-xs font-medium text-white/40'>
                Description
              </label>
              {editingField === 'description' ? (
                <div className='space-y-2'>
                  <textarea
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Escape') handleCancelEdit();
                    }}
                    autoFocus
                    rows={2}
                    className='w-full resize-none rounded-lg border border-emerald-500/50 bg-white/[0.07] px-3 py-1.5 text-sm text-white outline-none'
                  />
                  <div className='flex justify-end gap-2'>
                    <button
                      onClick={handleCancelEdit}
                      className='rounded-lg bg-white/[0.08] px-2.5 py-1 text-xs text-white/40 transition-colors hover:text-white/60'
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit('description')}
                      className='rounded-lg bg-emerald-500/20 px-2.5 py-1 text-xs text-emerald-400 transition-colors hover:bg-emerald-500/30'
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p
                  onClick={() =>
                    handleStartEdit('description', config.description)
                  }
                  className='cursor-pointer text-sm text-white/50 transition-colors hover:text-white/70'
                  title='Click to edit'
                >
                  {config.description || 'Click to add a description...'}
                </p>
              )}
            </div>
          </div>

          {/* Rules Section */}
          <div className='rounded-xl border border-white/[0.08] bg-white/[0.03] p-4'>
            <div className='mb-3 flex items-center gap-2'>
              <Settings className='h-3.5 w-3.5 text-white/40' />
              <h3 className='text-xs font-semibold text-white/60'>
                Monitoring Rules
              </h3>
              <span className='rounded-full bg-white/[0.08] px-1.5 py-0.5 text-[10px] text-white/40'>
                {config.rules.length}
              </span>
            </div>

            {/* Add Rule Input */}
            <div className='mb-3 flex gap-2'>
              <input
                type='text'
                value={ruleInput}
                onChange={(e) => setRuleInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddRule();
                }}
                placeholder='Add a monitoring rule...'
                className='flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-emerald-500/50'
              />
              <button
                onClick={handleAddRule}
                disabled={!ruleInput.trim() || isAdding}
                className='rounded-lg border border-emerald-500/30 bg-emerald-500/20 px-3 py-1.5 text-sm font-medium text-emerald-400 transition-all hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-40'
              >
                {isAdding ? (
                  <Loader2 className='h-3.5 w-3.5 animate-spin' />
                ) : (
                  <Plus className='h-3.5 w-3.5' />
                )}
              </button>
            </div>

            {/* Rules List */}
            {config.rules.length === 0 ? (
              <p className='py-3 text-center text-xs text-white/30'>
                No rules yet. Add rules to guide the scan.
              </p>
            ) : (
              <div className='max-h-[180px] space-y-1.5 overflow-y-auto'>
                {config.rules.map((rule, index) => (
                  <motion.div
                    key={rule.uuid}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className='group flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 transition-colors hover:bg-white/[0.05]'
                  >
                    <span className='flex-1 text-xs text-white/70'>
                      {rule.ruleText}
                    </span>
                    <button
                      onClick={() => handleDeleteRule(rule.uuid)}
                      className='text-white/30 opacity-0 transition-all hover:text-red-400 group-hover:opacity-100'
                    >
                      <Trash2 className='h-3 w-3' />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Personas Section */}
          <div className='rounded-xl border border-white/[0.08] bg-white/[0.03] p-4'>
            <JTBDPersonaTagger
              selectedUuids={config.personaUuids}
              onChange={handlePersonasChange}
            />
          </div>

          {/* Documents Section */}
          <div className='rounded-xl border border-white/[0.08] bg-white/[0.03] p-4'>
            <div className='mb-3 flex items-center gap-2'>
              <FileText className='h-3.5 w-3.5 text-white/40' />
              <h3 className='text-xs font-semibold text-white/60'>
                Context Documents
              </h3>
              <span className='rounded-full bg-white/[0.08] px-1.5 py-0.5 text-[10px] text-white/40'>
                {config.documents.length}
              </span>
            </div>

            {/* Drop Zone */}
            <input
              ref={fileInputRef}
              type='file'
              multiple
              accept='.pdf,.txt,.doc,.docx,.csv,.xlsx'
              onChange={(e) => handleFileUpload(e.target.files)}
              className='hidden'
            />
            <div
              onClick={() => !isUploading && fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={cn(
                'mb-3 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-4 transition-all',
                isDragOver
                  ? 'border-emerald-500/50 bg-emerald-500/[0.08]'
                  : 'border-white/[0.1] bg-white/[0.02] hover:border-white/[0.2]',
                isUploading && 'cursor-not-allowed opacity-50',
              )}
            >
              {isUploading ? (
                <Loader2 className='mb-1.5 h-4 w-4 animate-spin text-emerald-400' />
              ) : (
                <Upload className='mb-1.5 h-4 w-4 text-white/30' />
              )}
              <p className='text-xs text-white/50'>
                {isUploading ? 'Uploading...' : 'Drop files here or click'}
              </p>
              <p className='mt-0.5 text-[10px] text-white/25'>
                PDF, TXT, DOC, DOCX, CSV, XLSX
              </p>
            </div>

            {/* Document List */}
            {config.documents.length > 0 && (
              <div className='space-y-1.5'>
                {config.documents.map((doc, index) => (
                  <motion.div
                    key={doc.uuid}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className='group flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 transition-colors hover:bg-white/[0.05]'
                  >
                    <FileText className='h-3.5 w-3.5 shrink-0 text-white/30' />
                    <span className='flex-1 truncate text-xs text-white/70'>
                      {doc.originalFilename}
                    </span>
                    <span className='shrink-0 text-[10px] text-white/30'>
                      {formatFileSize(doc.fileSize)}
                    </span>
                    <button
                      onClick={() => handleDeleteDocument(doc)}
                      className='text-white/30 opacity-0 transition-all hover:text-red-400 group-hover:opacity-100'
                    >
                      <Trash2 className='h-3 w-3' />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Danger Zone */}
          <div className='rounded-xl border border-red-500/[0.15] bg-red-500/[0.03] p-4'>
            <div className='flex items-center justify-between'>
              <div>
                <h3 className='text-xs font-semibold text-red-400'>
                  Danger Zone
                </h3>
                <p className='mt-0.5 text-[10px] text-white/40'>
                  Deleting removes all rules, documents, and scan results
                </p>
              </div>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className='rounded-lg border border-red-500/20 bg-red-500/10 px-2.5 py-1 text-xs font-medium text-red-400/70 transition-all hover:bg-red-500/20 hover:text-red-400'
              >
                <Trash2 className='h-3 w-3' />
              </button>
            </div>
          </div>
        </div>
      </LiquidGlassModal>

      {/* Delete confirmation */}
      <AlertDialog.Root
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      >
        <AlertDialog.Portal>
          <AlertDialog.Overlay className='fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm' />
          <AlertDialog.Content className='fixed left-1/2 top-1/2 z-[60] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-white/15 bg-black/95 p-6 shadow-2xl backdrop-blur-xl'>
            <AlertDialog.Title className='text-base font-semibold text-white'>
              Delete discovery area?
            </AlertDialog.Title>
            <AlertDialog.Description className='mt-2 text-sm text-white/50'>
              &quot;{config.name}&quot; and all its scan data will be
              permanently removed. This cannot be undone.
            </AlertDialog.Description>
            <div className='mt-5 flex justify-end gap-2'>
              <AlertDialog.Cancel asChild>
                <button className='rounded-md border border-white/15 px-3 py-1.5 text-sm text-white/60 transition-colors hover:border-white/30 hover:text-white'>
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button
                  onClick={handleDelete}
                  className='rounded-md bg-red-500/80 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-500'
                >
                  Delete
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
};

export default EditJTBDConfigModal;

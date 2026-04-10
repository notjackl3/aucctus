import { ToggleSwitch } from '@components';
import {
  useAddJTBDRule,
  useCreateJTBDConfig,
  useDeleteJTBDConfig,
  useDeleteJTBDDocument,
  useDeleteJTBDRule,
  useJTBDConfig,
  useJTBDConfigs,
  useJTBDScanSocketEvents,
  useTriggerJTBDScan,
  useUpdateJTBDConfig,
  useUpdateJTBDRule,
  useUploadJTBDDocument,
} from '@hooks/query/jtbd.hook';
import type {
  IJTBDConfigDetail,
  IJTBDConfigDocument,
  IJTBDRule,
} from '@libs/api/types/jtbd';
import { cn } from '@libs/utils/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  Plus,
  Radar,
  Settings,
  Trash2,
  Upload,
  Users,
  X,
} from 'lucide-react';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JTBDPersonaTagger from './JTBDPersonaTagger';

// ============================================
// Helpers
// ============================================

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// ============================================
// Create Config Form
// ============================================

interface CreateConfigFormProps {
  onCreated: (uuid: string) => void;
}

const CreateConfigForm: React.FC<CreateConfigFormProps> = ({ onCreated }) => {
  const { createConfigAsync, isCreating } = useCreateJTBDConfig();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPersonaUuids, setSelectedPersonaUuids] = useState<string[]>(
    [],
  );
  const [initialRules, setInitialRules] = useState<string[]>([]);
  const [ruleInput, setRuleInput] = useState('');

  const handleAddInitialRule = useCallback(() => {
    const text = ruleInput.trim();
    if (text) {
      setInitialRules((prev) => [...prev, text]);
      setRuleInput('');
    }
  }, [ruleInput]);

  const handleRemoveInitialRule = useCallback((index: number) => {
    setInitialRules((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!name.trim()) return;
    try {
      const result = await createConfigAsync({
        name: name.trim(),
        description: description.trim() || undefined,
        personaUuids:
          selectedPersonaUuids.length > 0 ? selectedPersonaUuids : undefined,
        rules: initialRules.length > 0 ? initialRules : undefined,
      });
      onCreated((result as { uuid: string }).uuid);
    } catch {
      // toast handled by hook
    }
  }, [
    name,
    description,
    selectedPersonaUuids,
    initialRules,
    createConfigAsync,
    onCreated,
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='mx-auto max-w-2xl'
    >
      <div className='space-y-5 rounded-2xl border border-white/[0.1] bg-white/[0.05] p-6 backdrop-blur-xl'>
        <h2 className='text-lg font-semibold text-white'>
          Create JTBD Monitoring Area
        </h2>

        {/* Name */}
        <div>
          <label className='mb-1.5 block text-sm text-white/60'>Name</label>
          <input
            type='text'
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='e.g. Consumer Pain Points'
            className='w-full rounded-xl border border-white/[0.1] bg-white/[0.07] px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-emerald-500/50'
          />
        </div>

        {/* Description */}
        <div>
          <label className='mb-1.5 block text-sm text-white/60'>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Describe what this monitoring area should focus on...'
            rows={3}
            className='w-full resize-none rounded-xl border border-white/[0.1] bg-white/[0.07] px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-emerald-500/50'
          />
        </div>

        {/* Personas */}
        <JTBDPersonaTagger
          selectedUuids={selectedPersonaUuids}
          onChange={setSelectedPersonaUuids}
        />

        {/* Initial Rules */}
        <div>
          <label className='mb-1.5 block text-sm text-white/60'>
            Monitoring Rules (optional)
          </label>
          <div className='mb-2 flex gap-2'>
            <input
              type='text'
              value={ruleInput}
              onChange={(e) => setRuleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAddInitialRule();
              }}
              placeholder='e.g. Focus on underserved millennials...'
              className='flex-1 rounded-xl border border-white/[0.1] bg-white/[0.07] px-4 py-2 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-emerald-500/50'
            />
            <button
              onClick={handleAddInitialRule}
              disabled={!ruleInput.trim()}
              className='rounded-xl border border-emerald-500/30 bg-emerald-500/20 px-3 py-2 text-sm font-medium text-emerald-400 transition-all hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-40'
            >
              <Plus className='h-4 w-4' />
            </button>
          </div>
          <AnimatePresence>
            {initialRules.map((rule, index) => (
              <motion.div
                key={`${rule}-${index}`}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className='mb-1.5 flex items-center gap-2'
              >
                <span className='flex-1 rounded-lg border border-white/[0.08] bg-white/[0.05] px-3 py-1.5 text-sm text-white/70'>
                  {rule}
                </span>
                <button
                  onClick={() => handleRemoveInitialRule(index)}
                  className='text-white/30 transition-colors hover:text-red-400'
                >
                  <X className='h-3.5 w-3.5' />
                </button>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || isCreating}
          className='flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/20 px-6 py-3 text-sm font-semibold text-emerald-400 transition-all hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-40'
        >
          {isCreating ? (
            <Loader2 className='h-4 w-4 animate-spin' />
          ) : (
            <Plus className='h-4 w-4' />
          )}
          {isCreating ? 'Creating...' : 'Create Monitoring Area'}
        </button>
      </div>
    </motion.div>
  );
};

// ============================================
// Rule Management Section
// ============================================

interface RuleSectionProps {
  config: IJTBDConfigDetail;
}

const RuleSection: React.FC<RuleSectionProps> = ({ config }) => {
  const { addRule, isAdding } = useAddJTBDRule();
  const { updateRule } = useUpdateJTBDRule();
  const { deleteRule, isDeleting } = useDeleteJTBDRule();
  const [ruleInput, setRuleInput] = useState('');
  const [isOpen, setIsOpen] = useState(true);

  const handleAddRule = useCallback(() => {
    const text = ruleInput.trim();
    if (!text) return;
    addRule({ configUuid: config.uuid, data: { ruleText: text } });
    setRuleInput('');
  }, [ruleInput, addRule, config.uuid]);

  const handleToggleRule = useCallback(
    (rule: IJTBDRule) => {
      updateRule({
        ruleUuid: rule.uuid,
        configUuid: config.uuid,
        data: { isActive: !rule.isActive },
      });
    },
    [updateRule, config.uuid],
  );

  const handleDeleteRule = useCallback(
    (ruleUuid: string) => {
      deleteRule({ ruleUuid, configUuid: config.uuid });
    },
    [deleteRule, config.uuid],
  );

  return (
    <div className='overflow-hidden rounded-2xl border border-white/[0.1] bg-white/[0.05] backdrop-blur-xl'>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className='flex w-full items-center justify-between p-5 text-left'
      >
        <div className='flex items-center gap-3'>
          <Settings className='h-4 w-4 text-white/40' />
          <h3 className='text-sm font-semibold text-white'>Monitoring Rules</h3>
          <span className='rounded-full bg-white/[0.08] px-2 py-0.5 text-xs text-white/40'>
            {config.rules.length}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className='h-4 w-4 text-white/40' />
        ) : (
          <ChevronDown className='h-4 w-4 text-white/40' />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            <div className='space-y-3 px-5 pb-5'>
              {/* Add Rule Input */}
              <div className='flex gap-2'>
                <input
                  type='text'
                  value={ruleInput}
                  onChange={(e) => setRuleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddRule();
                  }}
                  placeholder='Add a monitoring rule...'
                  className='flex-1 rounded-xl border border-white/[0.1] bg-white/[0.07] px-4 py-2 text-sm text-white placeholder-white/30 outline-none transition-colors focus:border-emerald-500/50'
                />
                <button
                  onClick={handleAddRule}
                  disabled={!ruleInput.trim() || isAdding}
                  className='rounded-xl border border-emerald-500/30 bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-400 transition-all hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-40'
                >
                  {isAdding ? (
                    <Loader2 className='h-4 w-4 animate-spin' />
                  ) : (
                    'Add Rule'
                  )}
                </button>
              </div>

              {/* Rules List */}
              {config.rules.length === 0 ? (
                <p className='py-4 text-center text-xs text-white/30'>
                  No rules yet. Add rules to guide the scan.
                </p>
              ) : (
                <div className='space-y-1.5'>
                  {config.rules.map((rule, index) => (
                    <motion.div
                      key={rule.uuid}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className='group flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 transition-colors hover:bg-white/[0.06]'
                    >
                      <ToggleSwitch
                        checked={rule.isActive}
                        onChange={() => handleToggleRule(rule)}
                        size='sm'
                        variant='success'
                        aria-label={`Toggle rule: ${rule.ruleText}`}
                      />
                      <span
                        className={cn(
                          'flex-1 text-sm',
                          rule.isActive
                            ? 'text-white/70'
                            : 'text-white/30 line-through',
                        )}
                      >
                        {rule.ruleText}
                      </span>
                      <button
                        onClick={() => handleDeleteRule(rule.uuid)}
                        disabled={isDeleting}
                        className='text-white/30 opacity-0 transition-all hover:text-red-400 group-hover:opacity-100'
                      >
                        <Trash2 className='h-3.5 w-3.5' />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// Document Management Section
// ============================================

interface DocumentSectionProps {
  config: IJTBDConfigDetail;
}

const DocumentSection: React.FC<DocumentSectionProps> = ({ config }) => {
  const { uploadDocument, isUploading } = useUploadJTBDDocument();
  const { deleteDocument, isDeleting } = useDeleteJTBDDocument();
  const [isDragOver, setIsDragOver] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = useCallback(
    (files: FileList | null) => {
      if (!files || files.length === 0) return;
      Array.from(files).forEach((file) => {
        uploadDocument({ configUuid: config.uuid, file });
      });
    },
    [config.uuid, uploadDocument],
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

  const handleClick = useCallback(() => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  }, [isUploading]);

  const handleDeleteDocument = useCallback(
    (doc: IJTBDConfigDocument) => {
      deleteDocument({ documentUuid: doc.uuid, configUuid: config.uuid });
    },
    [deleteDocument, config.uuid],
  );

  return (
    <div className='overflow-hidden rounded-2xl border border-white/[0.1] bg-white/[0.05] backdrop-blur-xl'>
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className='flex w-full items-center justify-between p-5 text-left'
      >
        <div className='flex items-center gap-3'>
          <FileText className='h-4 w-4 text-white/40' />
          <h3 className='text-sm font-semibold text-white'>
            Context Documents
          </h3>
          <span className='rounded-full bg-white/[0.08] px-2 py-0.5 text-xs text-white/40'>
            {config.documents.length}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className='h-4 w-4 text-white/40' />
        ) : (
          <ChevronDown className='h-4 w-4 text-white/40' />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className='overflow-hidden'
          >
            <div className='space-y-3 px-5 pb-5'>
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
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                  'flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-4 py-6 transition-all',
                  isDragOver
                    ? 'border-emerald-500/50 bg-emerald-500/[0.08]'
                    : 'border-white/[0.12] bg-white/[0.03] hover:border-white/[0.2]',
                  isUploading && 'cursor-not-allowed opacity-50',
                )}
              >
                {isUploading ? (
                  <Loader2 className='mb-2 h-5 w-5 animate-spin text-emerald-400' />
                ) : (
                  <Upload className='mb-2 h-5 w-5 text-white/30' />
                )}
                <p className='text-sm text-white/50'>
                  {isUploading
                    ? 'Uploading...'
                    : 'Drop files here or click to browse'}
                </p>
                <p className='mt-1 text-xs text-white/25'>
                  PDF, TXT, DOC, DOCX, CSV, XLSX
                </p>
              </div>

              {/* Document List */}
              {config.documents.length > 0 && (
                <div className='space-y-1.5'>
                  {config.documents.map((doc, index) => (
                    <motion.div
                      key={doc.uuid}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className='group flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 transition-colors hover:bg-white/[0.06]'
                    >
                      <FileText className='h-4 w-4 shrink-0 text-white/30' />
                      <span className='flex-1 truncate text-sm text-white/70'>
                        {doc.originalFilename}
                      </span>
                      <span className='shrink-0 text-xs text-white/30'>
                        {formatFileSize(doc.fileSize)}
                      </span>
                      <button
                        onClick={() => handleDeleteDocument(doc)}
                        disabled={isDeleting}
                        className='text-white/30 opacity-0 transition-all hover:text-red-400 group-hover:opacity-100'
                      >
                        <Trash2 className='h-3.5 w-3.5' />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================
// Config Detail View
// ============================================

interface ConfigDetailProps {
  configUuid: string;
  onDeleted?: () => void;
}

const ConfigDetail: React.FC<ConfigDetailProps> = ({
  configUuid,
  onDeleted,
}) => {
  const { config, isLoading } = useJTBDConfig(configUuid);
  const { updateConfig, isUpdating } = useUpdateJTBDConfig();
  const { deleteConfig, isDeleting } = useDeleteJTBDConfig();
  const { triggerScan, isTriggering } = useTriggerJTBDScan();
  const { scanProgress } = useJTBDScanSocketEvents(configUuid);

  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleDelete = useCallback(() => {
    if (!config) return;
    deleteConfig(config.uuid);
    setShowDeleteConfirm(false);
    onDeleted?.();
  }, [config, deleteConfig, onDeleted]);

  const handleTriggerScan = useCallback(() => {
    if (configUuid) {
      triggerScan(configUuid);
    }
  }, [configUuid, triggerScan]);

  if (isLoading || !config) {
    return (
      <div className='mx-auto max-w-2xl space-y-4'>
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className='h-20 animate-pulse rounded-2xl bg-white/[0.05]'
          />
        ))}
      </div>
    );
  }

  const isScanning = config.isScanning || scanProgress.isScanning;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className='mx-auto max-w-2xl space-y-4'
    >
      {/* Header with name and controls */}
      <div className='space-y-4 rounded-2xl border border-white/[0.1] bg-white/[0.05] p-5 backdrop-blur-xl'>
        {/* Name */}
        <div>
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
                className='flex-1 rounded-xl border border-emerald-500/50 bg-white/[0.07] px-4 py-2 text-lg font-semibold text-white outline-none'
              />
              <button
                onClick={() => handleSaveEdit('name')}
                disabled={isUpdating}
                className='rounded-lg bg-emerald-500/20 p-2 text-emerald-400 transition-colors hover:bg-emerald-500/30'
              >
                <Check className='h-4 w-4' />
              </button>
              <button
                onClick={handleCancelEdit}
                className='rounded-lg bg-white/[0.08] p-2 text-white/40 transition-colors hover:text-white/60'
              >
                <X className='h-4 w-4' />
              </button>
            </div>
          ) : (
            <h2
              onClick={() => handleStartEdit('name', config.name)}
              className='cursor-pointer text-lg font-semibold text-white transition-colors hover:text-emerald-400'
              title='Click to edit'
            >
              {config.name}
            </h2>
          )}
        </div>

        {/* Description */}
        <div>
          {editingField === 'description' ? (
            <div className='space-y-2'>
              <textarea
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                autoFocus
                rows={3}
                className='w-full resize-none rounded-xl border border-emerald-500/50 bg-white/[0.07] px-4 py-2 text-sm text-white outline-none'
              />
              <div className='flex justify-end gap-2'>
                <button
                  onClick={handleCancelEdit}
                  className='rounded-lg bg-white/[0.08] px-3 py-1.5 text-xs text-white/40 transition-colors hover:text-white/60'
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSaveEdit('description')}
                  disabled={isUpdating}
                  className='rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs text-emerald-400 transition-colors hover:bg-emerald-500/30'
                >
                  Save
                </button>
              </div>
            </div>
          ) : (
            <p
              onClick={() => handleStartEdit('description', config.description)}
              className='cursor-pointer text-sm text-white/50 transition-colors hover:text-white/70'
              title='Click to edit'
            >
              {config.description || 'Click to add a description...'}
            </p>
          )}
        </div>

        {/* Personas */}
        <div className='border-t border-white/[0.08] pt-2'>
          <JTBDPersonaTagger
            selectedUuids={config.personaUuids}
            onChange={handlePersonasChange}
          />
        </div>

        {/* Scan Status & Action */}
        <div className='flex items-center justify-between border-t border-white/[0.08] pt-2'>
          <div>
            {config.lastScanAt ? (
              <p className='text-xs text-white/40'>
                Last scan:{' '}
                {new Date(config.lastScanAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            ) : (
              <p className='text-xs text-white/30'>No scans yet</p>
            )}
            {scanProgress.isScanning && (
              <p className='mt-0.5 text-xs text-emerald-400'>
                {scanProgress.message}
              </p>
            )}
          </div>
          <button
            onClick={handleTriggerScan}
            disabled={isTriggering || isScanning}
            className='flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/20 px-4 py-2 text-sm font-medium text-emerald-400 transition-all hover:bg-emerald-500/30 disabled:cursor-not-allowed disabled:opacity-40'
          >
            {isScanning ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Radar className='h-4 w-4' />
            )}
            {isScanning ? 'Scanning...' : 'Run Scan'}
          </button>
        </div>
      </div>

      {/* Rules Section */}
      <RuleSection config={config} />

      {/* Documents Section */}
      <DocumentSection config={config} />

      {/* Danger Zone */}
      <div className='rounded-2xl border border-red-500/[0.15] bg-red-500/[0.03] p-5'>
        <div className='flex items-center justify-between'>
          <div>
            <h3 className='text-sm font-semibold text-red-400'>Danger Zone</h3>
            <p className='mt-0.5 text-xs text-white/40'>
              Deleting a config removes all rules, documents, and scan results
            </p>
          </div>
          {showDeleteConfirm ? (
            <div className='flex gap-2'>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className='rounded-lg bg-white/[0.08] px-3 py-1.5 text-xs text-white/50 transition-colors hover:text-white/70'
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className='rounded-lg border border-red-500/30 bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/30 disabled:opacity-40'
              >
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className='rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400/70 transition-all hover:bg-red-500/20 hover:text-red-400'
            >
              <Trash2 className='h-3.5 w-3.5' />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// Config List View
// ============================================

interface ConfigListProps {
  onSelect: (uuid: string) => void;
  onCreate: () => void;
}

const ConfigList: React.FC<ConfigListProps> = ({ onSelect, onCreate }) => {
  const { configs, isLoading } = useJTBDConfigs();

  if (isLoading) {
    return (
      <div className='mx-auto max-w-2xl space-y-3'>
        {[1, 2].map((i) => (
          <div
            key={i}
            className='h-20 animate-pulse rounded-2xl bg-white/[0.05]'
          />
        ))}
      </div>
    );
  }

  if (configs.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className='mx-auto max-w-2xl py-16 text-center'
      >
        <Users className='mx-auto mb-4 h-12 w-12 text-white/20' />
        <h3 className='mb-2 text-lg font-semibold text-white/60'>
          No Monitoring Areas
        </h3>
        <p className='mb-6 text-sm text-white/30'>
          Create a monitoring area to start discovering jobs to be done.
        </p>
        <button
          onClick={onCreate}
          className='inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/20 px-6 py-3 text-sm font-semibold text-emerald-400 transition-all hover:bg-emerald-500/30'
        >
          <Plus className='h-4 w-4' />
          Create Monitoring Area
        </button>
      </motion.div>
    );
  }

  return (
    <div className='mx-auto max-w-2xl space-y-3'>
      {configs.map((config, index) => (
        <motion.button
          key={config.uuid}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onSelect(config.uuid)}
          className='group w-full rounded-2xl border border-white/[0.1] bg-white/[0.05] p-5 text-left backdrop-blur-xl transition-all hover:bg-white/[0.08]'
        >
          <div className='mb-2 flex items-center justify-between'>
            <h3 className='text-sm font-semibold text-white transition-colors group-hover:text-emerald-400'>
              {config.name}
            </h3>
            <div className='flex items-center gap-2'>
              {config.isScanning && (
                <span className='flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400'>
                  <Loader2 className='h-3 w-3 animate-spin' />
                  Scanning
                </span>
              )}
            </div>
          </div>
          <div className='flex items-center gap-4 text-xs text-white/40'>
            <span>{config.rulesCount} rules</span>
            <span>{config.documentsCount} documents</span>
            {config.personaUuids.length > 0 && (
              <span className='text-emerald-400/60'>
                {config.personaUuids.length} persona
                {config.personaUuids.length !== 1 ? 's' : ''}
              </span>
            )}
            {config.lastScanAt && (
              <span>
                Last scan:{' '}
                {new Date(config.lastScanAt).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            )}
          </div>
        </motion.button>
      ))}

      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: configs.length * 0.05 }}
        onClick={onCreate}
        className='flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-white/[0.1] py-4 text-sm text-white/30 transition-all hover:border-white/[0.2] hover:text-white/50'
      >
        <Plus className='h-4 w-4' />
        Add Monitoring Area
      </motion.button>
    </div>
  );
};

// ============================================
// Main Config Page
// ============================================

type ConfigView = 'list' | 'create' | 'detail';

interface JTBDConfigPageProps {
  onBack?: () => void;
  initialConfigUuid?: string;
}

export const JTBDConfigPage: React.FC<JTBDConfigPageProps> = ({
  onBack,
  initialConfigUuid,
}) => {
  const navigate = useNavigate();
  const { configs } = useJTBDConfigs();
  const [view, setView] = useState<ConfigView>(
    initialConfigUuid ? 'detail' : 'list',
  );
  const [selectedConfigUuid, setSelectedConfigUuid] = useState<string | null>(
    initialConfigUuid ?? null,
  );

  // Auto-select the first config if there's exactly one
  const effectiveView = useMemo(() => {
    if (view === 'list' && configs.length === 1 && !selectedConfigUuid) {
      return 'detail';
    }
    return view;
  }, [view, configs.length, selectedConfigUuid]);

  const effectiveConfigUuid = useMemo(() => {
    if (selectedConfigUuid) return selectedConfigUuid;
    if (configs.length === 1) return configs[0].uuid;
    return null;
  }, [selectedConfigUuid, configs]);

  const handleSelect = useCallback((uuid: string) => {
    setSelectedConfigUuid(uuid);
    setView('detail');
  }, []);

  const handleCreate = useCallback(() => {
    setView('create');
  }, []);

  const handleCreated = useCallback((uuid: string) => {
    setSelectedConfigUuid(uuid);
    setView('detail');
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedConfigUuid(null);
    setView('list');
  }, []);

  const showBackToList = configs.length > 1 && effectiveView !== 'list';

  return (
    <div className='flex h-full flex-1 flex-col overflow-auto'>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className='sticky top-0 z-10 flex items-center justify-between border-b border-white/[0.08] bg-black/40 px-6 py-4 backdrop-blur-xl'
      >
        <div className='flex items-center gap-3'>
          <button
            onClick={() =>
              onBack ? onBack() : navigate('/playground?mode=jtbd')
            }
            className='rounded-lg p-2 text-white/40 transition-all hover:bg-white/[0.08] hover:text-white/70'
          >
            <ArrowLeft className='h-4 w-4' />
          </button>
          <h1 className='text-base font-semibold text-white'>
            JTBD Configuration
          </h1>
        </div>
        <div className='flex items-center gap-2'>
          {showBackToList && (
            <button
              onClick={handleBackToList}
              className='rounded-lg px-3 py-1.5 text-xs text-white/40 transition-all hover:bg-white/[0.08] hover:text-white/70'
            >
              All Configs
            </button>
          )}
          {effectiveView !== 'create' && (
            <button
              onClick={handleCreate}
              className='flex items-center gap-1.5 rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-400 transition-all hover:bg-emerald-500/30'
            >
              <Plus className='h-3.5 w-3.5' />
              New
            </button>
          )}
        </div>
      </motion.div>

      {/* Content */}
      <div className='flex-1 p-6'>
        <AnimatePresence mode='wait'>
          {effectiveView === 'list' && (
            <ConfigList
              key='list'
              onSelect={handleSelect}
              onCreate={handleCreate}
            />
          )}
          {effectiveView === 'create' && (
            <CreateConfigForm key='create' onCreated={handleCreated} />
          )}
          {effectiveView === 'detail' && effectiveConfigUuid && (
            <ConfigDetail
              key={effectiveConfigUuid}
              configUuid={effectiveConfigUuid}
              onDeleted={handleBackToList}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
